// Store our API endpoint as queryUrl.
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

        let circle = {
            radius: feature.properties.mag * 5,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "black",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        return L.circleMarker(latlng, circle);
    }

    // Define a function that we want to run once for each feature in the features array.
    // Ref. to https://github.com/pointhi/leaflet-color-markers for color code
    function getColor(depth) {
        if (depth < 10) return "#3274A3";
            else if (depth < 30) return "#C1A32D";
            else if (depth < 50) return "#982E40";
            else if (depth < 70) return "#31882A";
            else if (depth < 90) return "#98652E";
            else return "#742E98";

    }

// Create a GeoJSOn layer that contain the features array on the earthquakedata object, plus bind a popup that describes the location, time, and magnitude of the earthquake
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: createCircleMarker,
        onEachFeature: function (feature, layer) {
        
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
    
    // Let Map
function createMap(earthquakes) {
    
     let myMap = L.map("map", {
        center: [37.09, -95.71],
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