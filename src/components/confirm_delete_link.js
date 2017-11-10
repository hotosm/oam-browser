import React from "react";
import PropTypes from "prop-types";

class ConfirmDeleteLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicked: false };
  }

  render() {
    let link = null;
    if (this.state.clicked) {
      link = (
        <span>
          <a onClick={this.props.deleteImage} className="imagery-delete">
            Click To Confirm Delete
          </a>{" "}
          |&nbsp;
          <a onClick={() => this.setState({ clicked: false })}>Cancel Delete</a>
        </span>
      );
    } else {
      link = (
        <a
          onClick={() => this.setState({ clicked: true })}
          className="imagery_delete"
        >
          Delete
        </a>
      );
    }
    return <span>{link}</span>;
  }
}

ConfirmDeleteLink.propTypes = {
  deleteImage: PropTypes.func.isRequired
};

export default ConfirmDeleteLink;
