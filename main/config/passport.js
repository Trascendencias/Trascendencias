var local_strategy = require('passport-local').Strategy;
var facebook_strategy = require('passport-facebook').Strategy;

var participant = require('../models/participant');
var facebook_config = require('./facebook.js');

module.exports = function(passport) {
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		participant.findById(id, function(err, user){
			done(err, user);
		});
	});

	passport.use('local-signup', new local_strategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done){
		process.nextTick(function(){
			User.findOne({'local.username': email}, function(err, user){
				if(err)
					return done(err);
				if(user){
					return done(null, false, req.flash('signupMessage', 'That email already taken'));
				} else {
					var newUser = new User();
					newUser.local.username = email;
					newUser.local.password = newUser.generateHash(password);

					newUser.save(function(err){
						if(err)
							throw err;
						return done(null, newUser);
					})
				}
			})

		});
	}));

	passport.use('local-login', new local_strategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		function(req, email, password, done){
			process.nextTick(function(){
				User.findOne({ 'local.username': email}, function(err, user){
					if(err)
						return done(err);
					if(!user)
						return done(null, false, req.flash('loginMessage', 'No User found'));
					if(!user.validPassword(password)){
						return done(null, false, req.flash('loginMessage', 'invalid password'));
					}
					return done(null, user);

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
	  function(accessToken, refreshToken, profile, done) {
			process.nextTick(function(){
	    		participant.findOne({'facebook.id': profile.id}, function(err, searched_participant){
	    			if(err) {
	    				return done(err);
	    			}
	    			else if(searched_participant) {
	    				return done(null, user);
	    			}
	    			else {
	    				var new_participant = new participant();
	    				new_participant.facebook.id = profile.id;
	    				new_participant.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
	    				new_participant.facebook.email = profile.emails[0].value;
	    				new_participant.facebook.package = 'Ninguno';

	    				new_participant.save(function(err){
	    					if(err) {
	    						throw err;
	    					}

	    					return done(null, new_participant);
	    				});
	    			}
	    		});
	    	});
	    }

	));


};