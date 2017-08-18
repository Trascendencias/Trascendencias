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
var file_upload = require('express-fileupload')
var control_panel_sessions = require('./database/sessions').control_panel;

require('./control_panel/auth/passport')(passport);

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
app.use(passport.initialize());
app.use(passport.session());

app.use(favicon(__dirname + '/favicon.ico'));
app.use('/resources', express.static(__dirname + '/control_panel/resources'));
app.use(body_parser.urlencoded({
	extended: true
}));
app.use(function(req, res, next) {
	if(!req.isAuthenticated() && req.method == 'GET') {
		return res.render('login-admin', { message: req.flash('message') });
	}

	next();	
});
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/control_panel/pages');

http_app.get('*', function(req, res) {
	res.redirect('https://trascendencias.org:8443' + req.url);
});

app.get('/', function(req, res) {
	res.render('index');
});

app.get('/login-admin', function(req, res) {
	if(req.isAuthenticated()) {
		return res.send("Sesion ya iniciada.");
	}

	res.render('login-admin', { message: req.flash('message') });
});

app.post('/login-admin', form(), passport.authenticate('login-admin', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/registro-:collection', function(req, res) {
	res.render('register-' + req.params.collection);
});

app.post('/registro-:collection', form(), function(req, res) {
	database.register[req.params.collection](req.form);
	res.redirect('/');
});

app.get('/list-:collection', function(req, res) {
	database.list(req, res);
});

app.get('/look-:collection/:document', function(req, res) {
	database.look(req, res);
});

app.get('/:file', function(req, res) {
	if(fs.existsSync(__dirname + '/control_panel/pages/' + req.params.file + '.html')) {
		return res.render(req.params.file);
	}

	res.status(404).send('File not found.');
});

https.createServer({
	ca: fs.readFileSync(ssl.chain),
	key: fs.readFileSync(ssl.privkey),
	cert: fs.readFileSync(ssl.cert)
}, app).listen(8443);

http.createServer(http_app).listen(8080);