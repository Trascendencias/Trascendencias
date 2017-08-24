var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var schemas = {
	participant: mongoose.Schema({
		name: String,
		package: String,
		email: String,
		debt: Number,
		verified: Boolean,
		alergies: String,
		city: String,
		institution: String,
		phone: String,
		group_code: String,
		workshop: String,
		local: {
			password: String,
		},
		facebook: {
			id: String,
		}
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
	}),
	conference: mongoose.Schema({
		name: String,
		start: Date,
		end: Date,
		speaker_name: String, 
		speaker_titles: String,
		speaker_phone: String,
		speaker_email: String,
		location: String,
		speaker_photo: String,
		photos: [String],
		video_urls: [String],
		summary: String,
		description: String,
		include_teaser: Number
	}),
	workshop: mongoose.Schema({
		name: String,
		start: Date,
		end: Date,
		instructor_name: String, 
		instructor_titles: String,
		instructor_phone: String,
		instructor_email: String,
		location: String,
		instructor_photo: String,
		photos: [String],
		video_urls: [String],
		summary: String,
		description: String,
		cap: Number,
		requisites: String
	}),
	visit: mongoose.Schema({
		name: String,
		start: Date,
		end: Date,
		contact_name: String, 
		contact_phone: String,
		contact_email: String,
		location: String,
		photos: [String],
		video_urls: [String],
		summary: String,
		description: String,
		cap: Number,
		requisites: String
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
		summary: String,
		description: String
		event_poster: String
	}),
	extra_event: mongoose.Schema({
		name: String,
		start: Date,
		end: Date,
		location: String,
		event_icon: String
	}),
	sale_point: mongoose.Schema({
		name: String,
		start: Date,
		end: Date,
		location: String
	}),
}

module.exports = {
	conference: mongoose.model('conferences', schemas.conference),
	participant: mongoose.model('participants', schemas.participant),
	social_event: mongoose.model('social_events', schemas.social_event),
	sale_point: mongoose.model('sale_points', schemas.sale_point),
	staff_member: mongoose.model('staff_members', schemas.staff_member),
	workshop: mongoose.model('staff_members', schemas.staff_member)
};