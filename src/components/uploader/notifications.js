import PropTypes from "prop-types";
import React from "react";

import CloseIcon from "mdi-react/CloseIcon";

export default class Notifications extends React.Component {
  static displayName = "Notifications";

  static propTypes = {
    type: PropTypes.string,
    onNotificationDismiss: PropTypes.func,
    children: PropTypes.node
  };

  dismissNotification = e => {
    e.preventDefault();
    this.props.onNotificationDismiss();
  };

  render() {
    if (this.props.type === null) {
      return null;
    }

    var classes = "notification notification-" + this.props.type;
    return (
      <div className={classes} role="alert">
        <p>{this.props.children}</p>
        <a
          className="notification-dismiss"
          title="Dismiss notification"
          onClick={this.dismissNotification}
        >
          <CloseIcon />
        </a>
      </div>
    );
  }
}
