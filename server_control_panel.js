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
var cookie_session = require('cookie-session');
var file_upload = require('express-fileupload');
var nodemailer = require('nodemailer');

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
app.use(cookie_session({
	secret: 'secret_string'
}));
app.use(flash());
app.use(file_upload());
app.use(passport.initialize());
app.use(passport.session());

app.use(favicon(__dirname + '/favicon.ico'));
app.use('/registro/resources', express.static(__dirname + '/control_panel/pages/registro/resources'));
app.use('/admin/resources', express.static(__dirname + '/control_panel/pages/admin/resources'));
app.use('/registro/files', express.static(__dirname + '/database/files'));
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

app.get('/registro/lista', check_session, function(req, res) {
	database.list(req.query.q, function(err, collection) {
		if(catch_errors(err, collection)) {
			return res.redirect('/registro/avisos?titulo=error');
		}
		
		return res.render('registro/lista', {
			lista: collection,
			user: req.user
		});
	});
})

app.get('/registro/consulta-:collection', check_session, function(req, res) {
	database.consult(req.params.collection, req.query.codigo, function(err, doc) {
		if(catch_errors(err, doc)) {
			return res.redirect('/registro/avisos?titulo=error');
		}

		return res.render('registro/consulta-' + req.params.collection, {
			consulta: doc,
			user: req.user
		});
	});
});

app.get('/:module/:page?', check_session, protect, function(req, res) {
	return res.render((req.baseUrl + req.path).substring(1), { user: req.user }, function(err, html) {
		if(catch_errors(err)) {
			return res.redirect('/registro/avisos?titulo=error');
		}

		return res.send(html);
	});
});

app.get('/', check_session, function(req, res) {
	if(req.user.position == 'Administrator') {
		return res.redirect('/admin/menu');
	}
	else {
		return res.redirect('/registro/menu');
	}
});

app.post('/login', form(), passport.authenticate('login', {
	failureRedirect: '/login',
	failureFlash: true
}), function(req, res) {
	if(req.user.position == 'Administrator') {
		return res.redirect('/admin/menu');
	}
	
	return res.redirect('/registro/menu');
});

app.post('/generar-claves', form(
	form.field('email').trim()
), function(req, res) {
	let verification_hash = database.generate_hash(req.form.email);
	mail_options.text = 'Da click al siguiente link para ser parte del Staff de Trascendencias: https://trascendencias.org:8443/registro-staff?email=' + req.form.email + '&key=' + verification_hash;
	mail_options.to = req.form.email;
	transporter.sendMail(mail_options, (err, info) => {
		if(catch_errors(err)) {
			return res.redirect('/registro/avisos?titulo=error');
		}

		return res.redirect('/admin/menu');
	});
})

app.post('/signup', form(), passport.authenticate('signup', {
	failureFlash: true
}), function(req, res) {
	return res.redirect('/');
});

app.post('/registro-:group', check_session, form(), function(req, res) {
	database.register[req.params.group](req.form, req.files, function(err) {
		if(catch_errors(err)) {
			return res.redirect('/registro/avisos?titulo=error');
		}

		return res.redirect('registro/avisos?titulo=registro');
	});
});

app.post('/eliminar-:collection', check_session, function(req, res) {
	database.remove(req.params.collection, req.query.codigo, function(err) {
		if(catch_errors(err)) {
			return res.redirect('/registro/avisos?titulo=error');
		}

		return res.redirect('registro/avisos?titulo=eliminar');
	});
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
		if(catch_errors(err, !used)) {
			return res.redirect('/registro/avisos?titulo=error');
		}

		next();
	});
}

function catch_errors(err, object = true) {
	if(err) {
		console.log(err);
		return true;
	}

	if(!object) {
		console.log(new Error('Empty object'));
		return true;
	}

	return false;
}

https.createServer({
	ca: fs.readFileSync(ssl.chain),
	key: fs.readFileSync(ssl.privkey),
	cert: fs.readFileSync(ssl.cert)
}, app).listen(8443);

http.createServer(http_app).listen(8080);