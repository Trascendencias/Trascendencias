var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var database = mongoose.connect('mongodb://localhost/test').connection;
var models = require('./models');
var bcrypt = require('bcrypt');

database.register = {
	conferencia: function(form, files, done) {
		let new_conference = new models.conference();
		new_conference.name = form.name;
		new_conference.speaker_name = form.speaker_name;
		new_conference.speaker_titles = form.speaker_titles;
		new_conference.speaker_phone = form.speaker_phone;
		new_conference.speaker_email = form.speaker_email;
		new_conference.location = form.location;
		new_conference.summary = form.summary;
		new_conference.description = form.description;
		new_conference.include_teaser = form.inlude_teaser;
		database.get_video_urls(form, function(err, video_urls) {
			if(err) {
				return done(err);
			}

			new_conference.video_urls = video_urls;

			database.get_file(files, 'speaker_photo', function(err, file_path) {
				if(err) {
					return done(err);
				}

				new_conference.speaker_photo = file_path;

				database.get_files(files, 'photo', function(err, file_paths) {
					if(err) {
						return done(err);
					}

					new_conference.photos = file_paths;

					new_conference.save(function(err) {
						if(err) {
							return done(err);
						}

						return done(null);
					})
				});			
			});
		});
	},
	expense: function(form, files, done) {
		
	}
};

database.get_video_urls = function(form, done) {
	let video_urls = [];
	for(let count = 0; form['video_url_' + count]; count++) {
		video_urls.push(form['video_url_' + count]);

		if(!form['video_url_' + (count + 1)]) {
			return done(null, video_urls);
		}
	}
}

database.get_file = function(files, filename, done) {
	if(!files || !files[filename]) {
		return done(null, null);
	}

	let path = new_file_path();
	files[filename].mv('/root/Trascendencias/control_panel/pages/registro/' + path, function(err) {
		if(err) {
			return done(err, null);
		}

		return done(null, path);
	});
}

database.get_files = function(files, filename, done) {
	if(!files || !files[filename + '_0']) {
		return done(null, []);
	}

	let file_paths = [];
	for(let count  = 0; files[filename + '_' + count]; count++) {
		let path = new_file_path();
		files[filename + '_' + count].mv('/root/Trascendencias/control_panel/pages/registro/' + path, function(err) {
			if(err) {
				return done(err, []);
			}

			file_paths.push(path);

			if(!files[filename + '_' + (count + 1)]) {
				return done(null, file_paths);
			}
		});
	}
}

function new_file_path() {
	return 'resources/' + Date.now().toString();
}

database.valid_hash = function(string, hash) {
	return bcrypt.compareSync(string, hash);
};

database.generate_hash = function(string) {
	return bcrypt.hashSync(string, bcrypt.genSaltSync(9), null);
};

database.verify = function(email) {
	database.collection('participants').updateOne({
		email: email
	}, {
		$set: {
			verified: true
		}
	});
}

database.used_email = function(email, done) {
	let staff_member = models.staff_member;
	
	staff_member.findOne({ 'email': email }, function(err, searched_staff_member) {
		if(err) {
			return done(err);
		}
		else if(searched_staff_member) {
			return done(null, true);
		}
		else {
			return done(null, false);
		}
	});
}

database.list = function(collection, done) {
	if(translate[collection] == undefined) {
		return done(new Error('Collection undefined'), null);
	}

	database.collection(translate[collection]).find({}).toArray(function(err, collection) {
		if(err) {
			return done(err, null);
		}

		return done(null, collection);
	});
};

database.consult = function(collection, id, done) {
	if(translate[collection] == undefined || id == undefined) {
		return done(new Error('Collection undefined'), null);
	}

	if(!mongoose.Types.ObjectId.isValid(id)) {
		return done(new Error('Invalid id'), null);
	}

	database.collection(translate[collection]).findOne({ '_id': mongoose.Types.ObjectId(id) }, function(err, doc) {
		if(err) {
			return done(err, null);
		}

		return done(null, doc);
	});
};

database.remove = function(collection, id, done) {
	if(translate[collection] == undefined || id == undefined) {
		return done(new Error('Collection undefined'), null);
	}

	if(!mongoose.Types.ObjectId.isValid(id)) {
		return done(new Error('Invalid id'), null);
	}

	database.collection(translate[collection]).removeOne({ '_id': mongoose.Types.ObjectId(id) }, function(err) {
		if(err) {
			return done(err);
		}

		return done(null);
	});
};

var translate = {
	'participante': 'participants',
	'conferencia': 'conferences',
	'paquetes': 'packages',
	'staff': 'staff_members',
	'taller': 'workshops',
	'testimonios': 'testimonies',
	'visita': 'visits',
	'preguntas-frecuentes': 'faqs',
	'evento-extra': 'extra_event',
	'patrocinadores': 'sponsors',
	'evento-social': 'social_events',
	'punto-venta': 'sale_points'
}

module.exports = database;