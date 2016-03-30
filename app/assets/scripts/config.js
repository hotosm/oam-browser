'use strict';

module.exports = {
  map: {
    mapbox: {
      accessToken: 'pk.eyJ1IjoiaG90IiwiYSI6IjU3MjE1YTYxZGM2YmUwMDIxOTg2OGZmNWU0NzRlYTQ0In0.MhK7SIwO00rhs3yMudBfIw'
    },

    baseLayer: 'hot.ml5mgnm7',

    initialZoom: 8,
    minZoom: 2,
    maxZoom: undefined,

    initialView: [60.177, 25.148]
  },
  catalog: {
    url: 'https://api.openaerialmap.org'
  },
  oamStatus: 'https://status.openaerialmap.org/healthcheck'
};
