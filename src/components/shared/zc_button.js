import PropTypes from "prop-types";
import React from "react";
import Clipboard from "clipboard";

export default class extends React.Component {
  static displayName = "ZcButton";

  static propTypes = {
    onCopy: PropTypes.func.isRequired,
    className: PropTypes.string,
    title: PropTypes.string,
    text: PropTypes.string
  };

  static defaultProps = {
    title: "",
    className: "drop__menu-item clipboard",
    text: ""
  };

  clipboard = null;

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount() {
    this.clipboard = new Clipboard(this.refs.el, {
      text: trigger => this.props.onCopy(trigger)
    });
  }

  componentWillUnmount() {
    this.clipboard.destroy();
  }

  onCopyClick = e => {
    e.preventDefault();
  };

  render() {
    return (
      <a
        ref="el"
        title={this.props.title}
        className={this.props.className}
        onClick={this.onCopyClick}
      >
        <span>{this.props.text}</span>
      </a>
    );
  }
}
