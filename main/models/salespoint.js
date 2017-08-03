var mongoose = require('mongoose');
var sale_point_schema = mongoose.Schema({
	name: String,
	start: Date,
	end: Date,
	location: String
});

module.exports = mongoose.model('sale_points', sale_point_schema);