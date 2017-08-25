import config from "../config";

export default [
  {
    id: "oam-base",
    name: "Mapbox Light",
    url:
      "https://api.mapbox.com/styles/v1/openaerialmap/ciyx269by002w2rldex1768f5/tiles/256/{z}/{x}/{y}?access_token=" +
      config.map.mapbox.accessToken
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
      config.map.mapbox.accessToken
  }
];
