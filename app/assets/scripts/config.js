'use strict';

module.exports = {
  map: {
    baseLayer: 'devseed.m9i692do',

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
  }
};