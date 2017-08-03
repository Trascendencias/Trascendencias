var fs = require('fs');
var express = require('express');
var http = require('http');
var https = require('https');
var http_app = express();
var app = express();
var ssl = require('./ssl_config');
var form = require('express-form');
var body_parser = require('body-parser');
var mongoose = require('./main/config/database');
var database_management = require('./control_panel/config/database_management');

form.configure({
	passThrough: true
});

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/control_panel/pages');
app.use(body_parser.urlencoded({
	extended: true
}));
app.use('/resources', express.static(__dirname + '/control_panel/resources'));

http_app.get('*', function(request, response) {
	response.redirect('https://trascendencias.org:8443' + request.url);
});

app.get('/', function(request, response) {
	response.render('index');
});

app.get('/register/:collection', function(request, response) {
	response.render('register-' + request.params.collection);
});

app.post('/register/:collection', function(request, response) {
	database_management.register[request.params.collection](request.form);
	response.redirect('/');
});

app.get('/list/:collection', function(request, response) {
	database_management.list(mongoose, request, response);
});

app.get('/look/:collection/:document', function(request, response) {
	database_management.look(mongoose, request, response);
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