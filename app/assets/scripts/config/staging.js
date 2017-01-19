'use strict';
/*
 * App config overrides for staging.
 */

module.exports = {
  environment: 'staging',
  map: {
    mapbox: {
      accessToken: 'pk.eyJ1IjoiaG90IiwiYSI6ImNpdmlkM2lkMDAwYTAydXBnNXFkd2EwemsifQ.KPrUb_mKlPmHCR6LNrSihQ'
    },

    initialZoom: 8,
    minZoom: 2,
    maxZoom: undefined,

    initialView: [60.177, 25.148]
  },
  catalog: {
    url: 'https://oam-catalog-staging.herokuapp.com'
  }
};
