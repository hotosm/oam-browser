var chroma = require('chroma-js')
var mapboxLight = require('./mapbox-light.json')

var GRID_FILL = '#439ab4'
var GRID_FILL_MAX_OPACITY = 0.6
var GRID_STROKE = '#1f3b45'

mapboxLight.layers.forEach(function (layer) {
  layer.interactive = false;
});

/**
 * Generates a style sheet with a simple base layer, and a color-scaled grid
 * with `breaks` levels.  Grid boxes are colored according to the value of
 * `property`, which is expected to range between 0 and `maxVal`.
 */
module.exports = function () {
  var style = {
    'version': 8,
    'name': 'Basic',
    'sources': {
      'mapbox': {
        'type': 'vector',
        'url': 'mapbox://mapbox.mapbox-streets-v6'
      },
      'mapbox://mapbox.mapbox-terrain-v2': {
        'url': 'mapbox://mapbox.mapbox-terrain-v2',
        'type': 'vector'
      },
      'crosshair': {
        'type': 'geojson',
        'data': { 'type': 'FeatureCollection', 'features': [] }
      },
    },
    'sprite': 'mapbox://sprites/devseed/cife4hfep6f88smlxfhgdmdkk',
    'glyphs': 'mapbox://fonts/devseed/{fontstack}/{range}.pbf',
    'layers': mapboxLight.layers
  }

  style.layers.push({
    'id': 'crosshair',
    'interactive': false,
    'type': 'line',
    'source': 'crosshair',
    'paint': {
      'line-color': GRID_STROKE,
      'line-opacity': 0.3
    }
  });

  return style
}