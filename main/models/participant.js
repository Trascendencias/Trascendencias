var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var participant_schema = mongoose.Schema({
	local: {
		name: String,
		email: String,
		password: String,
		package: String
	},
	facebook: {
		name: String,
		email: String,
		id: String,
		package: String
	}
});

participant_schema.methods.generate_hash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
}

participant_schema.methods.valid_password = function(password){
	return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model('participants', participant_schema);