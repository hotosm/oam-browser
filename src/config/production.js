module.exports = {
  awsRegion: "us-east-1",
  environment: "production",
  uploadBucket: "oam-uploader-production-temp",
  googleClient:
    "331227716208-0km1eicosmgs97uvcfgpq8gtmpok8l9b.apps.googleusercontent.com",
  googleDeveloperKey: "",
  googleAppId: "331227716208",
  map: {
    mapbox: {
      accessToken:
        "pk.eyJ1Ijoib3BlbmFlcmlhbG1hcCIsImEiOiJjaXl4MjM5c20wMDBmMzNucnZtbnYwZTcxIn0.IKG5flWCS6QfpO3iOdRveg"
    },

    initialZoom: 3,
    minZoom: 2,
    maxZoom: 18,

    initialView: [-18.632, 18.479],

    oamMosaicLayer: {
      id: "oam-mosaic",
      name: "OAM Mosaic",
      url: "https://apps.kontur.io/raster-tiler/oam/mosaic/{z}/{x}/{y}.png"
    },

    baseLayers: [
      {
        id: "oam-base",
        name: "Mapbox Light",
        url:
          "https://api.mapbox.com/styles/v1/openaerialmap/ciyx269by002w2rldex1768f5/tiles/256/{z}/{x}/{y}?access_token=" +
          "pk.eyJ1Ijoib3BlbmFlcmlhbG1hcCIsImEiOiJjaXl4MjM5c20wMDBmMzNucnZtbnYwZTcxIn0.IKG5flWCS6QfpO3iOdRveg"
      },
      {
        id: "osm",
        name: "OpenStreetMap (Standard)",
        url: "http://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
      },
      {
        id: "satellite",
        name: "Mapbox Satellite",
        url:
          "https://api.mapbox.com/styles/v1/openaerialmap/ciyx28hy800362rto0u9x10fv/tiles/256/{z}/{x}/{y}?access_token=" +
          "pk.eyJ1Ijoib3BlbmFlcmlhbG1hcCIsImEiOiJjaXl4MjM5c20wMDBmMzNucnZtbnYwZTcxIn0.IKG5flWCS6QfpO3iOdRveg"
      }
    ]
  },
  catalog: {
    url: "https://api.openaerialmap.org"
  },
  oamStatus: "https://uptime.hotosm.org",
  feedbackSubmissionURL:
    "https://getsimpleform.com/messages/ajax?form_api_token=506fc2ac58582416b6086a68a343e344",
  OAMBrowserUrl: "https://map.openaerialmap.org",
  awsKey: "AKIAZYDVV4ILMV4K5IGF",
  useTitiler: false
};
