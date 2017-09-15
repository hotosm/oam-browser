import Reflux from "reflux";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false });

export default Reflux.createStore({
  storage: {
    activeFetches: []
  },

  fetchStart: function() {
    this.storage.activeFetches.push(true);
    if (this.currentActiveFetches() === 1) NProgress.start();
  },

  fetchStop: function() {
    this.storage.activeFetches.pop();
    if (this.currentActiveFetches() === 0) NProgress.done();
  },

  currentActiveFetches: function() {
    return this.storage.activeFetches.length;
  }
});
