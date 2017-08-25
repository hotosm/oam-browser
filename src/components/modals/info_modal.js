import React from "react";
import createReactClass from "create-react-class";
import Reflux from "reflux";
import Keys from "react-keybinding";
import Modal from "oam-design-system/modal";

import actions from "actions/actions";

var { ModalParent, ModalHeader, ModalBody, ModalFooter } = Modal;

var InfoModal = createReactClass({
  displayName: "InfoModal",

  mixins: [Reflux.listenTo(actions.openModal, "onOpenModal"), Keys],

  keybindings: {
    esc: function() {
      this.closeModal();
    }
  },

  getInitialState: function() {
    return {
      revealed: false
    };
  },

  onOpenModal: function(which) {
    return which === "info" && this.openModal();
  },

  closeModal: function() {
    this.setState({ revealed: false });
  },

  openModal: function() {
    this.setState({ revealed: true });
  },

  render: function() {
    return (
      <ModalParent
        id="modal-about"
        className="modal--large"
        onCloseClick={this.closeModal}
        revealed={this.state.revealed}
      >
        <ModalHeader>
          <div className="modal__headline">
            <h1 className="modal__title">About</h1>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="prose">
            <div className="prose-block">
              <h2>OpenAerialMap</h2>
              <p>
                OpenAerialMap (OAM) is a set of tools for searching, sharing,
                and using openly licensed satellite and unmanned aerial vehicle
                (UAV) imagery.
              </p>
              <p>
                Built on top of the{" "}
                <a
                  href="https://github.com/openimagerynetwork"
                  title="Visit the GitHub repository"
                >
                  Open Imagery Network (OIN)
                </a>, OAM is an open service that will provide search and access
                to this imagery.
              </p>
            </div>
            <div className="prose-block">
              <h2>How to use</h2>
              <p>
                Use the map to pan and zoom to search available imagery. Imagery
                can be previewed by selecting a tile and browsing the sidebar.
                Read the{" "}
                <a href="https://github.com/hotosm/oam-browser/blob/develop/docs/user-guide.md">
                  User Guide
                </a>{" "}
                for more information.
              </p>
              <p>
                All imagery is publicly licensed and made available through the
                Humanitarian OpenStreetMap Team&#39;s Beta OIN Node.
              </p>
            </div>
            <div className="prose-block">
              <h2>Join in the Development</h2>
              <p>
                OAM is releasing a beta version to preview and test
                functionality. There are plenty of ways to get involved in
                OpenAerialMap.
              </p>
              <p>
                Check out the{" "}
                <a
                  href="https://github.com/hotosm/OpenAerialMap"
                  title="Visit the GitHub repository"
                >
                  GitHub repository
                </a>{" "}
                to learn more about the design and how to get involved in the
                project.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <p>
            Made with love by{" "}
            <a
              href="https://developmentseed.org"
              title="Visit Development Seed website"
            >
              Development Seed
            </a>{" "}
            and{" "}
            <a
              href="http://hot.openstreetmap.org/"
              title="Visit the Humanitarian OpenStreetMap Team website"
            >
              HOT
            </a>.
          </p>
        </ModalFooter>
      </ModalParent>
    );
  }
});

module.exports = InfoModal;
