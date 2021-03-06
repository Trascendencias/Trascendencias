var fs = require('fs');
var express = require('express');
var http = require('http');
var https = require('https');
var http_app = express();
var app = express();
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var body_parser = require('body-parser');
var session = require('express-session');
var mongo_store = require('connect-mongo')(session);
var passport = require('passport');
var flash = require('connect-flash');
var database = require('./database/connection');

require('./main/auth/passport')(passport, database);

app.use(favicon(__dirname + '/favicon.ico'));
app.use('/resources', express.static(__dirname + '/main/resources'));
app.use('/files', express.static(__dirname + '/database/files'));
app.use(body_parser.urlencoded({
	extended: true
}));
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: 'secret_string',
	store: new mongo_store({ mongooseConnection: database })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/main/pages');

require('./main/routes.js')(http_app, app, fs, passport, database);

var ssl = require('./ssl_config');
https.createServer({
	ca: fs.readFileSync(ssl.chain),
	key: fs.readFileSync(ssl.privkey),
	cert: fs.readFileSync(ssl.cert)
}, app).listen(443);

http.createServer(http_app).listen(80);