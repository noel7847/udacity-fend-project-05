/**
 * Map marker component
 * @module main
 * @version 1.0.0
 */


/* process */
'use strict';

/**
 * Holds the imported googleMaps component
 * @type {(Object)}
 */
var googleMaps = require('./component.googlemaps');

/**
 * Starts up the application
 * @function run
 */
function run() {
  window.onload = googleMaps.callGoogleMaps(process.env.API_KEY);
}


module.exports = (function () {
  return {
    run: run
  }
})();
