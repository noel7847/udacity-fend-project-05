/**
 * Map marker component
 * @module component.markerview
 * @version 1.0.0
 */


/* global $ google ko  */

/**
 * MarkerViewModel class
 * @class
 * @param {Object} parent - The AppViewModel Object
 * @param {Object} map - The Google Maps map Object
 * @param {Object} data - The data returned form Google Maps and third-party services
 * @property {boolean} winOpen - Keeps track of InfoWindow state
 * @property {string} name - The name of the place
 * @property {string} vicinity - The simplified address of the place
 * @property {Object} placeLoc - Contains the place coordinates
 * @property {string} memo - Holds memo data input by the user
 * @property {boolean} hasMemo - Indicates if the place has memo data
 * @property {boolean} memoOn - Keeps track of state of memo composition window
 * @property {number} topRanker - Marks if the place has a rating of 4.5 or greater
 * @property {Array.<string>} photos - Holds array of photo urls
 * @property {string} id - Unique identifier which is used to get more detailed info on the place
 * @property {string} address1 - Holds part of the complete address
 * @property {string} address2 - Holds part of the complete address
 * @property {string} hp - Hold the homepage url
 * @property {string} phone - Holds the phone number
 * @property {string} url - Holds the url to the reviews source
 * @property {string} status - Holds the current store status (opened or closed)
 * @property {string} price - Holds the price level
 * @property {number} ratingText - Holds rating from Places Library
 * @property {string} clipping - Holds the first few lines of a review
 * @property {Object} pin - Holds the marker pin data
 * @property {Object} infoWin - Holds the data for the info window (not modal window)
 */
function MarkerViewModel(parent, map, data) {
  'use strict';

  /**
   * Imported geolocation module
   * @type {Object}
   */
  var geolocationService = require('./service.geolocation');

  /** @this {MarkerViewModel} */
  var self = this;

  /**
   * For limiting the length of the marker bounce animation
   * @type {(null | number)}
   */
  var timer = null;

  self.winOpen = false;
  self.name = data.name;
  self.address = data.vicinity;
  self.placeLoc = data.geometry.location;
  self.memo = ko.observable();
  self.hasMemo = ko.observable(false);
  self.memoOn = ko.observable(false);
  self.topRanker = ko.observable(false);
  self.photos = ko.observableArray([]);
  self.id = data.place_id;
  self.address1 = ko.observable();
  self.address2 = ko.observable();
  self.hp = ko.observable();
  self.phone = ko.observable();
  self.url = ko.observable();
  self.ratingText = ko.observable();
  self.status = ko.observable();
  self.price = ko.observable();
  self.clipping = ko.observable();

  /** Default marker options */
  var mkrOptions = {
    position: self.placeLoc,
    title: data.name,
    animation: google.maps.Animation.DROP
  };

  // Sets alternative icon for high ranking business
  if (data.rating >= 4.5) {
    self.topRanker(true);
    mkrOptions.icon = 'assets/star-pin.png';
  }

  self.pin = new google.maps.Marker(mkrOptions);

  /** Info window content */
  var infoWinOptions = {
    content: '<div class="infowin">' +
      '<div class="infowin__title"><strong>' + self.name + '</strong></div>' +
      '<button type="button" class="btn btn-light btn-outline-secondary infowin__btn btn--border-ccc" data-toggle="modal" data-target="#modalWin">Details</button>' +
      '</div>'
  };

  self.infoWin = new google.maps.InfoWindow(infoWinOptions);

  /**
   * Retrieves a specified array from localStorage; creates one if it doesn't exist
   * @function getMemosArray
   * @memberof MarkerViewModel
   * @param {string} arrayId - The id used to retrieve the specific array
   */
  function getMemosArray(arrayId) {
    var targetArray = localStorage.getItem(arrayId);

    if (!targetArray) {
      targetArray = [];
      localStorage.setItem(arrayId, JSON.stringify(targetArray));
    }
    else {
      targetArray = JSON.parse(targetArray);
    }
    return targetArray;
  }

  /**
   * Ensures than when the user closes the modal window for this marker,
   * the info window also closes -- for smaller screens, it brings back the list
   * @memberof MarkerViewModel.prototype
   * @method closeModal
   */
  self.closeModal = function () {
    self.winOpen = false;
    self.memoOn(false);
    if (parent.viewportWidth() < 750) {
      parent.showMenu(true);
    }
    self.infoWin.close();
  };

  /**
   * Invokes the text box when the user clicks the pencil icon on the modal window
   * @memberof MarkerViewModel.prototype
   * @method createMemo
   */
  self.createMemo = function () {
    self.memoOn(true);
    var $modalBackdrop = $('.modal-backdrop');

    // Corrects the issue where the modal's dark backdrop does not
    // fill the entire screen when the memo window is open.
    $modalBackdrop.css('height', '765px');
  };

  /**
   * Stores the memo in localStorage
   * @memberof MarkerViewModel.prototype
   * @method saveMemo
   */
  self.saveMemo = function () {
    var memosArray = getMemosArray('memosArray');
    var key = self.name;
    var value = self.memo();

    if (!memosArray) {
      geolocationService.handleError('Please check if your browser settings allow caching with localStorage API');
    }

    if (value) {
      if (memosArray[key]) {
        memosArray[key] = value;
      }
      else {
        localStorage.setItem(key, value);
        memosArray.push(key);
      }
      localStorage.setItem('memosArray', JSON.stringify(memosArray));
      self.hasMemo(true);
    }
    else {
      if (localStorage[key]) {
        localStorage.removeItem(key);
      }

      self.hasMemo(false);
    }
    self.memoOn(false);
  };

  /**
   * Centers the map to the marker when selected
   * @memberof MarkerViewModel.prototype
   * @method toggleBounce
   */
  self.centerOn = function () {
    map.panTo(self.pin.getPosition());
  };

  /**
   * Toggles the state of the map marker
   * @memberof MarkerViewModel.prototype
   * @method toggleBounce
   */
  self.toggleBounce = function () {
    if (self.winOpen) {
      window.clearTimeout(timer);
      self.pin.setAnimation(null);
      self.infoWin.close();
      self.winOpen = false;

      /** Return to list on smaller screens */
      if (parent.viewportWidth() < 750) {
        parent.showMenu(true);
      }
    }
    else {
      self.pin.setAnimation(google.maps.Animation.BOUNCE);
      timer = window.setTimeout(function () {
        self.pin.setAnimation(null);
      }, 2800);
      self.infoWin.open(map, self.pin);
      self.winOpen = true;
      if (parent.viewportWidth() < 750) {
        parent.showMenu(false);
      }
    }
  };

  /** Maps event listener for user click actions on the marker icon */
  google.maps.event.addListener(self.pin, 'click', function () {
    parent.set_marker(self);
  });

  /** Maps event listener for the close tab of the info window */
  google.maps.event.addListener(self.infoWin, 'closeclick', function () {
    self.pin.setAnimation(null);
    if (parent.viewportWidth() < 750) {
      parent.showMenu(true);
    }
  });
}

module.exports = MarkerViewModel;