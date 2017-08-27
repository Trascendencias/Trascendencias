var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var schemas = {
	participant: mongoose.Schema({
		name: String,
		email: String,
		alergies: String,
		city: String,
		institution: String,
		phone: String,
		selected_package: mongoose.Schema.Types.ObjectId,
		workshop_0: mongoose.Schema.Types.ObjectId,
		workshop_1: mongoose.Schema.Types.ObjectId,
		local: {
			password: String,
		},
		facebook: {
			id: String,
		},
		verified: Boolean,
	}),
	active_package: mongoose.Schema({
		shirt_size: String,
		package: mongoose.Schema.Types.ObjectId,
		debt: Number,
		liquidation_date: Date,
		group_code: String
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
		description: String,
		event_poster: String
	}),
	extra_event: mongoose.Schema({
		name: String,
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
		start: Date,
		end: Date,
		location: String
	}),
	package: mongoose.Schema({
		name: String,
		start: Date,
		end: Date,
		requisites: String,
		photos: [String],
		video_urls: [String],
		summary: String,
		description: String,
		group_size: Number,
		cap: Number,
		cost: Number,
		teaser_position: Number
	}),
	sponsor: mongoose.Schema({
		name: String,
		contact_name: String, 
		contact_phone: String,
		contact_email: String,
		company_logo: String,
		payment: Number
	}),
}

module.exports = {
	participant: mongoose.model('participants', schemas.participant),
	staff_member: mongoose.model('staff_members', schemas.staff_member),
	conference: mongoose.model('conferences', schemas.conference),
	workshop: mongoose.model('workshops', schemas.workshop),
	visit: mongoose.model('visits', schemas.visit),
	social_event: mongoose.model('social_events', schemas.social_event),
	extra_event: mongoose.model('extra_events', schemas.extra_event),
	blog: mongoose.model('blogs', schemas.blog),
	faq: mongoose.model('faqs', schemas.faq),
	sale_point: mongoose.model('sale_points', schemas.sale_point),
	package: mongoose.model('packages', schemas.package),
	sponsor: mongoose.model('sponsors', schemas.sponsor),
	active_package: mongoose.model('active_packages', schemas.active_package)
};