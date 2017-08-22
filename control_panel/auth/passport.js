var local_strategy = require('passport-local').Strategy;
var staff_member = require('../../database/models').staff_member;

module.exports = function(passport, database) {
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
				return done(null, searched_staff_member);
			}
			else {
				let new_staff_member = new staff_member();

				new_staff_member.name = req.form.name;
				new_staff_member.shirt_size = req.form.shirt_size;
				new_staff_member.phone = req.form.phone;
				new_staff_member.email = req.form.email;
				new_staff_member.major = req.form.major;
				new_staff_member.semester = req.form.semester;
				new_staff_member.city = req.form.city;
				new_staff_member.password = database.generate_hash(password);
				new_staff_member.alergies = req.form.alergies;
				new_staff_member.team = req.form.team;
				new_staff_member.position = req.form.position;
				new_staff_member.photo = database.get_file(req.files, 'photo');

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
				else if(!searched_staff_member || !database.valid_hash(password, searched_staff_member.password)) {
					return done(null, false, req.flash('message', 'Credenciales invalidas.'));
				}

				return done(null, searched_staff_member);
			});
		}
	));
};
