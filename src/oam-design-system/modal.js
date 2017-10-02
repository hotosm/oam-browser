import PropTypes from "prop-types";
import React from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

import CloseIcon from "mdi-react/CloseIcon";

class ModalParent extends React.Component {
  static displayName = "Modal";

  static propTypes = {
    id: PropTypes.string.isRequired,
    revealed: PropTypes.bool,
    className: PropTypes.string,
    onOverlayClick: PropTypes.func,

    children: function(props, propName, componentName) {
      let types = ["ModalHeader", "ModalBody", "ModalFooter"];
      let typesRequired = ["ModalHeader", "ModalBody"];
      let children = React.Children.toArray(props[propName]);

      let c = children.length;
      if (c === 0 || c > 3) {
        return new Error(
          `${componentName} should have at least a child but no more than 3`
        );
      }

      let components = {};

      for (let i = 0; i < c; i++) {
        let o = children[i];
        let name = o.type.displayName || o.type;
        if (types.indexOf(name) === -1) {
          return new Error(
            `${componentName} children should be of the following types: ${types.join(
              ", "
            )}`
          );
        }
        if (!components[name]) {
          components[name] = 0;
        }
        if (++components[name] > 1) {
          return new Error(
            `${componentName} should have only one instance of: ${name}`
          );
        }
      }

      for (let i = 0; i < typesRequired.length; i++) {
        if (!components[typesRequired[i]]) {
          return new Error(
            `${componentName} should have a ${typesRequired[i]}`
          );
        }
      }
    }
  };

  static defaultProps = {
    revealed: false,

    onOverlayClick: function(e) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Modal", "onOverlayClick handler not implemented");
      }
    },

    onCloseClick: function(e) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Modal", "onCloseClick handler not implemented");
      }
    }
  };

  toggleBodyClass = revealed => {
    let bd = document.getElementsByTagName("body")[0];
    if (revealed) {
      bd.classList.add("unscrollable-y");
    } else {
      bd.classList.remove("unscrollable-y");
    }
  };

  componentDidUpdate() {
    this.toggleBodyClass(this.props.revealed);
  }

  componentDidMount() {
    this.toggleBodyClass(this.props.revealed);
  }

  componentWillUnount = () => {
    this.toggleBodyClass(false);
  };

  getChild = name => {
    let c = null;
    React.Children.forEach(this.props.children, o => {
      if (!c && o.type.displayName === name) {
        c = o;
        return;
      }
    });
    return c;
  };

  render() {
    var klasses = ["modal"];
    if (this.props.className) {
      klasses.push(this.props.className);
    }

    return (
      <ReactCSSTransitionGroup
        component="div"
        transitionName="modal"
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
      >
        {this.props.revealed ? (
          <section
            className={klasses.join(" ")}
            key={"modal-" + this.props.id}
            onClick={this.onOverlayClick}
            id={this.props.id}
          >
            <div className="modal__inner">
              {this.getChild("ModalHeader")}
              {this.getChild("ModalBody")}
              {this.getChild("ModalFooter")}
            </div>
          </section>
        ) : null}
      </ReactCSSTransitionGroup>
    );
  }
}

class ModalHeader extends React.Component {
  static displayName = "ModalHeader";

  static propTypes = {
    children: PropTypes.node,
    onCloseClick: PropTypes.func
  };

  onCloseClick = e => {
    e.preventDefault();
    this.props.onCloseClick.call(this, e);
  };

  render() {
    return (
      <header className="modal__header">
        <a
          className="modal__button-dismiss"
          title="Close"
          onClick={this.onCloseClick}
        >
          <CloseIcon />
        </a>
        {this.props.children}
      </header>
    );
  }
}

class ModalBody extends React.Component {
  static displayName = "ModalBody";

  static propTypes = {
    children: PropTypes.node
  };

  render() {
    return <div className="modal__body">{this.props.children}</div>;
  }
}

class ModalFooter extends React.Component {
  static displayName = "ModalFooter";

  static propTypes = {
    children: PropTypes.node
  };

  render() {
    return <footer className="modal__footer">{this.props.children}</footer>;
  }
}

export default {
  ModalParent,
  ModalHeader,
  ModalBody,
  ModalFooter
};
