var database = require('./database/connection');
var staff_member = require('./database/models').staff_member;

var new_staff_member = new staff_member();
new_staff_member.password = 'admin@trasce4eva';

admin.save(function(err) {
	if(err) {
		throw err;
	}

	console.log("Admin stored");
	process.exit();
});