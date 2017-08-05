var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var connection = mongoose.connect('mongodb://localhost/test').connection;

var models = require('./models');

connection.register = {
	conference: function(parameters) {
		let conference_model = models.conference;

		let new_conference = new conference_model();
		new_conference.name = parameters.name;

		new_conference.save(function(err) {
			if(err) {
				throw err;
			}
		})
	},
	expense: function(parameters) {
		console.log(JSON.stringify(parameters));
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