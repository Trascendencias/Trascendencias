var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var main = mongoose.createConnection('mongodb://localhost/main_sessions');
var control_panel = mongoose.createConnection('mongodb://localhost/control_panel_sessions');

module.exports = {
	main: main,
	control_panel: control_panel
}