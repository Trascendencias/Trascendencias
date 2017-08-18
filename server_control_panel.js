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
app.use(file_upload());
app.use(passport.initialize());
app.use(passport.session());

app.use(favicon(__dirname + '/favicon.ico'));
app.use('/registro/resources', express.static(__dirname + '/control_panel/pages/registro/resources'));
app.use('/admin/resources', express.static(__dirname + '/control_panel/pages/admin/resources'));
app.use(body_parser.urlencoded({
	extended: true
}));
app.use(function(req, res, next) {
	let path = req.baseUrl + req.path;
	console.log("%s\t%s\tSession: %s", req.method, path, req.isAuthenticated());
	/*if(!req.isAuthenticated() && req.method == 'GET') {
		return res.render('registro/login', { message: req.flash('message') });
	}*/

	next();
});
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/control_panel/pages');

http_app.get('*', function(req, res) {
	res.redirect('https://trascendencias.org:8443' + req.url);
});

app.get('/login', function(req, res) {
	if(req.isAuthenticated()) {
		return res.send("Sesion ya iniciada.");
	}

	res.render('registro/login', { message: req.flash('message') });
});

app.post('/login', form(), passport.authenticate('login', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.post('/registro-:collection', form(), function(req, res) {
	database.register[req.params.collection](req);
	res.redirect('/');
});

app.get('/list-:collection', function(req, res) {
	database.list(req, res);
});

app.get('/look-:collection/:document', function(req, res) {
	database.look(req, res);
});

app.get(':/module/*', function(req, res) {
	return res.render((req.baseUrl + req.path).substring(1));
});

https.createServer({
	ca: fs.readFileSync(ssl.chain),
	key: fs.readFileSync(ssl.privkey),
	cert: fs.readFileSync(ssl.cert)
}, app).listen(8443);

http.createServer(http_app).listen(8080);