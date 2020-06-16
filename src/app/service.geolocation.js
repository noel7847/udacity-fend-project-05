/**
 * @fileOverview Geolocation service
 * @author Noel Noche
 * @version 1.0.0
 */

/* global $ */
'use strict';

/** @module GeolocationService */

/**
 * Shows message banner telling the end user an error has occurred
 * @function showMessage
 */
function showMessage() {
  var $msgNode = $('.geolocation__notifier');
  $msgNode.text('An error has occurred. See the browser console for details.').css('display', 'block');
}

/**
 * Processes error messages from failed JS geolocation and Google Maps API requests
 * @function handleError
 * @param {string} errorId - Error code or message
 */
function handleError(errorId) {
  var errorMsg = null;
  var errorTypes = {
    'OK': 'Successful connection to API service', // dev only
    'ERROR': 'There was a problem contacting Google servers',
    'INVALID_REQUEST': 'This request was invalid',
    'OVER_QUERY_LIMIT': 'The webpage has gone over its request quota',
    'REQUEST_DENIED': 'The webpage is not allowed to use the PlacesService',
    'UNKNOWN_ERROR': 'The request could not be processed due to a server error. The request may succeed if you try again.',
    'PERMISSION_DENIED': 'User denied the request for Geolocation.',
    'POSITION_UNAVAILABLE': 'Location information is unavailable.',
    'TIMEOUT': 'The request to get user location timed out.',
    'ZERO_RESULTS': 'No nearby cafes detected.'
  };

  if (errorTypes[errorId]) {
    errorMsg = errorTypes[errorId];
  }
  else if (errorId.message) {
    errorMsg = errorId.message;
  }
  else {
    errorMsg = errorId;
  }

  // Avoids jQuery in unit tests
  if (typeof $ !== 'undefined') {
    showMessage();
  }
  
  console.error(errorMsg);
  return errorMsg; 
}

/**
 * Check if the browser supports geolocation
 * @return {boolean}
 */
function checkGeolocation() {
  if ('geolocation' in window.navigator) {
    return true;
  }
  else {
    handleError('Browser does not support geolocation.');
    return false;
  } 
}

/**
 * Checks if the user is connected to the internet
 * @function checkOnlineStatus
 * @return {boolean}
 */
function checkOnlineStatus() {
  if (window.navigator.onLine === true) {
    return true;
  }
  else {
    handleError('You appear to be offline. Please check your wifi settings.');
    return false;
  }
}


module.exports = (function() {
  return {
    handleError: handleError,
    checkGeolocation: checkGeolocation,
    checkOnlineStatus: checkOnlineStatus
  }  
})();