'use strict';
var centroid = require('turf-centroid');
var extent = require('turf-extent');
var tilebelt = require('tilebelt');
var config = require('../config');
var $ = require('jquery');

/**
 * Converts a string to a coordinates array.
 * Assumes a string in the following format:
 * -78.30681944444444,37.79557777777777
 *
 * @param  string
 *
 * @return Array with coordinates [lng, lat]
 */
module.exports.strToCoods = function (str) {
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

module.exports.getPolygonFeature = function (coords) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: coords
    }
  };
};

/**
 * Coverts the given gsb to meters or centimeters
 * @param  float gsd in meters
 * @return string
 */
module.exports.gsdToUnit = function (gsd) {
  var unit = 'm';
  // If it's less than 1m, convert to cm so it displays more nicely
  if (gsd < 1) {
    unit = 'cm';
    gsd *= 100;
  }

  return Math.round(gsd) + ' ' + unit;
};

module.exports.quadkeyFromCoords = function (lng, lat, zoom) {
  // A square at zoom Z is the same as a map tile at zoom Z+3
  var tile = tilebelt.pointToTile(lng, lat, zoom + 3);
  return tilebelt.tileToQuadkey(tile);
};

module.exports.coordsFromQuadkey = function (quadkey) {
  var tile = tilebelt.quadkeyToTile(quadkey);
  var geoJSONTile = tilebelt.tileToGeoJSON(tile);
  return geoJSONTile.coordinates;
};

module.exports.tileCenterFromCoords = function (lng, lat, zoom) {
  // A square at zoom Z is the same as a map tile at zoom Z+3
  var tile = tilebelt.pointToTile(lng, lat, zoom + 3);
  var geoJSONTile = tilebelt.tileToGeoJSON(tile);
  var squareCenter = centroid(geoJSONTile);
  // In this way we ensure it's a copy.
  return [
    squareCenter.geometry.coordinates[0],
    squareCenter.geometry.coordinates[1]
  ];
};

module.exports.tileCenterFromQuadkey = function (quadKey) {
  var tile = tilebelt.quadkeyToTile(quadKey);
  var geoJSONTile = tilebelt.tileToGeoJSON(tile);
  return centroid(geoJSONTile);
};

module.exports.tileBboxFromQuadkey = function (quadKey) {
  var tile = tilebelt.quadkeyToTile(quadKey);
  var geoJSONTile = tilebelt.tileToGeoJSON(tile);
  return extent({ type: 'Feature', geometry: geoJSONTile });
};

module.exports.queryGeocoder = function (query, successCb, errorCb) {
  var uri = 'https://api.tiles.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(query) + '.json' +
  '?access_token=' + config.map.mapbox.accessToken;
  var req = $.get(uri);

  if (successCb) {
    req = req.success(function (data) {
      var bounds = false;
      if (data.features.length) {
        bounds = [
          [data.features[0].bbox[1], data.features[0].bbox[0]],
          [data.features[0].bbox[3], data.features[0].bbox[2]]
        ];
      }
      successCb(bounds, data);
    });
  }

  if (errorCb) {
    req = req.error(errorCb);
  }

  return req;
};

module.exports.getMapViewString = function (lng, lat, zoom) {
  // lng = Math.round(lng * 1e5) / 1e5;
  // lat = Math.round(lat * 1e5) / 1e5;
  return [lng, lat, zoom].join(',');
};

module.exports.wrap = function (feature) {
  return {
    type: feature.type,
    properties: feature.properties,
    geometry: {
      type: feature.geometry.type,
      coordinates: [ feature.geometry.coordinates[0].map(wrapPoint) ]
    }
  };
};

function wrapPoint (pt) {
  pt = [pt[0], pt[1]];
  while (pt[0] < -180) {
    pt[0] += 360;
  }

  while (pt[0] >= 180) {
    pt[0] -= 360;
  }

  return pt;
}
