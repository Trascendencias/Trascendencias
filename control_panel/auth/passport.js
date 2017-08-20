var local_strategy = require('passport-local').Strategy;
var staff_member = require('../../database/models').staff_member;

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		staff_member.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use('signup', new local_strategy({
		usernameField: 'email',
		passReqToCallback: true
	},
	function(req, email, password, done) {
		staff_member.findOne({ 'email': email }, function(err, searched_staff_member) {
			if(err) {
				return done(err);
			}
			else if(searched_staff_member) {
				return done(null, false, req.flash('message', 'Correo ya registrado.'));
			}
			else {
				let new_staff_member = new staff_member();
				new_staff_member.name = form.name;
				new_staff_member.shirt_size = form.shirt_size;
				new_staff_member.phone = form.phone;
				new_staff_member.email = form.email;
				new_staff_member.major = form.major;
				new_staff_member.semester = form.semester;
				new_staff_member.city = form.city;
				new_staff_member.password = new_staff_member.generate_hash(password);
				new_staff_member.alergies = form.alergies;
				new_staff_member.team = form.team;
				new_staff_member.position = form.position;

				new_staff_member.save(function(err) {
					if(err) {
						throw err;
					}

					return done(null, new_staff_member);
				});
			}
		});
	}));

	passport.use('login', new local_strategy( {
			passReqToCallback: true,
		},
		function(req, username, password, done) {
			staff_member.findOne({ 'name': username }, function(err, searched_staff_member) {
				if(err) {
					return done(err);
				}
				else if(!searched_staff_member || !searched_staff_member.valid_password(password)) {
					return done(null, false, req.flash('message', 'Credenciales invalidas.'));
				}

				return done(null, searched_staff_member);
			});
		}
	));
};
