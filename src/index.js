/**
 * Application entry point
 * @global index
 * @version 1.0.0
 */


require('bootstrap/dist/css/bootstrap.css');
require('./css/main.css');
require('bootstrap/dist/js/bootstrap.js');

var app = require('./app/main.js');
app.run();