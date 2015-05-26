'use strict';

/**
 * Converts a string to a coordinates array.
 * Assumes a string in the following format:
 * -78.30681944444444,37.79557777777777
 * 
 * @param  string
 *
 * @return Array with coordinates [lng, lat]
 */
module.exports.strToCoods = function(str) {
  if (!str) {
    return null;
  }
  var regExp = new RegExp('^(-?[0-9]{1,2}\.[0-9]+),(-?[0-9]{1,2}\.[0-9]+)$');
  var res = str.match(regExp);

  if (!res ||
    res[1] > 180 || res[1] < -180 ||
    res[2] > 90 || res[2] < -90) {
    return null;
  }

  return [parseFloat(res[1]), parseFloat(res[2])];
};


module.exports.getPolygonFeature = function(coords) {
  return {
    type: 'Feature',
    geometry: {
      type: "Polygon",
      coordinates: coords
    }
  };
};

/**
 * Coverts the given gsb to meters or centimeters
 * @param  float gsd
 * @return string
 */
module.exports.gsdToUnit = function(gsd) {
  var cm = gsd * 100 * 100;
  var unit = cm >= 100 ? 'm' : 'cm';
  return Math.round(cm) + ' ' + unit;
};