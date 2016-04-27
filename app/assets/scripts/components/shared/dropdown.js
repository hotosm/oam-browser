'use strict';
var React = require('react/addons');
var Reflux = require('reflux');
var $ = require('jquery');

var dropdownActions = Reflux.createActions({
  'closeOthers': {}
});

var activeDropdowns = 0;

var Dropdown = React.createClass({
  displayName: 'Dropdown',

  propTypes: {
    className: React.PropTypes.string,
    triggerTitle: React.PropTypes.string,
    triggerClassName: React.PropTypes.string,
    triggerText: React.PropTypes.string,
    closeDropdown: React.PropTypes.func,
    children: React.PropTypes.node
  },

  mixins: [Reflux.listenTo(dropdownActions.closeOthers, 'onCloseOthers')],

  onCloseOthers: function ($exception) {
    if (this.getDOMNode() !== $exception) {
      this.setState({ open: false });
    }
  },

  bodyListener: function (e) {
    var $clickedDropdown = $(e.target).parents('[data-hook="dropdown"]');
    dropdownActions.closeOthers($clickedDropdown[0]);
  },

  getDefaultProps: function () {
    return {
      element: 'div',
      className: '',

      triggerTitle: '',
      triggerClassName: '',
      triggerText: ''
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
    // With a cross Dropdown variable we ensure that only one event is setup.
    if (++activeDropdowns === 1) {
      // Namespace the event so it's easy to remove.
      $(document).bind('click.dropdown', this.bodyListener);
    }
  },

  // Lifecycle method.
  // Called once as soon as the component has a DOM representation.
  componentWillUnmount: function () {
    if (--activeDropdowns === 0) {
      $(document).unbind('click.dropdown');
    }
  },

  closeDropdown: function (e) {
    e.preventDefault();
    this.setState({ open: !this.state.open });
  },

  render: function () {
    var klasses = ['drop'];
    if (this.state.open) {
      klasses.push('open');
    }
    if (this.props.className) {
      klasses.push(this.props.className);
    }

    return (
      <this.props.element className={klasses.join(' ')} data-hook='dropdown'>
        <a href='#' title={this.props.triggerTitle} className={this.props.triggerClassName} onClick={this.closeDropdown}><span>{this.props.triggerText}</span></a>
        <div className='drop-content'>
          {this.props.children}
        </div>
      </this.props.element>
    );
  }
});

module.exports = Dropdown;
