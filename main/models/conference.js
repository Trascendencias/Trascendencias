var mongoose = require('mongoose');
var conference_schema = mongoose.Schema({
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
});

module.exports = mongoose.model('conferences', conference_schema);