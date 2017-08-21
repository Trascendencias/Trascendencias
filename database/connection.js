var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var database = mongoose.connect('mongodb://localhost/test').connection;
var models = require('./models');
var bcrypt = require('bcrypt');

database.register = {
	conferencia: function(form) {
		let conference_model = models.conference;

		let new_conference = new conference_model();
		new_conference.name = form.name;


		new_conference.save(function(err) {
			if(err) {
				throw err;
			}
		});
	},
	expense: function(form) {
		console.log(JSON.stringify(form));
	}
};

database.upload = function(file, path) {
	file.mv(path, function(err) {
		if(err) {
			console.log("Error uploading file: %s", err)
		}
	})
};

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
		return done(new Error('Collection undefined.'), null);
	}

	database.collection(translate[collection]).find({}).toArray(function(err, collection) {
		if(err) {
			return done(err, null);
		}

		return done(null, collection);
	});
}

database.consult = function(collection, id, done) {
	if(translate[collection] == undefined || id == undefined) {
		return done('Collection undefined.', null);
	}

	database.collection(translate[collection]).findById(id, function(err, doc) {
		return done(err, doc);
	})
}

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