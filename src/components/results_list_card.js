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

  render() {
    var d = this.props.data;

    return (
      <li>
        <article className="card card-result-entry">
          <a
            onClick={this.onClick}
            onMouseOver={this.onOver}
            onMouseOut={this.onOut}
          >
            <header className="card-header">
              <h1 className="card-title">
                {d.title}
              </h1>
              <dl className="card-details">
                <dt>Title</dt>
                <dd>
                  {d.title}
                </dd>
                <dt>Date</dt>
                <dd>
                  {d.acquisition_start
                    ? d.acquisition_start.slice(0, 10)
                    : "N/A"}
                </dd>
                <dt>Res</dt>
                <dd>
                  {utils.gsdToUnit(d.gsd)}
                </dd>
              </dl>
            </header>
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
