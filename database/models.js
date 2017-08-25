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
		workshop: [mongoose.Schema.Types.ObjectId],
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
		day: Date,
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
		day: Date,
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
		day: Date,
		start: Date,
		end: Date,
		location: String,
		contact_name: String,
		contact_phone: String,
		contact_email: String,
		location: String,
		summary: String,
		description: String,
		event_poster: String
	}),
	extra_event: mongoose.Schema({
		name: String,
		day: Date,
		start: Date,
		end: Date,
		location: String,
		event_icon: String
	}),
	blog: mongoose.Schema({
		name: String,
		photos: String,
		video_urls: String,
		summary: String,
		description: String,
		include_teaser: Number
	}),
	faq: mongoose.Schema({
		question: String,
		answer: String,
		position: String
	}),
	sale_point: mongoose.Schema({
		name: String,
		day: String,
		start: Date,
		end: Date,
		location: String
	})
}

module.exports = {
	participant: mongoose.model('participants', schemas.participant),
	staff_member: mongoose.model('staff_members', schemas.staff_member),
	conference: mongoose.model('conferences', schemas.conference),
	workshop: mongoose.model('workshops', schemas.staff_member),
	visit: mongoose.model('visits', schemas.staff_member),
	social_event: mongoose.model('social_events', schemas.social_event),
	extra_event: mongoose.model('extra_events', schemas.staff_member),
	blog: mongoose.model('blogs', schemas.staff_member),
	faq: mongoose.model('faqs', schemas.staff_member),
	sale_point: mongoose.model('sale_points', schemas.sale_point)
};