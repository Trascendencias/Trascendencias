var database = require('./database/connection');
var staff_member = require('./database/models').staff_member;

var admin = new staff_member();
admin.name = 'admin';
admin.password = admin.generate_hash('admin@trasce4eva');
admin.position = 'Administrator';

var new_staff_member = new staff_member();
new_staff_member.name = 'Edgar Magdaleno';
new_staff_member.password = new_staff_member.generate_hash('asd');
new_staff_member.position = 'Coordinador';

new_staff_member.save(function(err) {
	if(err) {
		throw err;
	}

	console.log("New staff member stored in the database.");
});

admin.save(function(err) {
	if(err) {
		throw err;
	}

	console.log("New administrator stored in the database.");
});