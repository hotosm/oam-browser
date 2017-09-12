import PropTypes from "prop-types";
import React from "react";

import actions from "actions/actions";
import utils from "utils/utils";

class ResultsListItem extends React.Component {
  static displayName = "ResultsListItem";

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
              <div className="card-media">
                <img
                  alt="Result thumbnail"
                  width="768"
                  height="432"
                  src={
                    d.properties.thumbnail ||
                    "assets/graphics/layout/img-placeholder.svg"
                  }
                />
              </div>
            </header>
            <div className="card-body">
              <dl className="card-details">
                <dt>Type</dt>
                <dd>
                  {d.properties.tms ? "Image + Map Layer" : "Image"}
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
            </div>
          </a>
        </article>
      </li>
    );
  }
}

class ResultsList extends React.Component {
  static displayName = "ResultsList";

  static propTypes = {
    query: PropTypes.object,
    map: PropTypes.object,
    selectedSquareQuadkey: PropTypes.string,
    results: PropTypes.array
  };

  render() {
    var square = this.props.selectedSquareQuadkey;

    var numRes = this.props.results.length;
    var results = this.props.results.map(o => {
      return (
        <ResultsListItem
          key={o._id}
          query={this.props.query}
          map={this.props.map}
          selectedSquareQuadkey={this.props.selectedSquareQuadkey}
          data={o}
        />
      );
    });

    return (
      <section className="results-hub">
        <header className="pane-header">
          {this.props.selectedSquareQuadkey
            ? <h1
                className="pane-title"
                title={"Available imagery for square with quadKey " + square}
              >
                Available Imagery Within Grid Square
              </h1>
            : <h1 className="pane-title" title={"Latest Imagery"}>
                Latest Imagery
              </h1>}
          <p className="pane-subtitle">
            {numRes} results
          </p>
        </header>
        <div className="pane-body">
          <div className="pane-body-inner">
            <ol className="results-list">
              {results}
            </ol>
          </div>
        </div>
        <footer className="pane-footer" />
      </section>
    );
  }
}

export default ResultsList;
