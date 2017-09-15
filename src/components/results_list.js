import PropTypes from "prop-types";
import React from "react";

import ResultsListCard from "components/results_list_card";
import mapStore from "stores/map_store";

export default class ResultsList extends React.Component {
  static displayName = "ResultsList";

  static propTypes = {
    query: PropTypes.object,
    params: PropTypes.object,
    map: PropTypes.object,
    results: PropTypes.array
  };

  homeBlurb() {
    return (
      <span>
        <p>
          OpenAerialMap (OAM) is a set of tools for searching, sharing, and
          using openly licensed satellite and unmanned aerial vehicle (UAV)
          imagery.
        </p>
        <h2>Latest uploads</h2>
      </span>
    );
  }

  squareBlurb() {
    return (
      <span>
        <h2
          className="pane-title"
          title={
            "Available imagery for square with quadKey " +
            this.props.params.square
          }
        >
          {this.props.results.length} images within selected grid square
        </h2>
      </span>
    );
  }

  userBlurb() {
    let user = mapStore.getImageryOwner();
    return (
      <span>
        <img src={user.profile_pic_uri} alt="Provider's profile" />
        <h2 className="pane-title" title={"Imagery for user " + user.name}>
          Imagery for {user.name}
        </h2>
      </span>
    );
  }

  paneBlurb() {
    let blurb;
    if (this.props.params.user_id) {
      blurb = this.userBlurb();
    } else if (this.props.params.square_id) {
      blurb = this.squareBlurb();
    } else {
      blurb = this.homeBlurb();
    }
    return (
      <p className="oam-blurb">
        {blurb}
      </p>
    );
  }

  render() {
    var square = this.props.params.square_id;
    var results = this.props.results.map(o => {
      return (
        <ResultsListCard
          key={o._id}
          query={this.props.query}
          map={this.props.map}
          selectedSquareQuadkey={square}
          data={o}
        />
      );
    });

    return (
      <section className="results-hub">
        <header className="pane-header">
          {this.paneBlurb()}
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
