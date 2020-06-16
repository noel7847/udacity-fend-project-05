/**
 * @fileOverview Knockout view model
 * @author Noel Noche
 * @version 1.0.0
 */

/* global $ ko */

/** @module AppViewModel */

/**
 * AppViewModel class
 * @class Represents the View Model of the application
 * @param {Object} map - The Google Maps map Object
 * @param {Array.<Object>} results - The array containing the retrieved places data
 * @param {Object} loadMarkerData - GoogleMaps.loadMarkerData
 * @property {string} query - The string entered in the search filter
 * @property {boolean} noMatch - Signals when search filter query returns no matches
 * @property {Array.<Object>} markerList - Holds the marker (location) objects
 * @property {Object} currentMarker - Holds the currently selected marker
 * @property {Object} lastActive - Holds the previously selected marker
 * @property {boolean} showMenu - Signals when the location list should be visible
 * @property {number} viewportWidth - Tracks viewport size to optimize layout for mobile screens
 * @property {boolean} raterFilterOn - Indicates when the filter for highly rated places is on
 * @property {Array.<Object>} ratersArray - Holds marker (location) objects that are highly rated
 */
function AppViewModel(map, results, loadMarkerData) {
  'use strict';

  /** @this {AppViewModel} */
  var self = this;

  /**
   * Holds the imported MarkerViewModel class
   * @type {(Object)}
   */
  var MarkerViewModel = require('./component.markerview');

  /**
   * Holds the current index of an Array in for-loops
   * @type {(null| Object)}
   */
  var i = null;

  /**
   * Holds length of an Array in for-loops
   * @type {(null | Object)}
   */
  var len = null;

  /**
   * Holds local address of the business
   * @type {(Object)}
   */
  var locAddr = results[0].vicinity;
  var locAddrLen = locAddr.split(",").length;
  
  if (locAddrLen > 0) {
    self.location = locAddr.split(',')[locAddrLen - 1];
  }
  else {
    self.location = "?";
  }
  self.query = ko.observable('');
  self.noMatch = ko.observable(false);
  self.markerList = ko.observableArray();
  self.currentMarker = ko.observable();

  /**
   * To avoid a cluttered window, (and because all markers share the same modal window)
   * we need to keep track of the previously clicked location
   */
  self.lastActive = ko.observable();
  self.showMenu = ko.observable(true);
  self.viewportWidth = ko.observable(window.screen.width);
  self.raterFilterOn = ko.observable(false);
  self.ratersArray = ko.observableArray();

  /**
   * Initializes the arrays corresponding to the marker (location) and "top rater" objects
   * Also checks localStorage for user memo data and updates the corresponding marker properties
   * @memberof AppViewModel.protoype
   * @method initializeAppView
   */
  self.initializeAppView = function() {
    /**
     * Technique for updating ko observable arrays without invoking binding
     * every time an item is added (which would increase latency)
     */
    var subArray1 = self.markerList;
    var subArray2 = self.ratersArray;

    results.forEach(function(result) {
      var mkrObj = new MarkerViewModel(self, map, result);
      
      if (localStorage[mkrObj.name]) {
        mkrObj.memo(localStorage[mkrObj.name]);
        mkrObj.hasMemo(true);
      }

      if (mkrObj.topRanker()) {
        subArray2.push(mkrObj);
      }
      subArray1.push(mkrObj);
    });

    subArray1.valueHasMutated();
    subArray2.valueHasMutated();
  };

  /**
   * Filters out the top rated places
   * @memberof AppViewModel.prototype
   * @method filter_raters
   */
  self.filter_raters = function() {
    var $rankerBtn =  $('.nav__ranker-btn');
    var $rankerBtnImg = $('.ranker-btn__img');

    if (!self.raterFilterOn()) {
      self.raterFilterOn(true);
      $rankerBtn.toggleClass('nav__ranker-btn--active');
      $rankerBtnImg.attr('src', 'assets/icon_star-white.svg');

      for (i = 0, len = self.markerList().length; i < len; i++) {
        self.markerList()[i].pin.setMap(null);
      }

      self.ratersArray().forEach(function(mkrObj) {
        if (mkrObj.topRanker()) {
          mkrObj.pin.setMap(map);
        }
      });
    }
    else {
      $rankerBtn.toggleClass('nav__ranker-btn--active');
      self.raterFilterOn(false);
      $rankerBtnImg.attr('src', 'assets/icon_star-black.svg');

      for (i = 0, len = self.markerList().length; i < len; i++) {
        self.markerList()[i].pin.setMap(map);
      }
    }
  };

  /**
   * Sets the clicked marker, keeping only one marker active at a time
   * @memberof AppViewModel.prototype
   * @method filter_raters
   */
  self.set_marker = function(clickedMarker) {
    if (self.lastActive() && self.lastActive().name !== clickedMarker.name) {
      self.lastActive().infoWin.close();
      self.lastActive().winOpen = false;
      self.currentMarker(clickedMarker);
    }
    else {
      self.currentMarker(clickedMarker);
    }

    // On smaller screens, closes the places list while the marker is selected
    if (self.viewportWidth() < 750) {
      self.showMenu(false);
    }

    clickedMarker.toggleBounce();
    clickedMarker.centerOn();

    loadMarkerData(clickedMarker);

    self.lastActive(clickedMarker);
  };

  /**
   * Filters out all places that match the current letters entered in the search filter bar
   * @memberof AppViewModel.prototype
   * @method filtered
   */
  self.filtered = ko.computed(function() {
    var filterGroup;
    var filter = self.query().toLowerCase().replace(/\s+/g, '');

    if (self.raterFilterOn()) {
      filterGroup = self.ratersArray();
    }
    else {
      filterGroup = self.markerList();
    }

    /** Checks if user input valid search query; otherwise, returns a "No matches" message */
    for (i = 0; i < results.length; i++) {
      if (results[i].name.toLowerCase().replace(/\s+/g, '').indexOf(filter) > -1) {
        self.noMatch(false);
        break;
      }
      self.noMatch(true);
    }

    if (!filter) {
      for (i = 0; i < filterGroup.length; i++) {
        filterGroup[i].pin.setMap(map);
      }
      return filterGroup;
    }
    else {
      return ko.utils.arrayFilter(filterGroup, function(place) {
        if (place.name.toLowerCase().replace(/\s+/g, '').indexOf(filter) > -1) {
          place.pin.setMap(map);
          return place;
        }
        else {
          place.pin.setMap(null);
        }
      });
    }
  });

  /* CUSTOM KO BINDERS
  ----------------------------------------------------------------------------*/
  /**
   * Custom Knockout binding for applying a highlight effect when user
   * hovers the mouse pointer over an item in the locations list
   * @function highlight
   * @memberof AppViewModel
   * @param {Object} element - The element to which the binding is applied
   * @param {number} valueAccessor - The duration of the highlight effect
   */
  ko.bindingHandlers.highlight = {
    update: function(element, valueAccessor) {
      var duration = valueAccessor();
      $(element).mouseenter(function() {
        $(element).fadeTo(duration, 0.5);
      });
      $(element).mouseleave(function() {
        $(element).fadeTo(duration, 1);
      });
    }
  };

  /**
   * Custom Knockout binding for applying a fade-in effect
   * @function fadein
   * @memberof AppViewModel
   * @param {Object} element - The element to which the binding is applied
   * @param {number} valueAccessor - The duration of the fade-in animation
   */
  ko.bindingHandlers.fadein = {
    update: function(element, valueAccessor) {
      var duration = valueAccessor();
      $(element).fadeIn(duration);
    }
  };

  /**
   * Custom Knockout binding for toggle fade effect
   * @function fadeVisible
   * @memberof AppViewModel
   * @param {Object} element - The element to which the binding is applied
   * @param {number} valueAccessor - The duration of the fade-in animation
   */
  ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
      var value = valueAccessor();
      $(element).toggle(ko.unwrap(value));
    },
    update: function(element, valueAccessor) {
      var value = valueAccessor();

      if (ko.unwrap(value)) {
        $(element).fadeIn();
      }
      else {
        $(element).fadeOut();
      }
    }
  };
}

module.exports = AppViewModel;
