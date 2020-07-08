const API_KEY =
  "pk.eyJ1IjoiamVyZW15YnJlbnQiLCJhIjoiY2tiaWh0YzF2MGZkazJybThkcWtob2Y3MyJ9.nWks4cNoybDOq9i2jGGywg";

// var dataset = "../Assets/Data/clean_USA_power_plant_data_states.csv";

var locationStateSelect = d3.select("#location_state_select");
var locationEnergySelect = d3.select("#location_energy_select");
var locationYearSelect = d3.select("#location_year_select");

var prodStateSelect = d3.select("#prod_state_select");
var prodEnergySelect = d3.select("#prod_energy_select");
var prodYearSelect = d3.select("#prod_year_select");

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


var markerClusterGroup = L.markerClusterGroup();

/////
// Function to initialize page
/////
function init() {
  
  d3.json("/all_energy").then((data) => {
    console.log(data);
    // Preparing data for the marker cluster map 1
    var markerArray = [];
    for (var i = 0; i < data.length; i++) {
      allLocations = [data[i].latitude, data[i].longitude];

      marker = L.marker(allLocations).bindPopup(`
              <p><strong> Name: </strong> ${data[i].name} </p>
              <hr>
              <p><strong> Commission Year: </strong> ${data[i].commissioning_year} </p>
              <p><strong> Primary Fuel Type: </strong> ${data[i].primary_fuel} </p>
            `);
      markerArray.push(marker);
    }
    markerClusterGroup.addLayers(markerArray);

    markerClusterGroup.addTo(myMap);

    // Preparing data for the data table
    var columnNames = [
      "name",
      "state",
      "commissioning_year",
      "primary_fuel",
      "latitude",
      "longitude",
      "generation_gwh_2017",
    ];

    const redux = (array) =>
      array.map((o) =>
        columnNames.reduce((acc, curr) => {
          acc[curr] = o[curr];
          return acc;
        }, {})
      );

    var almostTableData = redux(data);

    var tableData = almostTableData.map(Object.values);

    $(document).ready(() => {
      $("#energy-table").DataTable({
        data: tableData,
        columns: [
          { title: "Name" },
          { title: "State" },
          { title: "Commissioning Year" },
          { title: "Primary Fuel" },
          { title: "Latitude" },
          { title: "Longitude" },
          { title: "Energy Generation (gwh, 2017)" },
        ],
      });
    });
  });

  initStat();
}

/////
// Function to filter map
/////
function mapFilter() {
  var selectedFilters = {};
  var localStateSelectValue = locationStateSelect.property("value");
  var localEnergySelectValue = locationEnergySelect.property("value");
  var localYearSelectValue = locationYearSelect.property("value");

  if (localStateSelectValue) {
    selectedFilters["state"] = localStateSelectValue;
    console.log("date Not empty");
  }
  if (localEnergySelectValue) {
    selectedFilters["primary_fuel"] = localEnergySelectValue;
    console.log("energy Not empty");
  }
  if (localYearSelectValue) {
    selectedFilters["commissioning_year"] = localYearSelectValue;
    console.log("year Not empty");
  }

  return selectedFilters;
}


function filterData() {
  var selectedFilters = mapFilter();

  state_name = selectedFilters["state"];
  energy = selectedFilters["primary_fuel"];
  year = selectedFilters["commissioning_year"];

  markerClusterGroup.clearLayers();
  myMap.removeLayer(markerClusterGroup);
  
  d3.json(`/map_filter/${state_name}/${energy}/${year}`).then((data) => {
    console.log(data);
    
    var markerArray = [];
    for (var i = 0; i < data.length; i++) {
      allLocations = [data[i].latitude, data[i].longitude];

      marker = L.marker(allLocations).bindPopup(`
              <p><strong> Name: </strong> ${data[i].name} </p>
              <hr>
              <p><strong> Commission Year: </strong> ${data[i].commissioning_year} </p>
              <p><strong> Primary Fuel Type: </strong> ${data[i].primary_fuel} </p>
            `);
      markerArray.push(marker);
    }
    markerClusterGroup.addLayers(markerArray);

    markerClusterGroup.addTo(myMap);



    // // console.log(filteredData);
    // Object.entries(selectedFilters).forEach(([key, value]) => {
    //   // console.log(something);

    //   filteredData = data.filter(
    //     (record) => record[`${key}`] === value
    //   );
    //   console.log(filteredData);
    // });

    // filteredData.forEach((powerPlant) => {
    //   // console.log(ufoRecord)
    //   var powerPlantFilteredData = []
    //   Object.entries(powerPlant).forEach(([key, value]) => {
    //     // console.log(key, value);
    //     var powerPlantFilteredDataObject = {}
    //     powerPlantFilteredDataObject[`${key}`] = value;
    //     powerPlantFilteredData.push(powerPlantFilteredDataObject)
    //   });
    //   // console.log(powerPlantFilteredData)
    // });
  });
}

/////
// Function to initialize stats table
/////
function initStat() {
  d3.json("/all_energy").then((data) => {
    console.log(data);

    var difEnergy = [...new Set(data.map((x) => x.primary_fuel).sort())];

    var dropDown = d3.select(".energyTypeStats");
    var tbody = d3.select(".stats-table-body tr");

    for (var i = 0; i < difEnergy.length; i++) {
      dropDown
        .append("option")
        .attr("value", `${difEnergy[i]}`)
        .text(difEnergy[i]);
    }

    var sum = 0;

    data.forEach(function (item) {
      sum += item.generation_gwh_2017;
    });

    console.log(data);

    var allStationsSum = sum.toFixed(2);
    var allStationsCount = data.length;
    var allStationsAvg = (allStationsSum / allStationsCount).toFixed(2);
    var percentAllStations = (allStationsSum / allStationsSum) * 100;

    tbody.append("td").text(numberWithCommas(allStationsCount));
    tbody.append("td").text(numberWithCommas(allStationsSum));
    tbody.append("td").text(numberWithCommas(allStationsAvg));
    tbody.append("td").text(percentAllStations);
  });
}

init();

/////
// Function to create interactive Stats Table
/////
function onChangeStatsTable(fuel_type) {
  var tbody = d3.select(".stats-table-body tr");

  d3.json(`/filter_stats_table/${fuel_type}`).then((data) => {
    console.log(data);
    tbody.selectAll("td").remove();

    if (fuel_type == "All") {
      initStat();
    } else {
      tbody.append("td").text(numberWithCommas(data.num_power_plants));
      tbody.append("td").text(numberWithCommas(data.total_prod.toFixed(2)));
      tbody.append("td").text(numberWithCommas(data.avg_prod.toFixed(2)));
      tbody.append("td").text(numberWithCommas(data.percent_prod.toFixed(2)));
    }
  });
}

/////////////
// Data extraction maps filterers drop down values
////////////
d3.json("/all_energy").then((data) => {
  var difYears = [
    ...new Set(data.map((x) => x.commissioning_year).sort((a, b) => b - a)),
  ];

  var difEnergy = [...new Set(data.map((x) => x.primary_fuel).sort())];

  var difStates = [...new Set(data.map((x) => x.state).sort())];

  for (var i = 0; i < difStates.length; i++) {
    locationStateSelect
      .append("option")
      .attr("value", `${difStates[i]}`)
      .text(difStates[i]);
    prodStateSelect
      .append("option")
      .attr("value", `${difStates[i]}`)
      .text(difStates[i]);
  }

  for (var i = 0; i < difYears.length; i++) {
    locationYearSelect
      .append("option")
      .attr("value", `${difYears[i]}`)
      .text(difYears[i]);
    prodYearSelect
      .append("option")
      .attr("value", `${difYears[i]}`)
      .text(difYears[i]);
  }

  for (var i = 0; i < difEnergy.length; i++) {
    locationEnergySelect
      .append("option")
      .attr("value", `${difEnergy[i]}`)
      .text(difEnergy[i]);
    prodEnergySelect
      .append("option")
      .attr("value", `${difEnergy[i]}`)
      .text(difEnergy[i]);
  }
});

// // function dropDownSelect(dropDown) {
// //   dropDown.on("change", () => {
// //     var dropDownValue = dropDown.property("value");
// //     return dropDownValue;
// //   });
// // }

// // Function to filter data based on fuel type
// function filterByEnergy(dataset, energyType) {
//   var statsData = dataset.filter((data) => data.primary_fuel == energyType);
//   return statsData;
// }

// // var stateSelectValue;
// // locationStateSelect.on("change", dropDownSelect(locationStateSelect, stateSelectValue));

// locationStateSelect.on("change", () => {
//   var stateSelectValue = locationStateSelect.node().value;
//   console.log(stateSelectValue);
// });

// locationEnergySelect.on("change", () => {
//   energySelectValue = locationEnergySelect.node().value;
//   console.log(energySelectValue);
// });

// locationYearSelect.on("change", () => {
//   var yearSelectValue = locationYearSelect.node().value;
//   console.log(yearSelectValue);
// });

// prodStateSelect.on("change", () => {
//   var stateSelectValue = prodStateSelect.node().value;
//   console.log(stateSelectValue);
// });

// prodEnergySelect.on("change", () => {
//   var energySelectValue = prodEnergySelect.node().value;
//   console.log(energySelectValue);
// });

// prodYearSelect.on("change", () => {
//   var yearSelectValue = prodYearSelect.node().value;
//   console.log(yearSelectValue);
// });

// // locationYearSelect.on("change", () => {

// //   energySelectValue = locationEnergySelect.node().value;

// //   d3.json(`/input_testing/${energySelectValue}`, () =>{

// //   })
// // });

// // function renderClusters (state, energy, year) {
// //   d3.json(`/input_testing/${energySelectValue}`, () =>{

// //   })
// // }

//////////
// Data extraction for map 1

// locationEnergySelect.on("change", () => {
// d3.json(`/energy_filter/${primary_fuel}`).then((data) => {
//   var columnNames = [
//     "name",
//     "primary_fuel",
//     "commissioning_year",
//     "latitude",
//     "longitude",
//   ];

//   const redux = (array) =>
//     array.map((o) =>
//       columnNames.reduce((acc, curr) => {
//         acc[curr] = o[curr];
//         return acc;
//       }, {})
//     );

//   var reducedData = redux(data);

//   reducedData.forEach((d) => {
//     d.latitude = +d.latitude;
//     d.longitude = +d.longitude;
//     d.commissioning_year = +d.commissioning_year;
//   });

//   var heatArray = [];
//   var markerArray = [];

//   for (var i = 0; i < data.length; i++) {
//     allLocations = [data[i].latitude, data[i].longitude];
//     // Heat layer
//     heatArray.push(allLocations)
//     // Marker Cluster Group Layer
//     var marker = L.marker(allLocations).bindPopup(`
//           <p><strong> Name: </strong> ${data[i].name} </p>
//           <hr>
//           <p><strong> Commission Year: </strong> ${data[i].commissioning_year} </p>
//           <p><strong> Primary Fuel Type: </strong> ${data[i].primary_fuel} </p>
//         `);
//     markerArray.push(marker);
//   }

//   markerClusterGroup.addLayers(markerArray);
//   // Add our marker cluster layer to the map

//   var heat = L.heatLayer(heatArray, {
//     radius: 20,
//     blur: 35,
//     max: 1
//   });

//   var overlayMap = {
//     "Clusters": markerClusterGroup,
//     "Heat": heat
//   };

//   L.control.layers(overlayMap).addTo(myMap);

//     // markerArray = [];
//     var energySelectValue = locationEnergySelect.node().value;
//     var filteredData = filterByEnergy(data, energySelectValue);
//     console.log(energySelectValue)
//     // console.log(markerClusterGroup);
//     // // markerClusterGroup.clearLayers();
//     // console.log(markerClusterGroup);
//     // if (markerClusterGroup) {
//     //   myMap.removeLayers(markerClusterGroup);
//     // }

//     // Check for location property
//     if (energySelectValue == "All") {
//       for (var i = 0; i < data.length; i++) {
//         allLocations = [data[i].latitude, data[i].longitude];

//         marker = L.marker(allLocations).bindPopup(`
//                 <p><strong> Name: </strong> ${data[i].name} </p>
//                 <hr>
//                 <p><strong> Commission Year: </strong> ${data[i].commissioning_year} </p>
//                 <p><strong> Primary Fuel Type: </strong> ${data[i].primary_fuel} </p>
//               `);
//         markerArray.push(marker);
//       }
//       markerClusterGroup.addLayers(markerArray);
//     } else {
//       // // Loop through data
//       for (var i = 0; i < filteredData.length; i++) {
//         // Set the data location property to a variable
//         var filteredLocations = [
//           filteredData[i].latitude,
//           filteredData[i].longitude,
//         ];

//         marker = L.marker(filteredLocations).bindPopup(`
//               <p><strong> Name: </strong> ${filteredData[i].name} </p>
//               <hr>
//               <p><strong> Commission Year: </strong> ${filteredData[i].commissioning_year} </p>
//               <p><strong> Primary Fuel Type: </strong> ${filteredData[i].primary_fuel} </p>
//             `);
//         markerArray.push(marker);
//       }
//       markerClusterGroup.addLayers(markerArray);
//     }
//     // Add our marker cluster layer to the map
//     var overlayMap = {
//       "Clusters": markerClusterGroup,
//       "Heat": heat
//     };
//     L.control.layers(overlayMap).addTo(myMap);
//   });
// });

// // //////////
// // // Data extraction for map 2
// // d3.csv(dataset).then(function (data) {
// //   console.log(data);
// //   var columnNames = [
// //     "name",
// //     "primary_fuel",
// //     "generation_gwh_2017",
// //     "latitude",
// //     "longitude",

// //   ];

// //   const redux = (array) =>
// //     array.map((o) =>
// //       columnNames.reduce((acc, curr) => {
// //         acc[curr] = o[curr];
// //         return acc;
// //       }, {})
// //     );

// //   var reducedData = redux(data);
// //   // Create a new choropleth layer
// //   var choroplethLayer = L.choropleth(reducedData.toGeoJson(), {

// //     // Define what  property in the features to use
// //     valueProperty: 'generation_gwh_2017',

// //     // Set color scale
// //     scale: ["white", "red"],

// //     // Number of breaks in step range
// //     steps: 10,

// //     // q for quartile, e for equidistant, k for k-means
// //     mode: 'q',
// //     // Set style
// //     style: {
// //       color: '#fff', // border color
// //       weight: 2,
// //       fillOpacity: 0.8
// //     },
// //     onEachFeature: function (feature, layer) {
// //       // Binding a pop-up to each layer
// //       if (feature.properties.generation_gwh_2017) {
// //         layer.bindPopup("<h3> Median House Hold Income </h3> <hr>" + feature.properties.generation_gwh_2017)
// //       }
// //     }
// //   }).addTo(myMap2);
// // console.log(choroplethLayer)
// //   // Set up the legend
// //   var legend = L.control({ position: 'bottomright' })
// //   legend.onAdd = function (map) {
// //     var div = L.DomUtil.create('div', 'info legend')
// //     var limits = choroplethLayer.options.limits
// //     var colors = choroplethLayer.options.colors
// //     var labels = []
// //     console.log(choroplethLayer)
// //     console.log(colors)

// //     // Add min & max
// //     div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
// // 			<div class="max">' + limits[limits.length - 1] + '</div></div>'

// //     limits.forEach(function (limit, index) {
// //       labels.push('<li style="background-color: ' + colors[index] + '"></li>')
// //     })

// //     div.innerHTML += '<ul>' + labels.join('') + '</ul>'
// //     return div
// //   }
// //   legend.addTo(myMap2)
// // });

// //////////
// // Data extraction to build the data table
// d3.csv(dataset).then((data) => {
//   data.forEach((d) => {
//     d.latitude = (+d.latitude).toFixed(4);
//     d.longitude = (+d.longitude).toFixed(4);
//     d.commissioning_year = +d.commissioning_year;
//     d.generation_gwh_2017 = numberWithCommas((+d.generation_gwh_2017).toFixed(2));
//   });

//   var columnNames = [
//     "name",
//     "state",
//     "commissioning_year",
//     "primary_fuel",
//     "latitude",
//     "longitude",
//     "generation_gwh_2017",
//   ];

//   // Function to reduce data object to specific properties
//   const redux = (array) =>
//     array.map((o) =>
//       columnNames.reduce((acc, curr) => {
//         acc[curr] = o[curr];
//         return acc;
//       }, {})
//     );

//   var almostTableData = redux(data);

//   var tableData = almostTableData.map(Object.values);

//   });
// });

// function quantity(dataset) {
//   var total = dataset.length;
//   return total;
// }

//////////
// Data extraction for stats table

// Map 1
// Map of geolocations
var myMap = L.map("map", {
  center: [39.8283, -98.5795],
  zoom: 2,
  maxZoom: 18,
});

// Adding tile layer to the map
L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/dark-v10",
    accessToken: API_KEY,
  }
).addTo(myMap);

// Map 2
// Choropleth of production

var myMap2 = L.map("map2", {
  center: [39.8283, -98.5795],
  zoom: 4,
});

// Adding tile layer to the map
L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY,
  }
).addTo(myMap2);
