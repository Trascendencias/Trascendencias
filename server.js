const express = require('express');
const http = require('http');
const http_app = express();
const https = require('https');
const app = express();
const path = require('path');

app.set('views', path.join(__dirname, '/public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

http_app.get('*', function(request, response) {
	response.redirect('https://trascendencias.org' + request.url);
});

app.get('/', function(request, response) {
	response.render('home');
});

https.createServer(app).listen(443);
http.createServer(http_app).listen(80);