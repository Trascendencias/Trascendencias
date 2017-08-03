var database_management = {};

database_management.register = {
	conference: function(parameters) {
		console.log(parameters);
	}
};

database_management.list = {
	participant: function(db, request, response) {
		var participants = [];

		db.connection.collection('participants').find().forEach(function(participant) {
			participants.push(participant.facebook.name);
		}, function(err) {
			response.render('list-' + request.params.name, {list: participants});
		});
	},
	conference: function(db, request, response) {
		response.render('list-' + request.params.name, {list: ['Not implemented yet.']});
	},
}

module.exports = database_management;