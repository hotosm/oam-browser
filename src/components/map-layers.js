/* global L */
import PropTypes from "prop-types";
import React from "react";

import LayersIcon from "mdi-react/LayersIcon";

import Dropdown from "oam-design-system/dropdown";
import baseLayers from "utils/map-layers";
import actions from "actions/actions";
import mapStore from "stores/map_store";

class MapLayers extends React.Component {
  static displayName = "MapLayers";

  state = {
    selectedLayer: mapStore.getBaseLayer()
  };

  onLayerSelect = (layer, e) => {
    e.preventDefault();
    actions.setBaseLayer(layer);
    this.setState({ selectedLayer: layer });
  };

  render() {
    return (
      <span className="bttn-secondary map-menu-layers">
        <LayersIcon />
        <Dropdown
          triggerElement="a"
          triggerText=""
          className="drop__content--maplayers"
          alignment="right"
        >
          <ul className="drop__menu drop__menu--select map-layers-list">
            {baseLayers.map(o => (
              <li key={o.id}>
                <MapLayerItem
                  selectedLayer={this.state.selectedLayer}
                  layer={o}
                  onLayerSelect={this.onLayerSelect}
                />
              </li>
            ))}
          </ul>
        </Dropdown>
      </span>
    );
  }
}

// Each Map layer it's its own component because we need to be able to add the
// actual map on component mount.
class MapLayerItem extends React.Component {
  static displayName = "MapLayerItem";

  static propTypes = {
    selectedLayer: PropTypes.object,
    layer: PropTypes.object,
    onLayerSelect: PropTypes.func
  };

  map = null;

  componentDidMount() {
    this.map = L.mapbox.map(this.refs.map, null, { zoomControl: null });
    this.map.addLayer(L.tileLayer(this.props.layer.url)).setView([9, 0], 0);

    // Disable drag and zoom handlers.
    this.map.dragging.disable();
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
    this.map.keyboard.disable();

    // Disable tap handler, if present.
    if (this.map.tap) this.map.tap.disable();
  }

  componentWillUnmount() {
    this.map.remove();
  }

  render() {
    let c = "drop__menu-item";
    c +=
      this.props.selectedLayer.id === this.props.layer.id
        ? " drop__menu-item--active"
        : "";
    return (
      <a
        className={c}
        onClick={this.props.onLayerSelect.bind(null, this.props.layer)}
        data-hook="dropdown:close"
      >
        <div className="map-layers-list__map" ref="map" />
        <span className="map-layers-list__text">{this.props.layer.name}</span>
      </a>
    );
  }
}

export default MapLayers;
