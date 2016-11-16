'use strict';
import config from '../config';

module.exports = [
  {
    id: 'oam-base',
    name: 'Mapbox Light',
    url: 'https://api.mapbox.com/styles/v1/hot/cividbt4w00ax2jn8517i2nc9/tiles/256/{z}/{x}/{y}?access_token=' + config.map.mapbox.accessToken
  },
  {
    id: 'osm',
    name: 'OpenStreetMap (Standard)',
    url: 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
  },
  {
    id: 'satellite',
    name: 'Mapbox Satellite',
    url: 'https://api.mapbox.com/styles/v1/hot/civicyccw00bv2io77zqq401h/tiles/256/{z}/{x}/{y}?access_token=' + config.map.mapbox.accessToken
  }
];
