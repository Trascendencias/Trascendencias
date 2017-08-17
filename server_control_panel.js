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

http_app.get('*', function(request, response) {
	response.redirect('https://trascendencias.org:8443' + request.url);
});

app.get('/', function(request, response) {
	response.render('index');
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

app.get('/register-:collection', function(request, response) {
	response.render('register-' + request.params.collection);
});

app.post('/register-:collection', form(), function(request, response) {
	console.log("Register " + request.params.collection + ":");
	database.register[request.params.collection](request.form);
	response.redirect('/');
});

app.get('/list-:collection', function(request, response) {
	database.list(request, response);
});

app.get('/look-:collection/:document', function(request, response) {
	database.look(request, response);
});

app.get('/:file', function(request, response) {
	if(fs.existsSync(__dirname + '/control_panel/pages/' + request.params.file + '.html')) {
		return response.render(request.params.file);
	}

	response.status(404).send('File not found.');
});

https.createServer({
	ca: fs.readFileSync(ssl.chain),
	key: fs.readFileSync(ssl.privkey),
	cert: fs.readFileSync(ssl.cert)
}, app).listen(8443);

http.createServer(http_app).listen(8080);