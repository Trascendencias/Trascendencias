const express = require('express');
const app = express();
const http_app = express();

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