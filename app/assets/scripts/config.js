'use strict';

module.exports = {
  map: {
    mapbox : {
      accessToken: 'pk.eyJ1IjoiaG90IiwiYSI6IjU3MjE1YTYxZGM2YmUwMDIxOTg2OGZmNWU0NzRlYTQ0In0.MhK7SIwO00rhs3yMudBfIw'
    },

    baseLayer: 'hot.ml5mgnm7',

    initialZoom: 8,
    minZoom: 8,
    maxZoom: undefined,

    initialView: [60.177, 25.148],

    // Zoom below which the interactive grid ceases to exist.
    interactiveGridZoomLimit: 8,

    grid: {
      pxSize: 48,
      atZoom: 8
    }
  },
  catalog: {
    url: 'http://api.openaerialmap.org'
  }
};