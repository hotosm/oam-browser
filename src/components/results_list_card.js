import PropTypes from "prop-types";
import React from "react";

import actions from "actions/actions";
import utils from "utils/utils";

export default class ResultsListCard extends React.Component {
  static displayName = "ResultsListCard";

  static propTypes = {
    query: PropTypes.object,
    map: PropTypes.object,
    selectedSquareQuadkey: PropTypes.string,
    data: PropTypes.object
  };

  onClick = e => {
    e.preventDefault();
    actions.resultSelected(this.props);
  };

  onOver = e => {
    e.preventDefault();
    actions.resultOver(this.props.data);
  };

  onOut = e => {
    e.preventDefault();
    actions.resultOut(this.props.data);
  };

  gotoUsersImages(e, user_id) {
    e.preventDefault();
    utils.pushURI(this.props, {
      square: null,
      user: user_id,
      image: null
    });
  }

  render() {
    var d = this.props.data;

    return (
      <li>
        <article className="card card-result-entry">
          <header className="card-header">
            <h2 className="card-title">{d.title}</h2>
            <dl className="card-details">
              <dd className="card-date">
                {d.acquisition_start ? d.acquisition_start.slice(0, 10) : "N/A"}
              </dd>
              <span> / </span>
              <dd className="card-resolution">{utils.gsdToUnit(d.gsd)}</dd>
              <dd className="card-author">
                {typeof d.user !== "undefined" ? (
                  <a onClick={e => this.gotoUsersImages(e, d.user._id)}>
                    {d.user.name}
                  </a>
                ) : (
                  d.provider
                )}
              </dd>
            </dl>
          </header>
          <a
            onClick={this.onClick}
            onMouseOver={this.onOver}
            onMouseOut={this.onOut}
          >
            <div className="card-body">
              <div className="card-media">
                <img
                  alt="Result thumbnail"
                  src={
                    d.properties.thumbnail ||
                    "assets/graphics/layout/img-placeholder.svg"
                  }
                />
              </div>
            </div>
          </a>
        </article>
      </li>
    );
  }
}
