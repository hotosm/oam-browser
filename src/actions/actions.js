var Reflux = require("reflux");

module.exports = Reflux.createActions({
  selectedBbox: {},

  footprintsLoaded: {},

  // Filter actios
  setDateFilter: {
    shouldEmit: function(val) {
      return ["all", "week", "month", "year"].indexOf(val) >= 0;
    }
  },
  setResolutionFilter: {
    shouldEmit: function(val) {
      return ["all", "low", "medium", "high"].indexOf(val) >= 0;
    }
  },
  setDataTypeFilter: {
    shouldEmit: function(val) {
      return ["all", "service"].indexOf(val) >= 0;
    }
  },

  // Results pane related actions.
  resultOver: {},
  resultOut: {},
  resultSelected: {},

  // openModal(which)
  openModal: {},

  fitToBounds: {},
  moveToCoords: {},

  requestMyLocation: {},

  selectPreview: {},

  setBaseLayer: {},

  showNotification: {},
  clearNotification: {},
  clearNotificationAfter: {},

  userLogOut: {},
  userLogIn: {}
});
