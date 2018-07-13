import React from "react";
import PropTypes from "prop-types";

const RequestToken = (props) => {
  const { fetchToken, token } = props;
  return (
    <div className="edit-your-profile">
      <a
        className="bttn bttn-grey bttn-block"
        onClick={fetchToken}
      >
        Request 3rd Party API Token
      </a>
    <span style={{ wordWrap: "break-word"}}>
      {token}
    </span>
    </div>
  );
};

RequestToken.PropTypes = {
  fetchToken: PropTypes.func.isRequired,
  token: PropTypes.string
};

export default RequestToken;
