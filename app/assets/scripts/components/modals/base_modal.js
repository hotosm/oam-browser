'use strict';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Reflux from 'reflux';
import Keys from 'react-keybinding';
import actions from '../../actions/actions';

/**
 * The base modal contains the wrapper code for the modals and should not be
 * instantiated directly.
 *
 * Create a new class instead that and pass the props to the modal.
 * The values for header, body, and footer should be returned by a function.
 * Type must match the value passed to actions.openModal(which).
 * <BModal
 *  type='info'
 *  header={this.getHeader()}
 *  body={this.getBody()}
 *  footer={this.getFooter()} />
 */
var BModal = React.createClass({
  displayName: 'BaseModal',

  propTypes: {
    type: React.PropTypes.string,
    revealed: React.PropTypes.bool,
    onOverlayClick: React.PropTypes.func,
    onCloseClick: React.PropTypes.func,

    header: React.PropTypes.oneOfType([React.PropTypes.node, React.PropTypes.bool]),
    footer: React.PropTypes.oneOfType([React.PropTypes.node, React.PropTypes.bool]),
    body: React.PropTypes.oneOfType([React.PropTypes.node, React.PropTypes.bool])
  },

  mixins: [
    Reflux.listenTo(actions.openModal, 'onOpenModal'),
    Keys
  ],

  keybindings: {
    'esc': function () {
      this.closeModal();
    }
  },

  closeModal: function () {
    this.setState({ revealed: false });
  },

  openModal: function () {
    this.setState({ revealed: true });
  },

  onOpenModal: function (which) {
    if (which === this.props.type) {
      this.openModal();
    }
  },

  getInitialState: function () {
    return {
      revealed: this.props.revealed
    };
  },

  getDefaultProps: function () {
    return {
      header: null,
      body: null,
      footer: null,

      revealed: false,

      onOverlayClick: function (e) {
        // Prevent children from triggering this.
        if (e.target === e.currentTarget) {
          this.closeModal();
        }
      },

      onCloseClick: function (e) {
        this.closeModal();
      }
    };
  },

  onOverlayClick: function (e) {
    this.props.onOverlayClick.call(this, e);
  },

  onCloseClick: function (e) {
    e.preventDefault();
    this.props.onCloseClick.call(this, e);
  },

  render: function () {
    var modal = null;
    var header = null;
    var footer = null;

    if (this.props.header !== false) {
      header = (
        <header className='modal-header'>
          {this.props.header}
        </header>
      );
    }

    if (this.props.footer !== false) {
      footer = (
        <footer className='modal-footer'>
          {this.props.footer}
        </footer>
      );
    }

    if (this.state.revealed) {
      modal = (
        <section className='modal' key={'modal-' + this.props.type} onClick={this.onOverlayClick} id={'modal-' + this.props.type}>
          <div className='modal-inner'>
            <span className='dismiss-modal'>
              <a className='close' title='Close' onClick={this.onCloseClick}><span>Close</span></a>
            </span>
            {header}
            <div className='modal-body'>
              {this.props.body}
            </div>
            {footer}
          </div>
        </section>
      );
    }

    return (
      <ReactCSSTransitionGroup component='div' transitionName='modal' transitionEnterTimeout={500} transitionLeaveTimeout={300} >
        {modal}
      </ReactCSSTransitionGroup>
    );
  }
});

module.exports = BModal;
