import PropTypes from "prop-types";
import React from "react";
import TetherComponent from "react-tether";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

export default class extends React.Component {
  static displayName = "Dropdown";

  static propTypes = {
    triggerElement: PropTypes.oneOf(["a", "button"]),
    triggerClassName: PropTypes.string,
    triggerActiveClassName: PropTypes.string,
    triggerTitle: PropTypes.string,
    triggerText: PropTypes.string.isRequired,

    direction: PropTypes.oneOf(["up", "down", "left", "right"]),
    alignment: PropTypes.oneOf(["left", "center", "right", "middle"]),

    className: PropTypes.string,
    children: PropTypes.node
  };

  static defaultProps = {
    triggerElement: "button",
    direction: "down",
    alignment: "center"
  };

  state = {
    open: false
  };

  _bodyListener = e => {
    // Get the dropdown that is a parent of the clicked element. If any.
    let theSelf = e.target;
    if (
      theSelf.tagName === "BODY" ||
      theSelf.tagName === "HTML" ||
      e.target.getAttribute("data-hook") === "dropdown:close"
    ) {
      this.close();
      return;
    }

    // If the trigger element is an "a" the target is the "span", but it is a
    // button, the target is the "button" itself.
    // This code handles this case. No idea why this is happening.
    // TODO: Unveil whatever black magic is at work here.
    if (
      theSelf.tagName === "SPAN" &&
      theSelf.parentNode === this.refs.trigger &&
      theSelf.parentNode.getAttribute("data-hook") === "dropdown:btn"
    ) {
      return;
    }

    if (theSelf && theSelf.getAttribute("data-hook") === "dropdown:btn") {
      if (theSelf !== this.refs.trigger) {
        this.close();
      }
      return;
    }

    do {
      if (theSelf && theSelf.getAttribute("data-hook") === "dropdown:content") {
        break;
      }
      theSelf = theSelf.parentNode;
    } while (
      theSelf &&
      theSelf.tagName !== "BODY" &&
      theSelf.tagName !== "HTML"
    );

    if (theSelf !== this.refs.dropdown) {
      this.close();
    }
  };

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount() {
    window.addEventListener("click", this._bodyListener);
  }

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentWillUnmount() {
    window.removeEventListener("click", this._bodyListener);
  }

  _toggleDropdown = e => {
    e.preventDefault();
    this.toggle();
  };

  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  open = () => {
    this.setState({ open: true });
  };

  close = () => {
    this.setState({ open: false });
  };

  render() {
    // Base and additional classes for the trigger and the content.
    var klasses = [
      "drop__content",
      "drop__content--react",
      `drop-trans--${this.props.direction}`
    ];
    var triggerKlasses = ["drop__toggle"];

    if (this.props.className) {
      klasses.push(this.props.className);
    }
    if (this.props.triggerClassName) {
      triggerKlasses.push(this.props.triggerClassName);
    }

    // Additional trigger props.
    var triggerProps = {};
    if (this.props.triggerElement === "button") {
      triggerProps.type = "button";
    } else {
      triggerProps.href = "#";
    }
    if (this.props.triggerTitle) {
      triggerProps.title = this.props.triggerTitle;
    }

    let tetherAttachment;
    let tetherTargetAttachment;
    switch (this.props.direction) {
      case "up":
        tetherAttachment = `bottom ${this.props.alignment}`;
        tetherTargetAttachment = `top ${this.props.alignment}`;
        break;
      case "down":
        tetherAttachment = `top ${this.props.alignment}`;
        tetherTargetAttachment = `bottom ${this.props.alignment}`;
        break;
      case "left":
        tetherAttachment = `${this.props.alignment} left`;
        tetherTargetAttachment = `${this.props.alignment} right`;
        break;
      case "right":
        tetherAttachment = `${this.props.alignment} right`;
        tetherTargetAttachment = `${this.props.alignment} left`;
        break;
      default:
        console.error("Unknown Dropdown direction");
    }

    if (this.state.open && this.props.triggerActiveClassName) {
      triggerKlasses.push(this.props.triggerActiveClassName);
    }

    return (
      <TetherComponent
        attachment={tetherAttachment}
        targetAttachment={tetherTargetAttachment}
        constraints={[
          {
            to: "scrollParent"
          }
        ]}
      >
        <this.props.triggerElement
          {...triggerProps}
          className={triggerKlasses.join(" ")}
          onClick={this._toggleDropdown}
          data-hook="dropdown:btn"
          ref="trigger"
        >
          <span>{this.props.triggerText}</span>
        </this.props.triggerElement>

        <ReactCSSTransitionGroup
          component="div"
          transitionName="drop-trans"
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300}
        >
          {this.state.open ? (
            <div
              className={klasses.join(" ")}
              ref="dropdown"
              data-hook="dropdown:content"
            >
              {this.props.children}
            </div>
          ) : null}
        </ReactCSSTransitionGroup>
      </TetherComponent>
    );
  }
}
