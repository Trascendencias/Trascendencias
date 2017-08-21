var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var schemas = {
	conference: mongoose.Schema({
		name: String,
		start: Date,
		end: Date,
		speaker_name: String, 
		speaker_description: String,
		phone: String,
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
		verified: Boolean,
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
	}),
	staff_member: mongoose.Schema({
		name: String,
		shirt_size: String,
		phone: String,
		email: String,
		major: String,
		semester: String,
		facebook: String,
		city: String,
		password: String,
		alergies: String,
		team: String,
		position: String,
		photo: String
	})
}

module.exports = {
	conference: mongoose.model('conferences', schemas.conference),
	participant: mongoose.model('participants', schemas.participant),
	social_event: mongoose.model('social_events', schemas.social_event),
	sale_point: mongoose.model('sale_points', schemas.sale_point),
	staff_member: mongoose.model('staff_members', schemas.staff_member)
};