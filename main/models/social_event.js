var mongoose = require('mongoose');
var social_event_schema = mongoose.Schema({
	name: String,
	start: Date,
	end: Date,
	location: String,
	contact_name: String,
	contact_phone: String,
	contact_email: String,
	location: String,
	
});

module.exports = mongoose.model('social_events', social_event_schema);