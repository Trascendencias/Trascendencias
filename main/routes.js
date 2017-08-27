var form = require('express-form');

form.configure({
	passThrough: true
});

module.exports = function(http_app, app, fs, passport, database) {
	http_app.get('*', function(request, response) {
		response.redirect('https://trascendencias.org' + request.url);
	});

	app.get('/staff', function(req, res) {
		res.redirect('https://trascendencias.org:8443');
	});

	app.get('/signup', function(req, res) {
		res.render('registro-participante', {
			user: req.user,
			message: req.flash('message')
		});
	});

	app.get('/verify', form(), function(req, res) {
		if(database.valid_hash(req.form.email, req.form.key)) {
			database.verify(req.form.email);
			return res.redirect('/')
		}

		return res.send('Verification fallida.');
	});

	app.post('/signup', form(), passport.authenticate('signup', {
		successRedirect : '/',
		failureRedirect : '/signup'
	}));

	app.post('/login', form(), passport.authenticate('login', {
		successRedirect : '/',
		failureRedirect : '/'
	}));

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/auth/facebook', passport.authenticate('facebook', {
		scope: ['email']
	}));

	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/validacion-facebook',
		failureRedirect: '/'
	}));

	app.get('/ventas', function(req, res) {
		database.list('paquetes', function(err, collection) {
			if(err || !collection) {
				return res.redirect('/registro/avisos?titulo=error');
			}
			
			return res.render('ventas', {
				user: req.user,
				message: req.flash('message'),
				packages: collection
			});
		});
	});

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
		response.render('index', {
			user: request.user,
			message: request.flash('message')
		});
	});

	app.get('/validacion-facebook', check_session, function(req, res) {
		if(req.user.verified) {
			return res.redirect('/err404');
		}

		res.render('validaction-facebook');
	})

	app.get('/:name', function(request, response) {
		if(fs.existsSync(__dirname + '/pages/' + request.params.name + '.html')) {
			return response.render(request.params.name, {
				user: request.user,
				message: request.flash('message')
			});
		}

		response.status(404).send('File not found.');
	});

	app.post('/registro-paquete', form(), function(req, res) {
		database.register.paquete(req.form, function(err) {
			if(err) {
				return res.send('Error');
			}

			return res.render('registro-participante-exito', { user: req.user });
		});
	});

	app.post('/complete-facebook', check_session, form(), function(req, res) {
		if(req.user.verified) {
			res.redirect('/error404');
		}

		database.models.participant.findByIdAndUpdate(req.user.id, {
			$set: {
				institution: req.form.institution,
				phone: req.form.phone,
				alergies: req.form.alergies,
				city: req.form.city
			}
		}, function (err, tank) {
			if (err) {
				console.log(err);
				res.redirect('/error404');
			}

			res.redirect('/validacion-facebook-exito');
		});
	});

	function check_session(req, res, next) {
		if(!req.user) {
			return res.redirect('/');
		}

		next();
	}
}