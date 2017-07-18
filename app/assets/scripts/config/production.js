'use strict';

module.exports = {
  environment: 'production',
  uploadBucket: 'oam-uploader-production-temp',
  googleClient: '36015894456-p23fapcrlb8gu5jso00j69uv1c8861j1.apps.googleusercontent.com',
  googleDeveloperKey: '',
  map: {
    mapbox: {
      accessToken: 'pk.eyJ1Ijoib3BlbmFlcmlhbG1hcCIsImEiOiJjaXl4MjM5c20wMDBmMzNucnZtbnYwZTcxIn0.IKG5flWCS6QfpO3iOdRveg'
    },

    initialZoom: 3,
    minZoom: 2,
    maxZoom: 18,

    initialView: [-18.632, 18.479]
  },
  catalog: {
    url: 'https://api.openaerialmap.org'
  },
  oamStatus: 'https://status.openaerialmap.org/healthcheck',
  feedbackSubmissionURL: 'https://getsimpleform.com/messages/ajax?form_api_token=506fc2ac58582416b6086a68a343e344'
};
