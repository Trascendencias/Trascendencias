var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var database = mongoose.connect('mongodb://localhost/test').connection;
var models = require('./models');
var bcrypt = require('bcrypt');

database.models = models;

database.register = {
	conferencia: function(form, files, done) {
		let new_conference = new models.conference();
		database.form_to_model(form, new_conference);
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
		database.form_to_model(form, new_workshop);
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
		database.form_to_model(form, new_visit);
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
		database.form_to_model(form, new_social_event);
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
		database.form_to_model(form, new_extra_event);
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
		database.form_to_model(form, new_blog);
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
		database.form_to_model(form, new_faq);

		new_faq.save(function(err) {
			if(err) {
				return done(err);
			}

			return done(null);
		});
	},
	paquetes: function(form, files, done) {
		let new_package = new models.package();
		database.form_to_model(form, new_package);
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
		database.form_to_model(form, new_sponsor);
		new_sponsor.company_logo = get_files(files, 'company_logo');

		new_sponsor.save(function(err) {
			if(err) {
				return done(err);
			}

			return done(null);
		});
	},
	participante_por_staff: function(form, done) {
		let new_participant = new models.participant();
		database.form_to_model(form, new_participant);
		new_participant.local.password = database.generate_hash(form.password);

		new_participant.save(function(err, saved_participant) {
			if(err) {
				return done(err, null);
			}

			return done(null, saved_participant);
		});
	},
	'punto-venta': function(form, files, done) {
		let new_sale_point = new models.sale_point();
		database.form_to_model(form, new_sale_point);

		new_sale_point.save(function(err, saved) {
			return done(null, saved);
		});
	},
	action: function(actor, recipient, content, done) {
		let new_action = new models.action();
		new_action.actor = actor;
		new_action.recipient = recipient;
		new_action.content = content;

		new_action.save(function() {
			return done();
		})
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
				console.log(err);
			}
		});

		file_paths.push(path);
	});

	return file_paths;
}

database.form_to_model = function(form, model) {
	for(let key in form) {
		if(model.schema.paths[key]) {
			if(model.schema.paths[key].instance == 'Array') {
				if(!Array.isArray(form[key])) {
					model[key] = [form[key]];
				}
				else {
					model[key] = form[key];
				}
			}
			else {
				model[key] = form[key];
			}
		}
	}
}

database.assign_package = function(user_id, package_id, form, done) {
	database.consult('participante', user_id, function(err, doc) {
		if(err) {
			return done(err);
		}

		if(doc.selected_package) {
			return done(null, doc);
		}

		if(form['group-code'] != 'none') {
			database.models.active_package.findOneAndUpdate({
				group_code: form['group-code']
			}, {
				$push: {
					members: form.assign_name || form.name
				}
			},
			function(err, saved_active_package) {
				if(err || !doc) {
					return done(err, null);
				}

				doc.selected_package = saved_active_package.id;
				doc.package_information = {
					debt: saved_active_package.package.cost,
					shirt_size: form.shirt_size
				}

				doc.save(function(err,participant) {
					return done(null, participant)
				});
			});
		}
		else {
			database.models.package.findById(package_id, function(err, package) {
				if(err || !package) {
					return done(err, null);
				}

				if(package.group_size > 1) {
					database.generate_group_code(function(err, new_group_code) {
						if(err || !new_group_code) {
							return done(err, null);
						}

						new database.models.active_package({
							package: package.id,
							group_code: new_group_code,
							members: [form.assign_name || form.name]
						}).save(function(err, saved_active_package) {
							if(err) {
								return done(err, null);
							}

							doc.selected_package = saved_active_package.id;
							doc.package_information = {
								debt: package.cost,
								shirt_size: form.shirt_size
							}

							doc.save(function(err,participant) {
								return done(null, participant)
							});
						});
					});
				}
				else {
					new database.models.active_package({
						package: package.id,
					}).save(function(err, saved_active_package) {
						if (err || !saved_active_package) {
							return done(err, null);
						}

						doc.selected_package = saved_active_package.id;
						doc.package_information = {
							debt: package.cost,
							shirt_size: form.shirt_size
						}

						doc.save(function(err,participant) {
							return done(null, participant)
						});
					});
				}
			});
		}
	});
}

new_file_path = function() {
	return 'files/' + Date.now().toString();
}

storage_path = function(path) {
	return '/root/Trascendencias/database/' + path;
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

	database.collection(translate[collection] + 's').find({}).toArray(function(err, collection) {
		if(err) {
			return done(err, null);
		}

		return done(null, collection);
	});
};

database.generate_group_code = function(done) {
	let group_code = Math.floor(Math.random() * 900 + 100);
	models.active_package.findOne({ 'group_code': group_code }, function(err, doc) {
		if(err) {
			return done(err, null);
		}

		if(doc) {
			return generate_group_code(done);
		}

		return done(null, group_code);
	});
}

database.consult = function(collection, id, done) {
	if(translate[collection] == undefined || id == undefined) {
		return done(new Error('Collection undefined'), null);
	}

	if(!mongoose.Types.ObjectId.isValid(id)) {
		return done(new Error('Invalid id'), null);
	}

	database.models[translate[collection]].findOne({ '_id': mongoose.Types.ObjectId(id) }, function(err, doc) {
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

	database.models[translate[collection]].removeOne({ '_id': mongoose.Types.ObjectId(id) }, function(err) {
		if(err) {
			return done(err);
		}

		return done(null);
	});
};

database.list_actions = function(actor, recipient, done) {
	database.collection('actions').find({actor: actor})

}

var translate = {
	'participante': 'participant',
	'conferencia': 'conference',
	'paquetes': 'package',
	'staff': 'staff_member',
	'taller': 'workshop',
	'testimonios': 'testimonie',
	'visita': 'visit',
	'preguntas-frecuentes': 'faq',
	'evento-extra': 'extra_event',
	'patrocinadores': 'sponsor',
	'evento-social': 'social_event',
	'punto-venta': 'sale_point',
	'blog': 'blog'
}

module.exports = database;