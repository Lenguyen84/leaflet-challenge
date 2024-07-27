// Import and visualize data - plot all earthquakes from the past 7 days on a map
// Store API endpoint
let queryurl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to query URL
d3.json(queryurl).then(function (data) {
    createFeatures(data.features);
})

function createFeatures(earthquakeData) {
// Set data markers to reflect magnitude by size and depth of earthquake by color
    function createCircleMarker(feature, latlng) {
        console.log("Feature:", feature);
        console.log("LatLng:", latlng);

        let options = {
            radius: feature.properties.mag * 5,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "black",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        return L.circleMarker(latlng, options);
    }

    // Define a function to determine the color based on earhtquake depth
    function getColor(depth) {
        if (depth < 10) {
            return "#BEF573";
        } else if (depth < 30) {
            return "#EDEB29";
        } else if (depth < 50) {
            return "#FBC927";
        } else if (depth < 70) {
            return "#F99619";
        } else if (depth < 90) {
            return "#FF9D73";
        } else {
            return "#FA3B2E";
        }
    }

 // Create a GeoJSOn layer that contain the features array on the earthquakedata object
 // Give each feature a popup that describes the place, time, and magnitude of the earthquake
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: createCircleMarker,
        onEachFeature: function (feature, layer) {
            // layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
            layer.on('mouseover', function() { 
                layer.bindPopup(`<b>Location:${feature.properties.place}</b><br><b>Magnitude: ${feature.properties.mag}</b><br><b>Depth: ${feature.geometry.coordinates[2]}</b>`).openPopup();
            });
            layer.on('mouseout', function() { 
                layer.bindPopup(`<b>Location:${feature.properties.place}</b><br><b>Magnitude: ${feature.properties.mag}</b><br><b>Depth: ${feature.geometry.coordinates[2]}</b>`).closePopup();
            });
        }
    });

    console.log("Earthquakes Layer:", earthquakes);

    // Send earthquakes layer to createMap function
    createMap(earthquakes);
}

// Create earthquake depth legend and add to map
let legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let legendData = [
        { limit: -10, color: '#BEF573' },
        { limit: 10, color: '#EDEB29' },
        { limit: 30, color: '#FBC927' },
        { limit: 50, color: '#F99619' },
        { limit: 70, color: '#FF9D73' },
        { limit: 90, color: '#FA3B2E' }
    ];

    //Add legend title
    div.innerHTML = '<h4>Depth</h4>';

    // Loop through legend data and add color blocks
    // Xpert Learning Assistant was used to identify and troubleshoot legend code
    for (let i = 0; i < legendData.length; i++) {
        let item = legendData[i];
        let colorBlock = document.createElement('div');
        colorBlock.className = 'legend-color-block';
        colorBlock.style.backgroundColor = item.color;
        colorBlock.textContent = item.limit + (legendData[i + 1] ? ' - ' + legendData[i + 1].limit : ' +');
        div.appendChild(colorBlock);
    }

    return div;
};
    
function createMap(earthquakes) {
    
    // Create map
    let myMap = L.map("map", {
        center: [
          37.09, -95.71
        ],
        zoom: 5
      });

    // Create the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(myMap);

    // Add earthquakes layer to the map
    earthquakes.addTo(myMap);
    legend.addTo(myMap);
}