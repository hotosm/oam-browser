import React from 'react';
import TetherComponent from 'react-tether';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default React.createClass({
  displayName: 'Dropdown',

  propTypes: {
    triggerElement: React.PropTypes.oneOf(['a', 'button']),
    triggerClassName: React.PropTypes.string,
    triggerActiveClassName: React.PropTypes.string,
    triggerTitle: React.PropTypes.string,
    triggerText: React.PropTypes.string.isRequired,

    direction: React.PropTypes.oneOf(['up', 'down', 'left', 'right']),
    alignment: React.PropTypes.oneOf(['left', 'center', 'right', 'middle']),

    className: React.PropTypes.string,
    children: React.PropTypes.node
  },

  _bodyListener: function (e) {
    // Get the dropdown that is a parent of the clicked element. If any.
    let theSelf = e.target;
    if (theSelf.tagName === 'BODY' ||
        theSelf.tagName === 'HTML' ||
        e.target.getAttribute('data-hook') === 'dropdown:close') {
      this.close();
      return;
    }

    // If the trigger element is an "a" the target is the "span", but it is a
    // button, the target is the "button" itself.
    // This code handles this case. No idea why this is happening.
    // TODO: Unveil whatever black magic is at work here.
    if (theSelf.tagName === 'SPAN' &&
        theSelf.parentNode === this.refs.trigger &&
        theSelf.parentNode.getAttribute('data-hook') === 'dropdown:btn') {
      return;
    }

    if (theSelf && theSelf.getAttribute('data-hook') === 'dropdown:btn') {
      if (theSelf !== this.refs.trigger) {
        this.close();
      }
      return;
    }

    do {
      if (theSelf && theSelf.getAttribute('data-hook') === 'dropdown:content') {
        break;
      }
      theSelf = theSelf.parentNode;
    } while (theSelf && theSelf.tagName !== 'BODY' && theSelf.tagName !== 'HTML');

    if (theSelf !== this.refs.dropdown) {
      this.close();
    }
  },

  getDefaultProps: function () {
    return {
      triggerElement: 'button',
      direction: 'down',
      alignment: 'center'
    };
  },

  getInitialState: function () {
    return {
      open: false
    };
  },

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentDidMount: function () {
    window.addEventListener('click', this._bodyListener);
  },

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentWillUnmount: function () {
    window.removeEventListener('click', this._bodyListener);
  },

  _toggleDropdown: function (e) {
    e.preventDefault();
    this.toggle();
  },

  toggle: function () {
    this.setState({ open: !this.state.open });
  },

  open: function () {
    this.setState({ open: true });
  },

  close: function () {
    this.setState({ open: false });
  },

  render: function () {
    // Base and additional classes for the trigger and the content.
    var klasses = ['drop__content', 'drop__content--react', `drop-trans--${this.props.direction}`];
    var triggerKlasses = ['drop__toggle'];

    if (this.props.className) {
      klasses.push(this.props.className);
    }
    if (this.props.triggerClassName) {
      triggerKlasses.push(this.props.triggerClassName);
    }

    // Additional trigger props.
    var triggerProps = {};
    if (this.props.triggerElement === 'button') {
      triggerProps.type = 'button';
    } else {
      triggerProps.href = '#';
    }
    if (this.props.triggerTitle) {
      triggerProps.title = this.props.triggerTitle;
    }

    let tetherAttachment;
    let tetherTargetAttachment;
    switch (this.props.direction) {
      case 'up':
        tetherAttachment = `bottom ${this.props.alignment}`;
        tetherTargetAttachment = `top ${this.props.alignment}`;
        break;
      case 'down':
        tetherAttachment = `top ${this.props.alignment}`;
        tetherTargetAttachment = `bottom ${this.props.alignment}`;
        break;
      case 'left':
        tetherAttachment = `${this.props.alignment} left`;
        tetherTargetAttachment = `${this.props.alignment} right`;
        break;
      case 'right':
        tetherAttachment = `${this.props.alignment} right`;
        tetherTargetAttachment = `${this.props.alignment} left`;
        break;
    }

    if (this.state.open && this.props.triggerActiveClassName) {
      triggerKlasses.push(this.props.triggerActiveClassName);
    }

    return (
      <TetherComponent
        attachment={tetherAttachment}
        targetAttachment={tetherTargetAttachment}
        constraints={[{
          to: 'scrollParent',
          attachment: 'together'
        }]}>

        <this.props.triggerElement
          {...triggerProps}
          className={triggerKlasses.join(' ')}
          onClick={this._toggleDropdown}
          data-hook='dropdown:btn'
          ref='trigger' >
            <span>{ this.props.triggerText }</span>
        </this.props.triggerElement>

        <ReactCSSTransitionGroup
          component='div'
          transitionName='drop-trans'
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300} >
            { this.state.open
              ? <div className={klasses.join(' ')} ref='dropdown' data-hook='dropdown:content'>{ this.props.children }</div>
            : null }
        </ReactCSSTransitionGroup>

      </TetherComponent>
    );
  }
});
