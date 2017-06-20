const express = require('express');
const http = require('http');
const http_app = express();
const https = require('https');
const app = express();

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

http_app.get('*', function(request, response) {
	response.redirect('https://edgarmagdaleno.me' + request.url);
});

app.get('/', function(req, res) {  
	res.render('index', { title: 'The index page!' })
});

https.createServer(app).listen(443);
http.createServer(http_app).listen(80);