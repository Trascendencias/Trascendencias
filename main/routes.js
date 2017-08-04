var form = require('express-form');

module.exports = function(http_app, app, fs, passport) {
	http_app.get('*', function(request, response) {
		response.redirect('https://trascendencias.org' + request.url);
	});

	app.get('/control', function(req, res) {
		res.redirect('https://trascendencias.org:8443');
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/',
		failureRedirect : '/signup',
		failureFlash : true
	}));

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/auth/facebook', passport.authenticate('facebook', {
		scope: ['email']
	}));

	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/',
		failureRedirect: '/'
	}));

	app.post('/registro-terminado', 
		form(
			form.field('nombre').trim(),
			form.field('talla').trim(),
			form.field('email').trim(),
			form.field('institucion'),
			form.field('ciudad').trim(),
			form.field('telefono').trim(),
			form.field('contrasena').trim(),
			form.field('alergias').trim()
		),
		function(request, response) {
			request.form.codigo = generate_package_code();
			print_collection('paquetes');
			response.render('registro-terminado', {code: request.form.codigo});
		}
	);

	app.get('/', function(request, response) {
		if(request.isAuthenticated()) {
			return response.render('index', {
				user: request.user
			});
		}

		response.render('index', {
			user: request.user
		});
	});

	app.get('/:name', function(request, response) {
		if(fs.existsSync(__dirname + '/pages/' + request.params.name + '.html')) {
			return response.render(request.params.name, { user: request.user });
		}

		response.status(404).send('File not found.');
	});
}