var form = require('express-form');

form.configure({
	passThrough: true
});

module.exports = function(http_app, app, fs, passport, database) {
	http_app.get('*', function(req, res) {
		res.redirect('https://trascendencias.org' + req.url);
	});

	app.get('/staff', function(req, res) {
		res.redirect('https://trascendencias.org:8443');
	});








	
	
	
	
	app.get('/consulta', check_session, function(req, res) {
	database.consult(req.query.collection, req.query.codigo, function(err, doc) {
		if(catch_errors(err, doc)) {
			return res.redirect('/err404');
		}
			 res.render('consulta', {
				consulta: doc,
				user: req.user,
				url: req.originalUrl,
				collection: req.query.collection
		});
	});
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

	app.get('/', function(req, res) {
		return res.redirect('/index');
	});

	app.get('/apartar-paquete', check_session, function(req, res) {
		database.consult('paquetes', req.query.paquete, function(err, doc) {
			if(catch_errors(err, doc)) {
				return res.redirect('/err404');
			}

			return res.render('apartar-paquete', {
				user: req.user,
				package: doc
			});
		});
	});

	app.get('/validacion-facebook', check_session, function(req, res) {
		if(req.user.verified) {
			return res.redirect('/');
		}

		res.render('validacion-facebook', {
			user: req.user
		});
	})

	app.get('/:name', function(req, res) {
		if(fs.existsSync(__dirname + '/pages/' + req.params.name + '.html')) {
			database.list('paquetes', function(err, paquetes) {
				database.list('taller', function(err, talleres) {
					database.list('conferencia', function(err, conferencias) {
						database.list('preguntas-frecuentes', function(err, preguntas_frecuentes) {
							database.list('staff', function(err, staff) {
								database.list('patrocinadores', function(err, patrocinadores) {
									database.list('evento-social', function(err, eventos_sociales) {
										database.list('blog', function(err, blogs) {
											database.list('visita', function(err, visitas) {
												database.list('punto-venta', function(err, puntos_de_venta) {
													database.list('evento-extra', function(err, eventos_extra) {
														return res.render(req.params.name, {
															user: req.user,
															paquetes: paquetes,
															conferencias: conferencias,
															talleres: talleres,
															visitas: visitas,
															eventos_sociales: eventos_sociales,
															patrocinadores: patrocinadores,
															preguntas_frecuentes: preguntas_frecuentes,
															blogs: blogs,
															puntos_de_venta: puntos_de_venta,
															eventos_extra: eventos_extra,
															login_message: req.flash('login_message')
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		}
		else {
			res.status(404).send('File not found.');
		}
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
			res.redirect('/');
		}

		database.models.participant.findByIdAndUpdate(req.user.id, {
			$set: {
				institution: req.form.institution,
				phone: req.form.phone,
				alergies: req.form.alergies,
				city: req.form.city,
				verified: true
			}
		},function(err, participant) {
			if (catch_errors(err, participant)) {
				res.redirect('/err404');
			}

			res.redirect('/validacion-facebook-exito');
		});
	});

	app.post('/apartar-paquete-:package_id', check_session, form(), function(req, res) {
		if(req.user.selected_package) {
			return res.redirect('/err404?mensaje=Ya elejiste tu paquete.');
		}

		database.assign_package(req.user.id, req.params.package_id, req.form, function(err, message, group_code) {
			if(catch_errors(err)) {
				return res.redirect('/err404?mensaje=' + message);
			}

			return res.redirect('/apartar-paquete-exito?codigo=' + group_code);
		});
	});

	function check_session(req, res, next) {
		if(!req.user) {
			return res.redirect('/err404?mensaje=Porfavor, inicia sesion.');
		}

		next();
	}

	function catch_errors(err, object = true) {
		if(err) {
			console.log(err);
			return true;
		}

		if(!object) {
			console.log(new Error('Empty object'));
			return true;
		}

		return false;
	}
}