var database = require('./database/connection');
var admin_model = require('./database/models').admin;

var admin = new admin_model();
admin.password = 'admin@trasce4eva';

admin.save(function(err) {
	if(err) {
		throw err;
	}

	console.log("Admin stored");
});
