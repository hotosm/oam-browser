'use strict';
/*
 * App config for production.
 */

module.exports = {
  environment: 'production',
  map: {
    mapbox: {
      accessToken: 'pk.eyJ1Ijoib3BlbmFlcmlhbG1hcCIsImEiOiJjaXl4MjM5c20wMDBmMzNucnZtbnYwZTcxIn0.IKG5flWCS6QfpO3iOdRveg'
    },

    initialZoom: 3,
    minZoom: 2,
    maxZoom: undefined,

    initialView: [-18.632, 18.479]
  },
  catalog: {
    url: 'https://api.openaerialmap.org'
  },
  oamStatus: 'https://status.openaerialmap.org/healthcheck',
  feedbackSubmissionURL: 'https://docs.google.com/a/developmentseed.org/forms/d/1VOcERexikGP5N6xkjPDgUuDLUcS_Ktxj_ALNokNuttc/formResponse'
};
