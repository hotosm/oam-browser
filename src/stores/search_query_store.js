import Reflux from "reflux";
import _ from "lodash";

import actions from "actions/actions";

/**
 * Models the "search parameters" from the point of view of the application.
 * NOT responsible for understanding the API -- that's done by map_store, which
 * consumes this one.
 */
export default Reflux.createStore({
  _parameters: {
    date: "all",
    resolution: "all",
    dataType: "all"
  },

  init: function() {
    this.listenTo(actions.setDateFilter, this.onSetDateFilter);
    this.listenTo(actions.setResolutionFilter, this.onSetResolutionFilter);
    this.listenTo(actions.setDataTypeFilter, this.onSetDataTypeFilter);
  },

  onSetDateFilter: function(period) {
    this._setParameter({ date: period });
  },

  onSetResolutionFilter: function(resolutionLevel) {
    this._setParameter({ resolution: resolutionLevel });
  },

  onSetDataTypeFilter: function(type) {
    this._setParameter({ dataType: type });
  },

  _setParameter: function(params) {
    // update stored search params
    _.assign(this._parameters, params);
    for (var key in this._parameters) {
      if (this._parameters[key] === null) {
        delete this._parameters[key];
      }
    }
    this.trigger(this._parameters, Object.keys(params)[0]);
  },

  getParameters: function() {
    return this._parameters;
  }
});
