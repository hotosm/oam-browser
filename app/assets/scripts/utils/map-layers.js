'use strict';
import config from '../config';

module.exports = [
  {
    id: 'hot-base',
    name: 'Hot layer',
    url: 'http://a.tiles.mapbox.com/v4/hot.ml5mgnm7/{z}/{x}/{y}.png?access_token=' + config.map.mapbox.accessToken
  },
  {
    id: 'streets',
    name: 'Streets',
    url: 'https://a.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + config.map.mapbox.accessToken
  },
  {
    id: 'outdoors',
    name: 'Outdoors',
    url: 'https://a.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=' + config.map.mapbox.accessToken
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://a.tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=' + config.map.mapbox.accessToken
  }
];
