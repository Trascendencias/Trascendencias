var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var database = mongoose.connect('mongodb://localhost/test').connection;
var models = require('./models');
var bcrypt = require('bcrypt');

database.register = {
	conferencia: function(form, files, done) {
		let new_conference = new models.conference();
		form_to_model(form, new_conference);
		console.log("Form: " + JSON.stringify(form, null, 4));
		new_conference.speaker_photo = get_files(files, 'speaker_photo');
		new_conference.photos = get_files(files, 'photos');

		new_conference.save(function(err) {
			if(err) {
				return done(err);
			}

			return done(null);
		});
	},
	taller: function(form, files, done) {
		let new_workshop = new models.workshop();
		form_to_model(form, new_workshop);
		new_workshop.instructor_photo = get_files(files, 'instructor_photo');
		new_workshop.photos = get_files(files, 'photos');

		new_workshop.save(function(err) {
			if(err) {
				return done(err);
			}

			return done(null);
		});
	},
	visita: function(form, files, done) {
		let new_visit = new models.visit();
		form_to_model(form, new_visit);
		new_visit.photos = get_files(files, 'photos');

		new_visit.save(function(err) {
			if(err) {
				return done(err);
			}

			return done(null);
		});
	},
	'evento-social': function(form, files, done) {
		let new_social_event = new models.social_event();
		form_to_model(form, new_social_event);
		new_social_event.event_poster = get_files(files, 'event_poster');

		new_social_event.save(function(err) {
			if(err) {
				return done(err);
			}

			return done(null);
		});
	},
	'evento-extra': function(form, files, done) {
		let new_extra_event = new models.extra_event();
		form_to_model(form, new_extra_event);
		new_extra_event.event_icon = get_files(files, 'event_icon');

		new_extra_event.save(function(err) {
			if(err) {
				return done(err);
			}

			return done(null);
		});
	},
	blog: function(form, files, done) {
		let new_blog = new models.blog();
		form_to_model(form, new_blog);
		new_blog.photos = get_files(files, 'photos');

		new_blog.save(function(err) {
			if(err) {
				return done(err);
			}

			return done(null);
		});
	},
	'preguntas-frecuentes': function(form, files, done) {
		let new_faq = new models.faq();
		form_to_model(form, new_faq);

		new_faq.save(function(err) {
			if(err) {
				return done(err);
			}

			return done(null);
		});
	},
	paquetes: function(form, files, done) {
		let new_package = new models.package();
		form_to_model(form, new_package);
		new_package.photos = get_files(files, 'photos');

		new_package.save(function(err) {
			if(err) {
				return done(err);
			}

			return done(null);
		});
	},
	patrocinadores: function(form, files, done) {
		let new_sponsor = new models.sponsor();
		form_to_model(form, new_sponsor);
		new_sponsor.company_logo = get_files(files, 'company_logo');

		new_sponsor.save(function(err) {
			if(err) {
				return done(err);
			}

			return done(null);
		});
	}
};

get_files = function(files, filename) {
	if(!files || !files[filename]) {
		throw new Error('Undefined files');
		return null;
	}

	if(!Array.isArray(files[filename])) {
		files[filename] = [files[filename]];
	}

	let file_paths = [];
	files[filename].forEach(function(element) {
		let path = new_file_path();
		element.mv(storage_path(path), function(err) {
			if(err) {
				return done(err, null);
			}
		});

		file_paths.push(path);
	});

	return file_paths;
}

form_to_model = function(form, model) {
	for(let key in form) {
		if(model.schema.paths[key]) {
			if(model.schema.paths[key].instance == 'Array') {
				model[key] = [form[key]];
			}
			else {
				console.log(model.schema.paths[key].instance);
				model[key] = form[key];
			}
		}
	}
}

new_file_path = function() {
	return 'resources/' + Date.now().toString();
}

storage_path = function(path) {
	return '/root/Trascendencias/control_panel/pages/registro/' + path;
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
	'punto-venta': 'sale_points',
	'blog': 'blogs'
}

module.exports = database;