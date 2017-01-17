/* global L */
'use strict';
import React from 'react';

import { Dropdown } from 'oam-design-system';
import baseLayers from '../utils/map-layers';
import actions from '../actions/actions';
import mapStore from '../stores/map_store';

var MapLayers = React.createClass({
  displayName: 'MapLayers',

  getInitialState: function () {
    return {
      selectedLayer: mapStore.getBaseLayer()
    };
  },

  onLayerSelect: function (layer, e) {
    e.preventDefault();
    actions.setBaseLayer(layer);
    this.setState({selectedLayer: layer});
  },

  render: function () {
    return (
      <Dropdown
        triggerElement='a'
        triggerClassName='button-layers'
        triggerActiveClassName='button--active'
        triggerTitle='Choose map layer'
        triggerText='Choose map layer'
        direction='left'
        className='drop__content--maplayers'
        alignment='middle'>

          <ul className='drop__menu drop__menu--select map-layers-list'>
            {baseLayers.map(o => <li key={o.id}>
              <MapLayerItem
                selectedLayer={this.state.selectedLayer}
                layer={o}
                onLayerSelect={this.onLayerSelect}
              />
            </li>)}
          </ul>

      </Dropdown>
    );
  }
});

module.exports = MapLayers;

// Each Map layer it's its own component because we need to be able to add the
// actual map on component mount.
var MapLayerItem = React.createClass({
  displayName: 'MapLayerItem',

  propTypes: {
    selectedLayer: React.PropTypes.object,
    layer: React.PropTypes.object,
    onLayerSelect: React.PropTypes.func
  },

  map: null,

  componentDidMount: function () {
    this.map = L.mapbox.map(this.refs.map, null, {zoomControl: null});
    this.map.addLayer(L.tileLayer(this.props.layer.url))
      .setView([9, 0], 0);

    // Disable drag and zoom handlers.
    this.map.dragging.disable();
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
    this.map.keyboard.disable();

    // Disable tap handler, if present.
    if (this.map.tap) this.map.tap.disable();
  },

  componentWillUnmount: function () {
    this.map.remove();
  },

  render: function () {
    let c = 'drop__menu-item';
    c += this.props.selectedLayer.id === this.props.layer.id ? ' drop__menu-item--active' : '';
    return (
      <a href='#' className={c} onClick={this.props.onLayerSelect.bind(null, this.props.layer)} data-hook='dropdown:close'>
        <div className='map-layers-list__map' ref='map'></div>
        <span className='map-layers-list__text'>{this.props.layer.name}</span>
      </a>
    );
  }
});
