'use strict';

module.exports = {
  map: {
    mapbox : {
      accessToken: 'pk.eyJ1IjoiaG90IiwiYSI6IjU3MjE1YTYxZGM2YmUwMDIxOTg2OGZmNWU0NzRlYTQ0In0.MhK7SIwO00rhs3yMudBfIw',
      glAccessToken: 'pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJnUi1mbkVvIn0.018aLhX0Mb0tdtaT2QNe2Q'
    },

    baseLayer: 'hot.ml5mgnm7',

    initialZoom: 8,
    minZoom: 2,
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
    url: 'https://api.openaerialmap.org'
  }
};