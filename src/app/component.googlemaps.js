/** 
 * Application Google Maps component
 * @module component.googlemaps
 * @version 1.0.0
 */


/* global $ google ko process*/
'use strict';

/**
 * Holds the imported geolocation service module functions
 * @type {(Object)}
 */
var geolocationService = require('./service.geolocation');

/**
 * Holds the imported AppView class
 * @type {(Object)}
 */
var AppViewModel = require('./component.appview');

/**
 * Holds the current index of an Array in for-loops
 * @type {(null | Number)}
 */
var i = null;

/**
 * Holds length of an Array in for-loops
 * @type {(null | Number)}
 */
var len = null;

/**
 * Holds the map Object generated by Google Maps
 * @type {(null | Object)}
 */
var map = null;

/**
 * Holds PlaceServices API
 * @type {(null | Object)}
 */
var service = null;


/* GOOGLE MAPS
----------------------------------------------------------------------------*/
/**
 * Initial callback function for Google Maps
 * @function initMaps
 */
function initMaps() {
  if (geolocationService.checkGeolocation() === true && geolocationService.checkOnlineStatus() === true) {
    navigator.geolocation.getCurrentPosition(buildMap, geolocationService.handleError);
  }
}

/**
 * Loads script tags on to the DOM (here it's only for Google Maps)
 * @function callGoogleMaps
 * @param {string} apiKey - Your Google Maps API key
 */
function callGoogleMaps(apiKey) {
  var mapsUrl = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&libraries=places';

  $.ajax({
    url: mapsUrl,
    dataType: 'jsonp'
  })
    .done(initMaps);
}

/**
 * Makes search results alphabetical
 * @function sortResults
 * @param {Array.<Object>} dataArray - The array containing the retrieved places data
 */
function sortResults(dataArray) {
  var sortedNamesArray = [];
  var sortedDataArray = [];
  var temp, j;

  for (i = 0; i < dataArray.length; i++) {
    temp = dataArray[i].name;
    sortedNamesArray.push(temp);
    // placesOpenData[temp.id] = temp.opening_hours.isOpen;
  }

  sortedNamesArray.sort();
  var lenB = sortedNamesArray.length;

  for (i = 0; i < lenB; i++) {
    for (j = 0; j < dataArray.length; j++) {
      if (sortedNamesArray[i] === dataArray[j].name) {
        temp = dataArray[j];
        sortedDataArray.push(temp);
        dataArray.splice(j, 1);
        temp = null;
      }
    }
  }

  return sortedDataArray;
}

/**
 * Processes search results and applies Knockout JS binding context
 * This is a request callback of nearbySearch service in buildMap()
 * @function callback
 * @param {Array.<Object>} results - The array containing the retrieved places data
 * @param {Object} status - Contains the status data send back from the place request
 */
function callback(results, status) {
  var bounds = new google.maps.LatLngBounds();
  var sortedResults;
  var viewModelObj;

  if (status === 'OK') {
    sortedResults = sortResults(results);

    for (i = 0, len = sortedResults.length; i < len; i++) {
      bounds.extend(sortedResults[i].geometry.location);
    }

    map.fitBounds(bounds);

    // Implementing Knockout JS /
    viewModelObj = new AppViewModel(map, sortedResults, loadMarkerData);
    ko.applyBindings(viewModelObj);
    viewModelObj.initializeAppView();
  }
  else {
    geolocationService.handleError(status);
  }
}

/**
 * Builds Google Maps object from from Javascript geolocation API response data
 * @function buildMap
 * @param {Object} posObj - Holds location data from JS geolocation response object
 */
function buildMap(posObj) {
  var lat = posObj.coords.latitude;
  var lon = posObj.coords.longitude;

  if (lat && lon) {

    if (process.env.NODE_ENV === 'development') {
      lat = 37.7833;
      lon = -122.4167;
    }

    var locObj = new google.maps.LatLng(lat, lon);

    var mapProperties = {
      center: locObj,
      zoom: 15,
      disableDefaultUI: true
    };

    var request = {
      location: locObj,
      radius: 1000,
      types: ['cafe', 'bakery'],
      keyword: 'coffee'
    };

    try {
      map = new google.maps.Map(document.getElementById('map-canvas'), mapProperties);
      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);
    }
    catch (err) {
      geolocationService.handleError(err);
    }
  }
  else {
    geolocationService.handleError('Unable to get user location.');
  }
}


/* MARKER DATA LOADER
----------------------------------------------------------------------------*/
/**
 * Loads data from Google Place Search APIs to clicked marker
 * @function loadMarkerData
 * @param {Object} mkrObj - The object containing the data for a marker
 */
function loadMarkerData(mkrObj) {
  var requestObj = {
    placeId: mkrObj.id
  };

  service.getDetails(requestObj, function (place, status) {
    var placeDataList = ['photos', 'address_components', 'formatted_phone_number', 'international_phone_number', 'price_level', 'rating', 'user_ratings_total', 'opening_hours', 'reviews', 'url'];
    var curItem = null;
    var phone = null;

    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (i = 0, len = placeDataList.length; i < len; i++) {
        curItem = place[placeDataList[i]];
        if (typeof curItem === 'undefined') {
          place[placeDataList[i]] = '?';
        }
      }

      // Photos
      if (typeof place.photos === 'object') {
        place.photos.forEach(function (photo) {
          mkrObj.photos.push(photo.getUrl({
            'maxWidth': 350,
            'maxHeight': 200
          }));
        });
      }
      else {
        mkrObj.photos.push('https://lh3.googleusercontent.com/_nFDV0pen9rXCLMAw0zyVxiG-xspV2EDK1xJ1RcMm1rn3RjWvh-DJHGuVD8YIs7TMxZLLQkHBSvsoGS3yBbnV4tQmJDVx-UXW-wvOKwOULfuIO-3QbFvt-K3oVUFIjYGT7vMSMLaWg=s300-no');
        console.log('No photos for ' + place.name);
      }

      // Address, phone and homepage 
      mkrObj.address1(place.address_components[0].long_name + ' ' + place.address_components[1].long_name);
      mkrObj.address2(place.address_components[2].long_name + ', ' + place.address_components[3].short_name +
        ' ' + place.address_components[5].short_name);

      if (place.formatted_phone_number !== '?') {
        phone = place.formatted_phone_number;
      }
      else {
        phone = place.international_phone_number;
      }

      mkrObj.phone(phone);
      mkrObj.hp(place.website);

      // Price, rating and status
      if (place.price_level !== '?') {
        var priceLvl = '';
        for (i = 0; i < place.price_level; i++) {
          priceLvl += '$';
        }
        mkrObj.price(priceLvl);
      }
      else {
        mkrObj.price('?');
      }

      mkrObj.ratingText(place.rating + ' (' + place.user_ratings_total + ' total ratings)');

      if (place.opening_hours.isOpen === true) {
        mkrObj.status('Now Open');
      }
      else {
        mkrObj.status('Now Closed');
      }

      // Review snippit with source link
      var clip = '';
      if (place.reviews !== '?') {
        clip = place.reviews[0].text;
        if (clip.length > 150) {
          clip = clip.slice(0, 150) + '...';
        }
        mkrObj.clipping(clip);
        mkrObj.url(place.url);
      }
      else if (place.url !== '?') {
        clip = 'View more details';
        mkrObj.clipping(clip);
        mkrObj.url(place.url);
      }
      else {
        clip = 'No comments or link available.';
      }
    }
    else {
      geolocationService.handleError(status);
    }
  });
}


module.exports = (function () {
  return {
    loadMarkerData: loadMarkerData,
    callGoogleMaps: callGoogleMaps
  }
})();