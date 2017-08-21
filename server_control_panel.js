var fs = require('fs');
var express = require('express');
var http = require('http');
var https = require('https');
var http_app = express();
var app = express();
var ssl = require('./ssl_config');
var form = require('express-form');
var body_parser = require('body-parser');
var favicon = require('serve-favicon');
var session = require('express-session');
var mongo_store = require('connect-mongo')(session);
var passport = require('passport');
var database = require('./database/connection');
var flash = require('connect-flash');
var file_upload = require('express-fileupload');
var nodemailer = require('nodemailer');
var control_panel_sessions = require('./database/sessions').control_panel;

require('./control_panel/auth/passport')(passport, database);

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'trasce4eva@gmail.com',
        pass: 'admin@trasce4eva'
    }
});

let mail_options = {
	from: '"Trascendencias" <trasce4eva@gmail.com>',
	subject: 'Se parte del Staff de Trascendencias'
};

form.configure({
	passThrough: true
});
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: 'other_super_secret_string',
	store: new mongo_store({ mongooseConnection: control_panel_sessions })
}));
app.use(flash());
app.use(file_upload());
app.use(passport.initialize());
app.use(passport.session());

app.use(favicon(__dirname + '/favicon.ico'));
app.use('/registro/resources', express.static(__dirname + '/control_panel/pages/registro/resources'));
app.use('/admin/resources', express.static(__dirname + '/control_panel/pages/admin/resources'));
app.use(body_parser.urlencoded({
	extended: true
}));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/control_panel/pages');

http_app.get('*', function(req, res) {
	res.redirect('https://trascendencias.org:8443' + req.url);
});

app.get('/login', function(req, res) {
	res.render('login', { message: req.flash('message') });
});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/login');
});

app.get('/registro-staff', form(), valid_registration, function(req, res) {
	res.render('registro-staff', {
		message: req.flash('message'),
		email: req.form.email
	});
});

app.get('/consulta-:collection', check_session, function(req, res) {
	database.consult(req.query.codigo, function(err, doc) {
		if(err) {
			throw err;
		}

		return res.render('consulta-' + req.params.collection, { consulta: doc });
	});
})

app.get('/registro/lista', check_session, function(req, res) {
	database.list(req.query.q, function(err, collection) {
		if(err) {
			throw err;
		}

		return res.render('registro/lista', { lista: collection });
	});
})

app.get('/:module/:page?', check_session, protect, function(req, res) {
	return res.render((req.baseUrl + req.path).substring(1), function(err, html) {
		if (err) {
			if (err.message.indexOf('Failed to lookup view') !== -1) {
				return res.status(404).send('404');
			}

			throw err;
		}

		res.send(html);
	});
});

app.get('/', check_session, function(req, res) {
	if(req.user.position == 'Administrator') {
		res.redirect('/admin/menu');
	}
	else {
		res.redirect('/registro/menu');
	}
});

app.post('/login', form(), passport.authenticate('login', {
	failureRedirect: '/login',
	failureFlash: true
}), function(req, res) {
	if(req.user.position == 'Administrator') {
		return res.redirect('/admin/menu');
	}
	
	res.redirect('/registro/menu');
});

app.post('/generar-claves', form(
	form.field('email').trim()
), function(req, res) {
	let verification_hash = database.generate_hash(req.form.email);
	mail_options.text = 'Da click al siguiente link para ser parte del Staff de Trascendencias: https://trascendencias.org:8443/registro-staff?email=' + req.form.email + '&key=' + verification_hash;
	mail_options.to = req.form.email;
	transporter.sendMail(mail_options, (error, info) => {
		if (error) {
			return console.log(error);
		}
	});

	res.redirect('/admin/menu');
})

app.post('/signup', form(), passport.authenticate('signup', {
	failureFlash: true
}), function(req, res) {
	res.redirect('/');
});

app.post('/registro-:collection', form(), function(req, res) {
	database.register[req.params.collection](req.form);
	res.redirect('avisos?q=registro');
});

function check_session(req, res, next) {
	if(!req.isAuthenticated()) {
		return res.redirect('/login');
	}

	next();
}

function protect(req, res, next) {
	if(req.params.module == 'admin' && req.user.position != 'Administrator') {
		res.redirect('/registro/menu');
	}

	next();
}

function valid_registration(req, res, next) {
	if(!database.valid_hash(req.form.email, req.form.key)) {
		return res.send('Clave de verificaion invalida.');
	}

	database.used_email(req.form.email, function(err, used) {
		if(err) {
			throw err;
		}
		else if(used) {
			return res.send('Correo ya registrado.');
		}
		else {
			next();
		}
	});
}

https.createServer({
	ca: fs.readFileSync(ssl.chain),
	key: fs.readFileSync(ssl.privkey),
	cert: fs.readFileSync(ssl.cert)
}, app).listen(8443);

http.createServer(http_app).listen(8080);