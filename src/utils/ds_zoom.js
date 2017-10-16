/* global L */
import "mapbox.js";

// ===========================================
//
//  Leaflet zoom plugin.
//  Highly based on L.Control.Zoom
//
// ===========================================

export default L.Control.extend({
  options: {
    position: "topleft",
    containerClasses: "",
    zoomInClasses: "",
    zoomOutClasses: "",
    zoomInText: "<span>+</span>",
    zoomOutText: "<span>-</span>"
  },

  onAdd: function(map) {
    var options = this.options;
    var container = L.DomUtil.create("div", options.containerClasses);

    this._zoomInButton = this._createButton(
      options.zoomInText,
      options.zoomInClasses,
      container,
      this._zoomIn
    );
    this._zoomOutButton = this._createButton(
      options.zoomOutText,
      options.zoomOutClasses,
      container,
      this._zoomOut
    );

    this._updateDisabled();

    // Watch out for the rate at which `layeradd` is called, around 160 times
    // per map movement. It may be better to use a Reflux action.
    map.on("zoomend zoomlevelschange layeradd", this._updateDisabled, this);

    return container;
  },

  onRemove: function(map) {
    map.off("zoomend zoomlevelschange", this._updateDisabled, this);
  },

  disable: function() {
    this._disabled = true;
    this._updateDisabled();
    return this;
  },

  enable: function() {
    this._disabled = false;
    this._updateDisabled();
    return this;
  },

  _zoomIn: function(e) {
    if (!this._disabled) {
      this._map.zoomIn(e.shiftKey ? 3 : 1);
    }
  },

  _zoomOut: function(e) {
    if (!this._disabled) {
      this._map.zoomOut(e.shiftKey ? 3 : 1);
    }
  },

  _createButton: function(html, className, container, fn) {
    var link = L.DomUtil.create("button", className, container);
    link.innerHTML = html;

    L.DomEvent
      .on(link, "mousedown dblclick", L.DomEvent.stopPropagation)
      .on(link, "click", L.DomEvent.stop)
      .on(link, "click", fn, this)
      .on(link, "click", this._refocusOnMap, this);

    return link;
  },

  _updateDisabled: function() {
    var map = this._map;
    var className = "disabled";

    L.DomUtil.removeClass(this._zoomInButton, className);
    L.DomUtil.removeClass(this._zoomOutButton, className);

    if (this._disabled || map._zoom === map.getMinZoom()) {
      L.DomUtil.addClass(this._zoomOutButton, className);
    }
    if (this._disabled || map._zoom === map.getMaxZoom()) {
      L.DomUtil.addClass(this._zoomInButton, className);
    }
  }
});
