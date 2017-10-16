import _ from "lodash";
import React from "react";
import Autocomplete from "react-autocomplete";

import CrosshairsGpsIcon from "mdi-react/CrosshairsGpsIcon";
import MagnifyIcon from "mdi-react/MagnifyIcon";

import actions from "actions/actions";
import utils from "utils/utils";

export default class SearchBox extends React.Component {
  state = {
    geocoderResults: [],
    value: "",
    isOpen: false
  };

  getGeocoderResults = event => {
    event.preventDefault();
    this.setState({
      geocoderResults: [{ text: "Loading..." }],
      isOpen: true
    });
    utils.queryGeocoder(this.state.value).then(data => {
      if (data.features.length === 0) {
        data.features = [
          {
            text: "Nothing found"
          }
        ];
      }
      this.setState({ geocoderResults: data.features });
    });
  };

  gotoSelection = (_value, result) => {
    this.setState({
      value: "",
      geocoderResults: [],
      isOpen: false
    });
    if (_.has(result, "bbox")) {
      const bounds = [
        [result.bbox[1], result.bbox[0]],
        [result.bbox[3], result.bbox[2]]
      ];
      actions.fitToBounds(bounds);
    } else {
      actions.moveToCoords(result.center);
    }
  };

  onMyLocationClick = e => {
    e.preventDefault();
    actions.requestMyLocation();
  };

  render() {
    return (
      <form className="form global-search" onSubmit={this.getGeocoderResults}>
        <label className="form__label" htmlFor="global-search__input">
          Search
        </label>
        <div className="form__input-group">
          <Autocomplete
            inputProps={{
              className: "form__control form__control--medium",
              name: "Geo search",
              id: "global-search__input",
              placeholder: "Search location or coordinates",
              type: "search"
            }}
            ref="autocomplete"
            items={this.state.geocoderResults}
            getItemValue={item => item.text}
            value={this.state.value}
            open={this.state.isOpen}
            onChange={(event, value) => this.setState({ value: value })}
            onSelect={this.gotoSelection}
            onSubmit={this.getGeocoderResults}
            wrapperStyle={{}}
            renderItem={(item, isHighlighted) => (
              <div
                key={item.abbr}
                className={
                  "autocomplete__menu-item " +
                  (isHighlighted ? "is-highlighted" : "")
                }
              >
                {item.text}
              </div>
            )}
          />
          <MagnifyIcon className="search-submit" />
          {navigator.geolocation ? (
            <a
              title="Take me to my location"
              className="bttn map-control-location"
              onClick={this.onMyLocationClick}
            >
              <CrosshairsGpsIcon />
            </a>
          ) : null}
        </div>
      </form>
    );
  }
}
