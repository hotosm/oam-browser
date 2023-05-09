import React from "react";

class ProgressBar extends React.Component {
  render() {
    const { progress, className } = this.props;

    const style = { "--progress-value": `${progress}%` };
    return (
      <div className={`progress ${className}`} style={style}>
        <div className="value">{`${progress}%`}</div>
        <div className="fill" />
      </div>
    );
  }
}

export default ProgressBar;
