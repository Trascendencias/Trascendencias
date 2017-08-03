var database_management = {};

database_management.register = {
	conference: function(parameters) {
		console.log(parameters);
	}
};

database_management.list = function(database_connection, request, response) {
	let docs = [];
	database_connection.collection(request.params.collection).find().forEach(function(doc) {
		docs.push(doc);
	},
	function(err) {
		response.render('list', { list: docs });
	});
}

database_management.look = function(database_connection, request, response) {
	database_connection.collection(request.params.collection).findOne({ email: request.params.document }, function(err, doc) {
		response.render('look', { doc: doc });
	});
}

module.exports = database_management;