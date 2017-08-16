var local_strategy = require('passport-local').Strategy;
var facebook_strategy = require('passport-facebook').Strategy;

var participant = require('../../database/models').participant;
var facebook_config = require('./facebook.js');

var nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'trasce4eva@gmail.com',
        pass: 'admin@trasce4eva'
    }
});

let mail_options = {
	from: '"Trascendencias" <trasce4eva@gmail.com>',
	to: 'edgarmv97@gmail.com',
	subject: 'Verifica tu cuenta de Trascendencias'
};


module.exports = function(passport) {
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		participant.findById(id, function(err, user){
			done(err, user);
		});
	});

	passport.use('signup', new local_strategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done) {
		process.nextTick(function(){
			participant.findOne({ 'email': email }, function(err, searched_participant) {
				if(err) {
					return done(err);
				}
				else if(searched_participant) {
					return done(null, false, req.flash('message', 'Correo ya registrado.'));
				}
				else {
					var new_participant = new participant();
					new_participant.name = req.form.name;
					new_participant.email = email;
					new_participant.local.password = new_participant.generate_hash(password);
					new_participant.debt = 0;
					new_participant.package = 'Ninguno';
					new_participant.verified = false;

					mail_options.text = "Da click al siguiente link para verificar tu cuenta: hash_here";
					transporter.sendMail(mail_options, (error, info) => {
						if (error) {
							return console.log(error);
						}
					});


					new_participant.save(function(err) {
						if(err) {
							throw err;
						}

						return done(null, new_participant);
					});
				}
			})

		});
	}));

	passport.use('login', new local_strategy({
			usernameField: 'name',
			passwordField: 'password',
			passReqToCallback: true
		},
		function(req, name, password, done){
			process.nextTick(function() {
				participant.findOne({ 'name': name }, function(err, searched_participant) {
					if(err) {
						return done(err);
					}
					else if(!searched_participant) {
						return done(null, false, req.flash('message', 'Name not found.'));
					}
					else if(!searched_participant.valid_password(password)) {
						return done(null, false, req.flash('message', 'Invalid password.'));
					}

					return done(null, searched_participant);
				});
			});
		}
	));

	passport.use(new facebook_strategy({
		clientID: facebook_config.app_id,
		clientSecret: facebook_config.secret,
		callbackURL: facebook_config.callback,
		profileFields: ['id', 'emails', 'name']
	},
	function(access_token, refresh_token, profile, done) {
		process.nextTick(function() {
			participant.findOne({ 'facebook.id': profile.id }, function(err, searched_participant) {
				if(err) {
					return done(err);
				}
				else if(searched_participant) {
					return done(null, searched_participant);
				}
				else {
					let new_participant = new participant();
					new_participant.facebook.id = profile.id;
					new_participant.name = profile.name.givenName + ' ' + profile.name.familyName;
					new_participant.email = profile.emails[0].value;
					new_participant.package = 'Ninguno';
					new_participant.debt = 0;
					new_participant.verified = true;

					new_participant.save(function(err) {
						if(err) {
							throw err;
						}

						return done(null, new_participant);
					});
				}
			});
		});
	}));
};
