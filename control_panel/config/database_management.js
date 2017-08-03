var database_management = {};

database_management.register = {
	conference: function(parameters) {
		console.log(parameters);
	}
};

database_management.list = function(database_connection, request, response) {
	let list = [];
	database_connection.collection(request.params.collection).find().forEach(function(doc) {
		list.push(doc.name);
	},
	function(err) {
		response.render('list', { list: list });
	});
}

database_management.look = function(database_connection, request, response) {
	database_connection.collection(request.params.collection).findOne({ name: request.params.document }, function(err, doc) {
		response.render('look', { doc: doc });
	});
}

module.exports = database_management;