import { hashHistory } from "react-router";
import centroid from "turf-centroid";
import extent from "turf-extent";
import tilebelt from "tilebelt";
import parse from "wellknown";

import config from "config";

export default {
  // Use image metadata to construct OAM Browser URL describing the map view,
  // associated grid tile. Image ID is not available since it has not been indexed,
  // by the Catalog yet
  // adapted from "https://github.com/hotosm/openaerialmap.org/blob/master/app/assets/scripts/main.js#L36-L50
  imageUri: function(imgData) {
    const previewZoom = 10;
    // Use turf to calculate the center of the image
    const footprint = parse(imgData.footprint);
    const center = centroid(footprint).geometry.coordinates;
    const mapView = center[0] + "," + center[1] + "," + previewZoom;
    this.pushURI(
      { params: {} },
      {
        map: mapView,
        square: null,
        user: imgData.user,
        image: imgData._id
      }
    );
  },

  /**
   * Converts a string to a coordinates array.
   * Assumes a string in the following format:
   * -78.30681944444444,37.79557777777777
   *
   * @param  string
   *
   * @return Array with coordinates [lng, lat]
   */
  strToCoods: function(str) {
    if (!str) {
      return null;
    }
    var regExp = new RegExp("^(-?[0-9]{1,2}.[0-9]+),(-?[0-9]{1,2}.[0-9]+)$");
    var res = str.match(regExp);

    if (!res || res[1] > 180 || res[1] < -180 || res[2] > 90 || res[2] < -90) {
      return null;
    }

    return [parseFloat(res[1]), parseFloat(res[2])];
  },

  getPolygonFeature: function(coords) {
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: coords
      }
    };
  },

  /**
   * Coverts the given GSD to meters or centimeters
   * @param  float gsd in meters
   * @return string
   */
  gsdToUnit: function(gsd) {
    var unit = "m";
    // If it's less than 1m, convert to cm so it displays more nicely
    if (gsd < 1) {
      unit = "cm";
      gsd *= 100;
    }

    return Math.round(gsd) + " " + unit;
  },

  quadkeyFromCoords: function(lng, lat, zoom) {
    // A square at zoom Z is the same as a map tile at zoom Z+3
    var tile = tilebelt.pointToTile(lng, lat, zoom + 3);
    return tilebelt.tileToQuadkey(tile);
  },

  coordsFromQuadkey: function(quadkey) {
    var tile = tilebelt.quadkeyToTile(quadkey);
    var geoJSONTile = tilebelt.tileToGeoJSON(tile);
    return geoJSONTile.coordinates;
  },

  tileCenterFromCoords: function(lng, lat, zoom) {
    // A square at zoom Z is the same as a map tile at zoom Z+3
    var tile = tilebelt.pointToTile(lng, lat, zoom + 3);
    var geoJSONTile = tilebelt.tileToGeoJSON(tile);
    var squareCenter = centroid(geoJSONTile);
    // In this way we ensure it's a copy.
    return [
      squareCenter.geometry.coordinates[0],
      squareCenter.geometry.coordinates[1]
    ];
  },

  tileCenterFromQuadkey: function(quadKey) {
    var tile = tilebelt.quadkeyToTile(quadKey);
    var geoJSONTile = tilebelt.tileToGeoJSON(tile);
    return centroid(geoJSONTile);
  },

  tileBboxFromQuadkey: function(quadKey) {
    var tile = tilebelt.quadkeyToTile(quadKey);
    var geoJSONTile = tilebelt.tileToGeoJSON(tile);
    return extent({ type: "Feature", geometry: geoJSONTile });
  },

  queryGeocoder: function(query) {
    var uri =
      "https://api.tiles.mapbox.com/geocoding/v5/mapbox.places/" +
      encodeURIComponent(query) +
      ".json" +
      "?access_token=" +
      config.map.mapbox.accessToken;
    return fetch(uri).then(response => {
      if (!response.ok)
        return Promise.reject(new Error(`HTTP Error ${response.status}`));
      return response.json();
    });
  },

  getMapViewString: function(lng, lat, zoom) {
    return [lng, lat, zoom].join(",");
  },

  wrap: function(feature) {
    return {
      type: feature.type,
      properties: feature.properties,
      geometry: {
        type: feature.geometry.type,
        coordinates: [feature.geometry.coordinates[0].map(this.wrapPoint)]
      }
    };
  },

  wrapPoint: function(pt) {
    pt = [pt[0], pt[1]];
    while (pt[0] < -180) {
      pt[0] += 360;
    }

    while (pt[0] >= 180) {
      pt[0] -= 360;
    }

    return pt;
  },

  // Hack. For some reason Leaflet doesn't get the full size of the
  // the map container and so doesn't fill in the map. Maybe there
  // is a transition effect that provides a smaller value at Leaflet's
  // init, so setting a timeout to re-measure makes the map fill up with
  // tiles.
  delayedMapContainerResize: function(map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 1000);
  },

  // Check if we're currently viewing the map.
  // Expects `props` to contain both the `location` and `routes` properties.
  isOnMainMap: function(props) {
    // If we're on a specific coordinate location.
    const isMapLocation = props.params.map;
    // If we're on the homepage.
    const isHome = props.location.pathname === "/";
    // Is this the main map view?
    return isMapLocation || isHome;
  },

  // Canonical means to transition to complex URIs
  // You only need to pass the part that you want to change, the rest of
  // the URL will remain the same.
  // TODO: Return the path so that all anchor's use `href` rather than
  //       `onClick()`. So that you can see the URL when you hover over
  //       the link tag.
  pushURI: function(props, parts) {
    parts = Object.assign(
      {
        map: props.params.map,
        square: props.params.square_id,
        user: props.params.user_id,
        image: props.params.image_id,
        latest: props.params.latest_id
      },
      parts
    );

    let path = `/${parts.map}`;

    // 'Latest' are the selection of recently uploaded images
    let isLatest = parts.latest || (!parts.square && !parts.user);

    if (isLatest && parts.image) {
      path += "/latest";
    } else if (parts.square) {
      path += `/square/${parts.square}`;
    } else if (parts.user) {
      path += `/user/${parts.user}`;
    }
    if (parts.image) {
      path += `/${parts.image}`;
    }

    hashHistory.replace({ pathname: path, query: props.query });
  }
};
