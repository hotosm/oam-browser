var chroma = require('chroma-js')

var GRID_FILL = '#0ff'
var GRID_STROKE = chroma(GRID_FILL).darken().desaturate().hex()
var WATER_COLOR = '#899'
var BACKGROUND = chroma(WATER_COLOR).darken().hex()

/**
 * Generates a style sheet with a simple base layer, and a color-scaled grid
 * with `breaks` levels.  Grid boxes are colored according to the value of
 * `property`, which is expected to range between 0 and `maxVal`.
 */
module.exports = function (property, breaks, maxVal) {

  var style = {
    'version': 8,
    'name': 'Basic',
    'sources': {
      'mapbox': {
        'type': 'vector',
        'url': 'mapbox://mapbox.mapbox-streets-v6'
      },
      'grid': {
        'type': 'vector',
        'url': 'mapbox://devseed.oam-footprints'
      },
      'grid-hover': {
        'type': 'geojson',
        'data': { 'type': 'FeatureCollection', 'features': [] }
      },
      'result-footprint': {
        'type': 'geojson',
        'data': { 'type': 'FeatureCollection', 'features': [] }
      },


      'grid-hover-num': {
        'type': 'geojson',
        'data': { 'type': 'FeatureCollection', 'features': [] }
      }
    },
    'sprite': '',
    'glyphs': 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    'layers': [{
      'id': 'background',
      'type': 'background',
      'paint': {
        'background-color': BACKGROUND
      }
    }, {
      'id': 'water',
      'type': 'fill',
      'source': 'mapbox',
      'source-layer': 'water',
      'paint': {
        'fill-color': WATER_COLOR
      }
    }, {
      'id': 'states',
      'type': 'line',
      'source': 'mapbox',
      'source-layer': 'admin',
      'paint': {
        'line-color': chroma(BACKGROUND).darken().hex()
      }
    }, {
      'id': 'pop',
      'interactive': true,
      'type': 'line',
      'source': 'grid',
      'source-layer': 'footprints',
      'paint': {
        'line-color': GRID_STROKE
      }
    }
    ]
  }

  // Dynamically generate a set of layers that mimic data-driven styling.
  // This set of layers is like a color scale: it selects features with the
  // appropriate data values with `filter`, and then styles them with the
  // approprieate `fill-opacity`.
  for (var i = 0; i < breaks; i++) {
    style.layers.push({
      'id': 'footprint-grid-' + i,
      'interactive': true,
      'type': 'fill',
      'source': 'grid',
      'source-layer': 'footprints',
      'paint': {
        'fill-color': GRID_FILL,
        'fill-opacity': i / breaks
      },
      'filter': [ 'all',
        [ '>', property, i / breaks * maxVal ],
        [ '<=', property, (i + 1) / breaks * maxVal ]
      ]
    })
  }

  // add the hover style layer at the end so it goes on top
  style.layers.push({
    id: 'hover-style',
    type: 'fill',
    source: 'grid-hover',
    paint: {
      'fill-color': 'rgba(200, 50, 50, 0.5)'
    },
    filter: ['>', property, 0]
  });

  style.layers.push({
    id: 'result-footprint-style',
    type: 'line',
    source: 'result-footprint',
    paint: {
      'line-color': 'rgba(0, 0, 255, 0.8)'
    },
  });



  style.layers.push({
    id: 'number-count',
    type: 'symbol',
    source: 'grid-hover-num',
    layout: {
      "text-field": "{" + property + "}",
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      "text-size": 12,

            "text-offset": [0,0],
            "text-anchor": "top",
    },
    paint: {
      }
  });

  return style
}
