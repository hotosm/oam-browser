import actions from "../actions/actions";
import userStore from "../stores/user_store";

export default {
  setup: function(_nextState, replace) {
    if (userStore.isLoggedIn()) {
      actions.userLogIn();
    } else if (userStore.isFirstCheckSinceSuccessfulOauth()) {
      userStore.getUserDetails();
    }
  },

  routeRequiresAuth: function(_nextState, replace) {
    if (!userStore.isLoggedIn()) {
      // TODO: Redirect to referrer
      replace("/");
      actions.showNotification("alert", "You must be logged in.");
    }
  },

  logOut: function(e) {
    e.preventDefault();
    actions.userLogOut();
  }
};
