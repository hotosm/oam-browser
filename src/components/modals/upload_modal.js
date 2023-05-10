import React from "react";
import Modal from "oam-design-system/modal";
import ProgressBar from "components/progressbar";

var { ModalParent, ModalBody } = Modal;

class UploadModal extends React.Component {
  constructor(props) {
    super(props);
    this.onCancel = this.onCancel.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  state = {
    confirmingCancel: false
  };

  onCancel() {
    this.setState({ confirmingCancel: true });
  }

  onDismiss() {
    this.setState({ confirmingCancel: false });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.revealed && !this.props.revealed) {
      this.setState({ confirmingCancel: false });
    }
  }

  render() {
    const {
      stopped,
      revealed,
      imageCount,
      progress,
      onCancel: onConfirmCancel
    } = this.props;

    const text =
      imageCount > 1
        ? `Uploading ${imageCount} images...`
        : `Uploading 1 image...`;

    return (
      <ModalParent id="upload-modal" revealed={revealed}>
        <ModalBody>
          <div className="content">
            <p className="current-image-num">{text}</p>
            <ProgressBar
              progress={progress}
              className={stopped ? "muted" : ""}
            />
            <span className="actions">
              {this.state.confirmingCancel ? (
                <span>
                  <a onClick={onConfirmCancel}>Confirm cancellation</a>
                  &nbsp;|&nbsp;
                  <a onClick={this.onDismiss}>Continue uploading</a>
                </span>
              ) : (
                <a onClick={this.onCancel}>Cancel uploading</a>
              )}
            </span>
          </div>
        </ModalBody>
      </ModalParent>
    );
  }
}

export default UploadModal;
