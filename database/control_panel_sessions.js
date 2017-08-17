var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var database = mongoose.connect('mongodb://localhost/control_panel_sessions').connection;