import React, { Component } from "react";
import L from "leaflet";
import { Map, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "./onemap.css";
import ewastedata from "./e-waste-recycling-geojson.json";
import lightingwastedata from "./lighting-waste-collection-points-geojson.json";
// import { GoogleProvider } from "leaflet-geosearch";

// import "bootstrap/dist/css/bootstrap.min.css";
// import "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

var myIcon = L.icon({
  iconUrl: require("./marker-icon.png"),
  iconSize: [41, 41],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41]
});

// const provider = new GoogleProvider({
//   params: {
//     key: "AIzaSyAwBgI9uqnUAlslEI-48KZbaer7Ih0EUjw"
//   }
// });

class Onemap2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: "",
      lng: "",
      zoom: 13.5,
      ewaste: ewastedata,
      ewasteNotChecked: true,
      lightingwaste: lightingwastedata,
      lightingwasteNotChecked: true,
      bulkyWaste: null,
      bulkyWasteNotChecked: true
    };
    this.getLocation = this.getLocation.bind(this);
    this.getCoordinates = this.getCoordinates.bind(this);
    this.ThemeDetails = this.ThemeDetails.bind(this);
  }

  // OneMap Theme API
  ThemeDetails() {
    fetch(
      "https://developers.onemap.sg/privateapi/themesvc/retrieveTheme?queryName=recyclingbins&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjM5NjIsInVzZXJfaWQiOjM5NjIsImVtYWlsIjoiYW5kcmV3d2VlOTdAZ21haWwuY29tIiwiZm9yZXZlciI6ZmFsc2UsImlzcyI6Imh0dHA6XC9cL29tMi5kZmUub25lbWFwLnNnXC9hcGlcL3YyXC91c2VyXC9zZXNzaW9uIiwiaWF0IjoxNTgyNDczNjM1LCJleHAiOjE1ODI5MDU2MzUsIm5iZiI6MTU4MjQ3MzYzNSwianRpIjoiZTE0NzhmNmVkYjRlOTdhNmQ1YmU3MWIyOTVlOTVmZTAifQ.8d157AOdoOAhmFvh68u_7UiiwUwcFpGqsCAVlKpHttc"
    ).then(res => res.json());
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.getCoordinates);
    } else {
      console.log("Error");
    }
  }

  getCoordinates(position) {
    this.setState({
      lat: Number(position.coords.latitude),
      lng: Number(position.coords.longitude)
    });
  }

  MouseOverFeature = (e, layer) => {
    console.log("MouseOver");
    var popup = L.popup().setContent(
      e.sourceTarget.feature.properties.Description
    );
    layer.bindPopup(popup).openPopup();
  };

  MouseOutFeature = (e, layer) => {
    console.log("MouseOut", e);
    layer.closePopup();
  };

  onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: e => this.MouseOverFeature(e, layer),
      mouseout: e => this.MouseOutFeature(e, layer)
    });
  };

  handleChangeEwaste = e => {
    this.setState({ ewasteNotChecked: !this.state.ewasteNotChecked });
  };

  handleChangeLightingWaste = e => {
    this.setState({
      lightingwasteNotChecked: !this.state.lightingwasteNotChecked
    });
  };

  // componentDidMount() {
  //   fetch(
  //     "https://data.gov.sg/api/action/datastore_search?resource_id=f1a0ffab-0da7-4571-93d0-dbd893e5410c"
  //   )
  //     .then(res => res.json())
  //     .then(result => {
  //       provider
  //         .search({
  //           query: "Singapore 650507"
  //         })
  //         .then(result => {
  //           this.setState({ bulkyWaste: result });
  //         });
  //     });
  // }

  render() {
    this.getLocation();
    const position = [this.state.lat, this.state.lng];
    console.log(this.state.bulkyWaste);
    return (
      <div>
        <Map className="map" center={position} zoom={this.state.zoom}>
          <TileLayer
            attribution='<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;"/> New OneMap | Map data &copy; contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>'
            url="https://maps-{s}.onemap.sg/v3/Original/{z}/{x}/{y}.png"
          />
          {this.state.ewasteNotChecked ? (
            ""
          ) : (
            <GeoJSON
              data={this.state.ewaste.features}
              onEachFeature={this.onEachFeature}
            />
          )}
          {this.state.lightingwasteNotChecked ? (
            ""
          ) : (
            <GeoJSON
              data={this.state.lightingwaste.features}
              onEachFeature={this.onEachFeature}
            />
          )}
          <Marker position={position} icon={myIcon}>
            <Popup>You are currently here!</Popup>
          </Marker>
        </Map>

        <div id="filter-box">
          <p className="filter">Use the buttons below to filter.</p>
          <div>
            <label>
              <input type="checkbox" onChange={this.handleChangeEwaste}></input>
              <span>E-Waste</span>
              <br></br>
            </label>
            <label>
              <input
                type="checkbox"
                onChange={this.handleChangeLightingWaste}
              ></input>
              <span>Lighting Waste</span>
              <br></br>
            </label>
            {/* <label>
              <input type="checkbox"></input>
              <span>Check me out</span>
              <br></br>
            </label> */}
          </div>
        </div>
      </div>
    );
  }
}

export default Onemap2;