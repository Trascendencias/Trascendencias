var database = require('./database/connection');
var staff_member = require('./database/models').staff_member;

var admin = new staff_member();
admin.name = 'admin';
admin.password = database.generate_hash('admin@trasce4eva');
admin.position = 'Administrator';

admin.save(function(err) {
	if(err) {
		throw err;
	}

	console.log("New administrator stored in the database.");
	process.exit();
});