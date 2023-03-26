module.exports = {
  feedbackSubmissionURL:
    "https://getsimpleform.com/messages/ajax?form_api_token=506fc2ac58582416b6086a68a343e344",
  catalog: {
    url: "https://api.openaerialmap.org"
  },
  environment: "staging",
  uploadBucket: "oam-uploader-staging-temp",
  googleClient:
    "36015894456-3d5ka80qtpaqcjhco3lsl38s1fj0dr71.apps.googleusercontent.com",
  googleDeveloperKey: "",
  googleAppId: "",
  OAMBrowserUrl: "http://map-staging.openaerialmap.org/",
  awsKey: "AKIAI4XOYETOVGTNP5HA",
  map: {
    initialZoom: 3,
    minZoom: 2,
    maxZoom: 18,

    initialView: [-18.632, 18.479],

    oamMosaicLayer: null,

    baseLayers: [
      {
        id: "osm",
        name: "OpenStreetMap (Standard)",
        url: "http://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
      }
    ]
  }
};
