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
	let docs = [];
	if(collection == undefined) {
		done(null, docs);
	}

	database.collection(collection).find().forEach(function(doc) {
		docs.push(doc);
	},
	function(err) {
		if(err) {
			return done(err, docs)
		}

		return done(null, docs);
	});
}

database.consult = function(id, done) {
	let consultation = {};

	if(id == undefined) {
		return done(null, consultation);
	}
}

database.look = function(request, response) {
	database.collection(request.params.collection).findOne({ email: request.params.document }, function(err, doc) {
		response.render('look', { doc: doc });
	});
}


module.exports = database;