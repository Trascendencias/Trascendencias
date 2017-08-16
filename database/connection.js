var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var connection = mongoose.connect('mongodb://localhost/test').connection;
var models = require('./models');

connection.register = {
	conference: function(form) {
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
	},
	staff: function(form) {
		let staff_member_model = models.staff_member;

		let new_staff_member = new staff_member_model();
		new_staff_member.name = form.name;
		new_staff_member.shirt_size = form.shirt_size;
		new_staff_member.phone = form.phone;
		new_staff_member.email = form.email;
		new_staff_member.major = form.major;
		new_staff_member.semester = form.semester;
		new_staff_member.city = form.city;
		new_staff_member.password = 'nuevo';
		new_staff_member.alergies = form.alergies;
		new_staff_member.team = form.team;
		new_staff_member.position = form.position;

		new_staff_member.save(function(err) {
			if(err) {
				throw err;
			}
		});
	}
};

connection.list = function(request, response) {
	let docs = [];
	connection.collection(request.params.collection).find().forEach(function(doc) {
		docs.push(doc);
	},
	function(err) {
		response.render('list', { list: docs });
	});
}

connection.look = function(request, response) {
	connection.collection(request.params.collection).findOne({ email: request.params.document }, function(err, doc) {
		response.render('look', { doc: doc });
	});
}


module.exports = connection;