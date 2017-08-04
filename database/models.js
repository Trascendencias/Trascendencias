var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var schemas = {
	conference: mongoose.Schema({
		name: String,
		start: Date,
		end: Date,
		speaker_name: String, 
		speaker_description: String,
		telephone: String,
		email: String,
		location: String,
		speaker_photo: Buffer,
		general_description: String,
		include_teaser: Boolean
	}),
	participant: mongoose.Schema({
		name: String,
		package: String,
		email: String,
		debt: Number,
		local: {
			password: String,
		},
		facebook: {
			id: String,
		}
	}),
	social_event: mongoose.Schema({
		name: String,
		start: Date,
		end: Date,
		location: String,
		contact_name: String,
		contact_phone: String,
		contact_email: String,
		location: String,
	}),
	sale_point: mongoose.Schema({
		name: String,
		start: Date,
		end: Date,
		location: String
	})
};

schemas.participant.methods.generate_hash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
}

schemas.participant.methods.valid_password = function(password){
	return bcrypt.compareSync(password, this.local.password);
}

module.exports = {
	conference: mongoose.model('conferences', schemas.conference),
	participant: mongoose.model('participants', schemas.participant),
	social_event: mongoose.model('social_events', schemas.social_event),
	sale_point: mongoose.model('sale_points', schemas.sale_point)
};