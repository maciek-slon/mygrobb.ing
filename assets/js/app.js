var map, allMarkersList = [], allMarkersGroup, featureList, boroughSearch = [], theaterSearch = [], museumSearch = [];

var new_visited = [], last_id = -1;















$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(allMarkersGroup.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#editModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  $("#tracks").hide()
  $("#features").show()
  animateSidebar();
  return false;
});

$("#tracks-btn").click(function() {
  $("#tracks").show()
  $("#features").hide()
  animateSidebar();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = allMarkersList.find( (elem) => elem.id == id);
  // layer.fire("click");
  layer.openPopup();
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], map.zoom);
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  allMarkersList.forEach(function (elem) {
    if (map.hasLayer(elem) && map.getBounds().contains(elem.getLatLng())) {
      icon_name = icons[elem.cat][elem.subcat].name;
      $("#feature-list tbody").append('<tr class="feature-row" id="' + /*L.stamp(elem)*/ elem.id + '" lat="' + elem.getLatLng().lat + '" lng="' + elem.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="16" src="assets/icons/symbol/'+ icon_name +'.png"></td><td class="feature-name">' + data[elem.ref].name + '</td><td style="vertical-align: middle;"><i class="fa-solid fa-chevron-right flex-end"></i></td></tr>');
    }
  });

  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}


$("#tracks").hide()

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}







// -------------------------------------------------------
// Basemap layers
// -------------------------------------------------------

const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

const cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});

const CyclOSM = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
  maxZoom: 20,
  attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// https://atlasfontium.pl/mapy-historyczne/
const wig_25 = L.tileLayer.wms('https://pastmaps.cenagis.edu.pl/geoserver/ihpan/wms/?', {layers: 'wig25k_3857'});
const wig_100 = L.tileLayer.wms('https://pastmaps.cenagis.edu.pl/geoserver/ihpan/wms/?', {layers: 'wig100k_3857'});

// -------------------------------------------------------
// Overlay layers
// -------------------------------------------------------

const strava = L.tileLayer('https://proxy.nakarte.me/https/heatmap-external-b.strava.com/tiles-auth/ride/bluered/{z}/{x}/{y}.png?px=256', {
  maxZoom: 19,
  attribution: ''
});

var OpenRailwayMap = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


// -------------------------------------------------------
// Custom icon classes
// -------------------------------------------------------

var LeafIcon = L.Icon.extend({
  options: {
    iconSize:     [32, 37],
    iconAnchor:   [16, 37],
    popupAnchor:  [0, -34]
  }
});

var MedIcon = L.Icon.extend({
  options: {
    iconSize:     [24, 28],
    iconAnchor:   [12, 28],
    popupAnchor:  [0, -25]
  }
});

var SmallIcon = L.Icon.extend({
  options: {
    iconSize:     [12, 12],
    iconAnchor:   [6, 6],
    popupAnchor:  [0, -6]
  }
});

var xSmallIcon = L.Icon.extend({
  options: {
    iconSize:     [8, 8],
    iconAnchor:   [4, 4],
    popupAnchor:  [0, -4]
  }
});

var xxSmallIcon = L.Icon.extend({
  options: {
    iconSize:     [4, 4],
    iconAnchor:   [2, 2],
    popupAnchor:  [0, -2]
  }
});

// -------------------------------------------------------
// Categories tree and icon defenition
// -------------------------------------------------------

category_meta = [
  { 
    "category": "cmentarz",
    "color": "624eb7",
    "subcategories": [
      ["katolicki", "tourism/cult-religion/cemetary", "cemetary"],
      ["prawosławny", "tourism/cult-religion/cross", "cross-2"],
      ["żydowski", "tourism/cult-religion/jewish-cemetery-2", "jewishgrave"],
      ["protestancki", "tourism/cult-religion/headstone", "headstone-2"],
      ["muzułmański", "nature/weather/moon", "moonstar"],
      ["epidemiczny", "events/natural-disaster/deadly-danger", "skull"],
      ["inny", "tourism/monuments-structures/modern-monument", "modernmonument"],
    ]
  },
  { 
    "category": "sakralne", 
    "color": "624eb7",
    "subcategories": [
      ["kościół", "tourism/cult-religion/church", "church-2"],
      ["cerkiew", "tourism/cult-religion/convent", "convent-2"],
      ["synagoga", "tourism/place-to-see/jewish-quarter", "jewishquarter"],
      ["zbór", "tourism/cult-religion/cathedral", "cathedral"],
      ["meczet", "tourism/cult-religion/mosque", "mosquee"],
      ["kaplica", "tourism/cult-religion/chapel", "chapel-2"],
      ["inne", "tourism/place-to-see/city-square", "citysquare"]
    ]
  },
  {
    "category": "przemysłowe",
    "color": "aa4e04",
    "subcategories": [
      ["młyn wodny", "nature/agriculture/watermill", "watermill-2"],
      ["wiatrak", "nature/agriculture/windmill", "windmill-2"],
      ["gospodarstwo", "nature/agriculture/farm", "farm-2"],
      ["miasteczko", "tourism/place-to-see/small-city", "smallcity"],
      ["fabryka", "industry/factory", "factory"],
      ["browar", "industry/brewery", "brewery1"],
      ["inne", "markers/industry/industry-museum", "museum_industry"],
    ]
  },
  {
    "category": "kolejowe",
    "color": "e60e3a",
    "subcategories": [
      ["skansen", "transportation/other-types-of-transportation/steam-locomotive", "steamtrain"],
      ["stacja", "", "house"],
      ["wieża wodna", "", "watertower"],
      ["infrastruktura", "", "bridge_old"],
      ["inne", "", "levelcrossing"]
    ]
  }
]

// -------------------------------------------------------
// Prepare all layer groups and create icons
// -------------------------------------------------------

var layer_groups = {};
var icons = {};

for (i in category_meta) {
  elem = category_meta[i]
  cat = elem["category"];
  layer_groups[cat] = {};
  icons[cat] = {};

  select = document.getElementById('poi_cat');
  var optgr = document.createElement('optgroup');
  optgr.setAttribute("label", cat);

  for (j in elem["subcategories"]) {
    subelem = elem["subcategories"][j]
    subcat = subelem[0];
    icon_name = subelem[2];
    layer = L.layerGroup([]);
    layer_groups[cat][subcat] = layer;
    icon = {
      "white":   new LeafIcon({iconUrl: "assets/icons/white/" + icon_name + ".png"}),
      "visited": new LeafIcon({iconUrl: "assets/icons/visited/" + icon_name + ".png"}),
      "symbol":  new LeafIcon({iconUrl: "assets/icons/symbol/" + icon_name + ".png"}),
      "m_white":   new MedIcon({iconUrl: "assets/icons/white/" + icon_name + ".png"}),
      "m_visited": new MedIcon({iconUrl: "assets/icons/visited/" + icon_name + ".png"}), 
      "s_white": new xSmallIcon({iconUrl: "assets/icons/" + cat + "_w.png"}), 
      "s_visited": new xSmallIcon({iconUrl: "assets/icons/" + cat + "_v.png"}), 
      "xs_white": new xSmallIcon({iconUrl: "assets/icons/" + cat + "_w.png"}), 
      "xs_visited": new xSmallIcon({iconUrl: "assets/icons/" + cat + "_v.png"}),
      "xxs_white": new xxSmallIcon({iconUrl: "assets/icons/" + cat + "_w.png"}), 
      "xxs_visited": new xxSmallIcon({iconUrl: "assets/icons/" + cat + "_v.png"}),
      "name": icon_name
    };
    icons[cat][subcat] = icon;


    var opt = document.createElement('option');
    opt.value = cat + "|" + subcat;
    opt.innerHTML = subcat;
    opt.setAttribute("title", cat + " / " + subcat)
    opt.setAttribute("data-tokens", cat + " " + subcat)
    optgr.appendChild(opt);
  }
  select.appendChild(optgr);
}

function formatCat(elem) {
  label = elem.text;
  
  if (elem.id) { 
    cats = elem.id.split("|")
    cat = cats[0];
    subcat = cats[1];
    label = $('\
      <span> \
        <img src="assets/icons/symbol/' + icons[cat][subcat]["name"] + '.png" class="panel_icon" /> ' + 
        elem.text + '</span>'
    );
  }

  return label;
};

function formatCatSubcat(elem) {
  label = elem.text;
  
  if (elem.id) { 
    cats = elem.id.split("|")
    cat = cats[0];
    subcat = cats[1];
    label = $('\
      <span> \
        <img src="assets/icons/symbol/' + icons[cat][subcat]["name"] + '.png" class="panel_icon" /> ' + 
        cat + " / " + subcat + '</span>'
    );
  }

  return label;
};

$('#poi_cat').select2({
  dropdownParent: $('#editModal'),
  width: '100%',
  templateResult: formatCat,
  templateSelection: formatCatSubcat
});

// =======================================================
//
// Markers loading and setup
//
// =======================================================

function clickFeature(e) {
  isCtrlKey = e.originalEvent.ctrlKey;
  ismetaKey = e.originalEvent.metaKey;

  // CTRL+click: oznacz obiekt jako odwiedzony
  if (isCtrlKey || ismetaKey) {
    
    map.closePopup();
    var layer = e.target;
    console.log(e.target.cat, e.target.subcat)
    e.target.variant = "visited";
    e.target.setIcon(icons[e.target.cat][e.target.subcat]["visited"]);


    visited.push(e.target.id);
    new_visited.push(e.target.id);
    // fetch("/api/visit/" + e.target.id, {
    //   credentials: "same-origin",
    //   mode: "same-origin",
    //   method: "get"
    // })

    let transaction = db.transaction("visited", "readwrite");
    db_visited = transaction.objectStore("visited");
    let addRequest = db_visited.put(e.target.id);

    addRequest.onsuccess = function(event) {
      console.log(event);
    };

  }

  $("#poi_id").val(e.target.id);
  $("#poi_name").val(data[e.target.ref].name);
  $("#poi_lat").val(e.target.getLatLng().lat);
  $("#poi_lon").val(e.target.getLatLng().lng);
  $("#poi_cat").val(e.target.cat + "|" + e.target.subcat);
  $("#poi_url").val(data[e.target.ref].url);
}

// -------------------------------------------------------
// Add new marker to the appropriate layer
// TODO: add layer list as parameter
// TODO: pass an actual object instead of the index
// -------------------------------------------------------
function addMarker(d, update = false) {
  cat = data[d]["cat"]
  subcat = data[d]["subcat"]

  if (!layer_groups[cat]) {
    console.log("Unknown cat ", cat, data[d]);
    return
  } 

  layer = layer_groups[cat][subcat]
  if (layer==null) {
    console.log("Unknown cat/subcat", cat, subcat, data[d]);
    return
  }


  lat = data[d]["lat"];
  lon = data[d]["lon"];
  //desc = data[d]["id"] + " | " + data[d]["name"];
  desc = data[d]["name"] + " <a href='#' onclick='map.closePopup(); $(\"#editModal\").modal(\"show\")'>edit</a>"
  icon_variant = visited.includes(data[d]["id"])?"visited":"white";
  icon = icons[cat][subcat]["m_"+icon_variant];
  
  var marker = L.marker([lat, lon], {icon: icon, riseOnHover: true}).bindPopup(desc);
  marker.ref = d;
  marker.id = data[d]["id"]
  marker.cat = cat;
  marker.subcat = subcat;
  marker.variant = icon_variant;
  marker.on({"click": clickFeature});
  // marker.setOpacity(0.5);
  
  if (update) {
    old_marker = allMarkersList.find(elem => elem.id == data[d]["id"]);
    // console.log(old_marker);
    old_layer = layer_groups[old_marker["cat"]][old_marker["subcat"]];
    old_layer.removeLayer(old_marker);
    allMarkersList[d] = marker;
  } else {
    allMarkersList.push(marker);
  }
  
  marker.addTo(layer);
}

function updateData(old_data, new_data) {
  ret_new = 0;
  ret_upd = 0;
  for(i in new_data) {
    elem = new_data[i];
    data_index = old_data.findIndex(x => x.id == elem.id);

    console.log("Index: ", data_index);

    if (data_index < 0) {
      data.push(elem);
      data_index = data.length - 1;
      ret_new = ret_new + 1;
    } else {
      data[data_index] = elem;
      ret_upd = ret_upd + 1;
    }
  }
  return [ret_new, ret_upd];
}

function loadMarkers(data) {
  // console.log(visited);
  for (d in data) {
    addMarker(d);
    if (data[d]["id"] > last_id) last_id = data[d]["id"];
  }
  allMarkersGroup = new L.featureGroup(allMarkersList);
  $("#loading").hide();
}

// $.getJSON( "./data/visited.json", function( jsondata ) {
//   visited = jsondata.visited;
//   console.log(visited)

// -------------------------------------------
// IndexedDB
// -------------------------------------------

var db;
let request = indexedDB.open("local_changes", 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  db_points = db.createObjectStore("points", { keyPath: "id" });
  db_visited = db.createObjectStore("visited", { autoIncrement: true });
  // objectStore.createIndex("nameIndex", "name", { unique: false });
};

request.onsuccess = function(event) {
  db = event.target.result;
  loadData();
};

request.onerror = function(event) {
  // Error occurred while opening the database
  console.log("Cant't open DB", event)
};

// function odmiana(liczba, pojedyncza, mnoga, mnoga_dopelniacz) {
// 	liczba = Math.abs(liczba); // tylko jeśli mogą zdarzyć się liczby ujemne
// 	if (liczba === 1) return pojedyncza;
// 	var reszta10 = liczba % 10;
// 	var reszta100 = liczba % 100;
// 	if (reszta10 > 4 || reszta10 < 2 || (reszta100 < 15 && reszta100 > 11))
// 		return mnoga_dopelniacz;
// 	return mnoga;
// }

$("#download-changes").click(function() {
  if ($("#download-changes").hasClass("disabled")) {

  } else {
    let transaction = db.transaction("points", "readonly");
    db_points = transaction.objectStore("points");
    let request = db_points.getAll();
    request.onerror = (event) => {
      console.err("error fetching data");
    };
    request.onsuccess = (event) => {
      csvString = Papa.unparse(request.result, {delimiter: ";"});
      download("changes.csv", csvString);
    }
  }
});

function updateChangeInfo() {
  let transaction = db.transaction("points", "readonly");
  db_points = transaction.objectStore("points");
  let request = db_points.count();
  request.onerror = (event) => {
      console.err("error fetching data");
  };
  request.onsuccess = (event) => {
    count = request.result;
    $("#change_count").text(count);
    if (count > 0) {
      $("#download-changes").removeClass("disabled");
    } else {
      $("#download-changes").addClass("disabled");
    }
  }
}

function loadData() {
  // Read markers data from data.csv
  $.get('./data/pois.csv', function(csvString) {
    // Use PapaParse to convert string to array of objects
    data = Papa.parse(csvString, {header: true, dynamicTyping: true}).data;

    let transaction = db.transaction("points", "readonly");
    db_points = transaction.objectStore("points");
    let request = db_points.getAll();
    request.onerror = (event) => {
        console.err("error fetching data");
    };
    request.onsuccess = (event) => {
      res = updateData(data, request.result);
      
      updateChangeInfo();

      let transaction = db.transaction("visited", "readonly");
      db_visited = transaction.objectStore("visited");
      let request2 = db_visited.getAll();
      request2.onerror = (event) => {
          console.err("error fetching data");
      };
      request2.onsuccess = (event) => {
        visited = request2.result;
        
        loadMarkers(data);
        syncSidebar();
      }
    };

  });
}

// --------------------------------------------------
// Dodawanie i edycja właściwości obiektów
// --------------------------------------------------

function poi_add() {
  
  map.closePopup();

  poi_id = parseInt($("#poi_id").val());
  poi_name = $("#poi_name").val();
  lat = parseFloat($("#poi_lat").val());
  lon = parseFloat($("#poi_lon").val());
  cats = $("#poi_cat").val().split("|");
  cat = cats[0];
  subcat = cats[1];
  poi_url = $("#poi_url").val();

  elem = {
    "id": poi_id,
    "name": poi_name,
    "lat": lat,
    "lon": lon,
    "cat": cat,
    "subcat": subcat,
    "url": poi_url
  };
  
  console.log("After edit: ", elem)

  data_index = data.findIndex(x => x.id == poi_id);

  console.log("Index: ", data_index);

  if (data_index < 0) {
    data.push(elem);
    data_index = data.length - 1;
    addMarker(data_index);
  } else {
    data[data_index] = elem;
    addMarker(data_index, true);
  }


  let transaction = db.transaction("points", "readwrite");
  db_points = transaction.objectStore("points");
  let addRequest = db_points.put(elem);

  addRequest.onsuccess = function(event) {
    console.log(event);
    updateChangeInfo();
  };

  // const dataToSend = JSON.stringify(elem);
  // let dataReceived = ""; 
  // fetch("/api/add_poi/", {
  //   credentials: "same-origin",
  //   mode: "same-origin",
  //   method: "post",
  //   headers: { "Content-Type": "application/json" },
  //   body: dataToSend
  // })
  //   .then(resp => {
  //     if (resp.status === 200) {
  //       return resp.json()
  //     } else {
  //       console.log("Status: " + resp.status)
  //       return Promise.reject("server")
  //     }
  //   })
  //   .then(dataJson => {
  //     dataReceived = dataJson
  //     console.log('Received: ', dataReceived)   
  //   })
  //   .catch(err => {
  //     if (err === "server") return
  //     console.log(err)
  //   })

  $('#editModal').modal("hide");

}

$("#poi_add").on("click", poi_add);

function addPoint(latlng) {
  highlight.clearLayers();

  console.log(latlng);

  $("#poi_id").val(last_id + 1);
  $("#poi_name").val("");
  $("#poi_lat").val(latlng.lat);
  $("#poi_lon").val(latlng.lng);
  $("#poi_cat").val("cmentarz|katolicki");
  $("#poi_url").val("");

  $("#editModal").modal("show");
  
}



















/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

// var boroughs = L.geoJson(null, {
//   style: function (feature) {
//     return {
//       color: "black",
//       fill: false,
//       opacity: 1,
//       clickable: false
//     };
//   },
//   onEachFeature: function (feature, layer) {
//     boroughSearch.push({
//       name: layer.feature.properties.BoroName,
//       source: "Boroughs",
//       id: L.stamp(layer),
//       bounds: layer.getBounds()
//     });
//   }
// });
// $.getJSON("data/boroughs.geojson", function (data) {
//   boroughs.addData(data);
// });

// //Create a color dictionary based off of subway route_id
// var subwayColors = {"1":"#ff3135", "2":"#ff3135", "3":"ff3135", "4":"#009b2e",
//     "5":"#009b2e", "6":"#009b2e", "7":"#ce06cb", "A":"#fd9a00", "C":"#fd9a00",
//     "E":"#fd9a00", "SI":"#fd9a00","H":"#fd9a00", "Air":"#ffff00", "B":"#ffff00",
//     "D":"#ffff00", "F":"#ffff00", "M":"#ffff00", "G":"#9ace00", "FS":"#6e6e6e",
//     "GS":"#6e6e6e", "J":"#976900", "Z":"#976900", "L":"#969696", "N":"#ffff00",
//     "Q":"#ffff00", "R":"#ffff00" };

// var subwayLines = L.geoJson(null, {
//   style: function (feature) {
//       return {
//         color: subwayColors[feature.properties.route_id],
//         weight: 3,
//         opacity: 1
//       };
//   },
//   onEachFeature: function (feature, layer) {
//     if (feature.properties) {
//       var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Division</th><td>" + feature.properties.Division + "</td></tr>" + "<tr><th>Line</th><td>" + feature.properties.Line + "</td></tr>" + "<table>";
//       layer.on({
//         click: function (e) {
//           $("#feature-title").html(feature.properties.Line);
//           $("#feature-info").html(content);
//           $("#featureModal").modal("show");

//         }
//       });
//     }
//     layer.on({
//       mouseover: function (e) {
//         var layer = e.target;
//         layer.setStyle({
//           weight: 3,
//           color: "#00FFFF",
//           opacity: 1
//         });
//         if (!L.Browser.ie && !L.Browser.opera) {
//           layer.bringToFront();
//         }
//       },
//       mouseout: function (e) {
//         subwayLines.resetStyle(e.target);
//       }
//     });
//   }
// });
// $.getJSON("data/subways.geojson", function (data) {
//   subwayLines.addData(data);
// });

/* Single marker cluster layer to hold all clusters */
// var markerClusters = new L.MarkerClusterGroup({
//   spiderfyOnMaxZoom: true,
//   showCoverageOnHover: false,
//   zoomToBoundsOnClick: true,
//   disableClusteringAtZoom: 16
// });

/* Empty layer placeholder to add to layer control for listening when to add/remove theaters to markerClusters layer */
// var theaterLayer = L.geoJson(null);
// var theaters = L.geoJson(null, {
//   pointToLayer: function (feature, latlng) {
//     return L.marker(latlng, {
//       icon: L.icon({
//         iconUrl: "assets/img/theater.png",
//         iconSize: [24, 28],
//         iconAnchor: [12, 28],
//         popupAnchor: [0, -25]
//       }),
//       title: feature.properties.NAME,
//       riseOnHover: true
//     });
//   },
//   onEachFeature: function (feature, layer) {
//     if (feature.properties) {
//       var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.NAME + "</td></tr>" + "<tr><th>Phone</th><td>" + feature.properties.TEL + "</td></tr>" + "<tr><th>Address</th><td>" + feature.properties.ADDRESS1 + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<table>";
//       layer.on({
//         click: function (e) {
//           $("#feature-title").html(feature.properties.NAME);
//           $("#feature-info").html(content);
//           $("#featureModal").modal("show");
//           highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
//         }
//       });
//       $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/theater.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa-solid fa-chevron-right flex-end"></i></td></tr>');
//       theaterSearch.push({
//         name: layer.feature.properties.NAME,
//         address: layer.feature.properties.ADDRESS1,
//         source: "Theaters",
//         id: L.stamp(layer),
//         lat: layer.feature.geometry.coordinates[1],
//         lng: layer.feature.geometry.coordinates[0]
//       });
//     }
//   }
// });
// $.getJSON("data/DOITT_THEATER_01_13SEPT2010.geojson", function (data) {
//   theaters.addData(data);
//   map.addLayer(theaterLayer);
// });

// /* Empty layer placeholder to add to layer control for listening when to add/remove museums to markerClusters layer */
// var museumLayer = L.geoJson(null);
// var museums = L.geoJson(null, {
//   pointToLayer: function (feature, latlng) {
//     return L.marker(latlng, {
//       icon: L.icon({
//         iconUrl: "assets/img/museum.png",
//         iconSize: [24, 28],
//         iconAnchor: [12, 28],
//         popupAnchor: [0, -25]
//       }),
//       title: feature.properties.NAME,
//       riseOnHover: true
//     });
//   },
//   onEachFeature: function (feature, layer) {
//     if (feature.properties) {
//       var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.NAME + "</td></tr>" + "<tr><th>Phone</th><td>" + feature.properties.TEL + "</td></tr>" + "<tr><th>Address</th><td>" + feature.properties.ADRESS1 + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<table>";
//       layer.on({
//         click: function (e) {
//           $("#feature-title").html(feature.properties.NAME);
//           $("#feature-info").html(content);
//           $("#featureModal").modal("show");
//           highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
//         }
//       });
//       $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/museum.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa-solid fa-chevron-right flex-end"></i></td></tr>');
//       museumSearch.push({
//         name: layer.feature.properties.NAME,
//         address: layer.feature.properties.ADRESS1,
//         source: "Museums",
//         id: L.stamp(layer),
//         lat: layer.feature.geometry.coordinates[1],
//         lng: layer.feature.geometry.coordinates[0]
//       });
//     }
//   }
// });
// $.getJSON("data/DOITT_MUSEUM_01_13SEPT2010.geojson", function (data) {
//   museums.addData(data);
// });

map = L.map("map", {
  zoom: 10,
  center: [52.2, 21.],
  layers: [osm, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  syncSidebar();
});

map.on("overlayremove", function(e) {
  console.log(e);
    syncSidebar();
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
  if (e.originalEvent.shiftKey) {
    addPoint(e.latlng);
  }
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

map.on('zoomend', function() {
  var currentZoom = map.getZoom();
  console.log(currentZoom);
  icon_size = "";
  if (currentZoom > 11) {
    icon_size = "";
  } else if (currentZoom > 9) {
    icon_size = "m_";
  } else if (currentZoom > 8) {
    icon_size = "s_";
  } else if (currentZoom > 7) {
    icon_size = "xs_";
  } else {
    icon_size = "xxs_";
  }
  allMarkersList.forEach(function (layer) {
      cat = layer.cat;
      subcat = layer.subcat;
      variant = layer.variant;
      layer.setIcon(icons[cat][subcat][icon_size+variant]);
  });
});



// -----------------------------------------------------
// Wyświetlanie pliku lokalnego
// -----------------------------------------------------


var fileInput = document.getElementById('input_files');

//this function convert the string representation of some XML
//into a DOM object.
function StringToXMLDom(string){
	var xmlDoc=null;
	if (window.DOMParser)
	{
		parser=new DOMParser();
		xmlDoc=parser.parseFromString(string,"text/xml");
	}
	else // Internet Explorer
	{
		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async="false";
		xmlDoc.loadXML(string);
	}
	return xmlDoc;
}

fileInput.addEventListener('change', function (event) {
  var file = fileInput.files[0],
      fr = new FileReader();
  fileInput.value = ''; // Clear the input.
  extension = file.name.split('.')[1]
  if (extension === 'geojson') {
      fr.onload = function () {
        geojson = JSON.parse(fr.result);
        var layer = L.geoJson(geojson).addTo(map);
        var coords = geojson.features[0].geometry.coordinates[0][0];
        console.log(coords)
        var marker = L.marker(new L.LatLng(coords[1], coords[0]), {
            title: 'My Bike Route'
        }).addTo(map);

        $("#tracks-list tbody").append('<tr class="track-row" id="' + /*L.stamp(elem)*/ 1 + '" lat="' + coords[1] + '" lng="' + coords[0] + '"><td style="vertical-align: middle;"><img width="24" height="24" src="assets/icons/symbol/'+ 'track' +'.png"></td><td class="feature-name">' + file.name + '</td><td style="vertical-align: middle;"><i class="fa-solid fa-chevron-right flex-end"></i></td></tr>');
        map.fitBounds(layer.getBounds());
      };
      fr.readAsText(file);
  }
  if (extension === 'gpx') {
    fr.onload = function () {
      // var xmlData = $(fr.result);
      xmlData = StringToXMLDom(fr.result);
      geojson = toGeoJSON.gpx(xmlData);
      var layer = L.geoJson(geojson).addTo(map);
      var coords = geojson.features[0].geometry.coordinates[0];
      console.log(coords)
      var marker = L.marker(new L.LatLng(coords[1], coords[0]), {
          title: 'My Bike Route'
      }).addTo(map);

      $("#tracks-list tbody").append('<tr class="track-row" id="' + /*L.stamp(elem)*/ 1 + '" lat="' + coords[1] + '" lng="' + coords[0] + '"><td style="vertical-align: middle;"><img width="24" height="24" src="assets/icons/symbol/'+ 'track' +'.png"></td><td class="feature-name">' + file.name + '</td><td style="vertical-align: middle;"><i class="fa-solid fa-chevron-right flex-end"></i></td></tr>');
      map.fitBounds(layer.getBounds());
    };
    fr.readAsText(file);
}
});







var attributionControl = L.control({
  position: "bottomleft"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution d-inline-flex");
  div.innerHTML = "<span class='d-none d-sm-block'>Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomleft"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomleft",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa-solid fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = [
  {
    group: "Mapa bazowa",
    layers: [
      {
        name: "Open Street Map",
        layer: osm
      },
      {
        name: "cartoLight",
        layer: cartoLight
      },
      {
        name: "CyclOSM",
        layer: CyclOSM
      },
      {
        name: "WIG 1:25k",
        layer: wig_25
      },
      {
        name: "WIG 1:100k",
        layer: wig_100
      }
    ]
  }
];

var overLayers = [
  {
    group: "Nakładki",
    layers: [
      {
        active: false,
        name: "Strava global heatmap",
        // icon: '<i class="icon icon-drinking_water"></i>',
        layer: strava
      },
      {
        active: false,
        name: "OpenRailwayMap",
        layer: OpenRailwayMap
      }
    ]
  },
]

for (cat in layer_groups) {
  lg = layer_groups[cat];
  group_def = {group: cat, layers: []}
  for (subcat in lg) {
    layer = lg[subcat];
    group_def.layers.push({active: true, name: subcat, layer: layer, icon: "<img src='assets/icons/symbol/"+icons[cat][subcat]["name"]+".png' class='panel_icon'>"});
  }
  overLayers.push(group_def);
}

// L.control.layers.tree(baseTree, overlaysTree).addTo(map);
var panelLayers = new L.Control.PanelLayers(baseLayers, overLayers, {
  // compact: true,
  collapsed: true,
  collapsibleGroups: true,
  selectorGroup: true,
});

map.addControl(panelLayers);


/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});









/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  sizeLayerControl();
  /* Fit map to boroughs bounds */
  //map.fitBounds(boroughs.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});
  syncSidebar();
  // var boroughsBH = new Bloodhound({
  //   name: "Boroughs",
  //   datumTokenizer: function (d) {
  //     return Bloodhound.tokenizers.whitespace(d.name);
  //   },
  //   queryTokenizer: Bloodhound.tokenizers.whitespace,
  //   local: boroughSearch,
  //   limit: 10
  // });

  // var theatersBH = new Bloodhound({
  //   name: "Theaters",
  //   datumTokenizer: function (d) {
  //     return Bloodhound.tokenizers.whitespace(d.name);
  //   },
  //   queryTokenizer: Bloodhound.tokenizers.whitespace,
  //   local: theaterSearch,
  //   limit: 10
  // });

  // var museumsBH = new Bloodhound({
  //   name: "Museums",
  //   datumTokenizer: function (d) {
  //     return Bloodhound.tokenizers.whitespace(d.name);
  //   },
  //   queryTokenizer: Bloodhound.tokenizers.whitespace,
  //   local: museumSearch,
  //   limit: 10
  // });

  // var geonamesBH = new Bloodhound({
  //   name: "GeoNames",
  //   datumTokenizer: function (d) {
  //     return Bloodhound.tokenizers.whitespace(d.name);
  //   },
  //   queryTokenizer: Bloodhound.tokenizers.whitespace,
  //   remote: {
  //     url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
  //     filter: function (data) {
  //       return $.map(data.geonames, function (result) {
  //         return {
  //           name: result.name + ", " + result.adminCode1,
  //           lat: result.lat,
  //           lng: result.lng,
  //           source: "GeoNames"
  //         };
  //       });
  //     },
  //     ajax: {
  //       beforeSend: function (jqXhr, settings) {
  //         settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
  //         $("#searchicon").removeClass("fa-magnifying-glass").addClass("fa-rotate fa-spin");
  //       },
  //       complete: function (jqXHR, status) {
  //         $('#searchicon').removeClass("fa-rotate fa-spin").addClass("fa-magnifying-glass");
  //       }
  //     }
  //   },
  //   limit: 10
  // });
  // boroughsBH.initialize();
  // theatersBH.initialize();
  // museumsBH.initialize();
  // geonamesBH.initialize();

  /* instantiate the typeahead UI */
  // $("#searchbox").typeahead({
  //   minLength: 3,
  //   highlight: true,
  //   hint: false
  // }, {
  //   name: "Boroughs",
  //   displayKey: "name",
  //   source: boroughsBH.ttAdapter(),
  //   templates: {
  //     header: "<h4 class='typeahead-header'>Boroughs</h4>"
  //   }
  // }, {
  //   name: "Theaters",
  //   displayKey: "name",
  //   source: theatersBH.ttAdapter(),
  //   templates: {
  //     header: "<h4 class='typeahead-header'><img src='assets/img/theater.png' width='24' height='28'>&nbsp;Theaters</h4>",
  //     suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
  //   }
  // }, {
  //   name: "Museums",
  //   displayKey: "name",
  //   source: museumsBH.ttAdapter(),
  //   templates: {
  //     header: "<h4 class='typeahead-header'><img src='assets/img/museum.png' width='24' height='28'>&nbsp;Museums</h4>",
  //     suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
  //   }
  // }, {
  //   name: "GeoNames",
  //   displayKey: "name",
  //   source: geonamesBH.ttAdapter(),
  //   templates: {
  //     header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
  //   }
  // }).on("typeahead:selected", function (obj, datum) {
  //   if (datum.source === "Boroughs") {
  //     map.fitBounds(datum.bounds);
  //   }
  //   if (datum.source === "Theaters") {
  //     if (!map.hasLayer(theaterLayer)) {
  //       map.addLayer(theaterLayer);
  //     }
  //     map.setView([datum.lat, datum.lng], 17);
  //     if (map._layers[datum.id]) {
  //       map._layers[datum.id].fire("click");
  //     }
  //   }
  //   if (datum.source === "Museums") {
  //     if (!map.hasLayer(museumLayer)) {
  //       map.addLayer(museumLayer);
  //     }
  //     map.setView([datum.lat, datum.lng], 17);
  //     if (map._layers[datum.id]) {
  //       map._layers[datum.id].fire("click");
  //     }
  //   }
  //   if (datum.source === "GeoNames") {
  //     map.setView([datum.lat, datum.lng], 14);
  //   }
  //   if ($(".navbar-collapse").height() > 50) {
  //     $(".navbar-collapse").collapse("hide");
  //   }
  // }).on("typeahead:opened", function () {
  //   $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
  //   $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  // }).on("typeahead:closed", function () {
  //   $(".navbar-collapse.in").css("max-height", "");
  //   $(".navbar-collapse.in").css("height", "");
  // });
  // $(".twitter-typeahead").css("position", "static");
  // $(".twitter-typeahead").css("display", "block");
});




// Leaflet patch to make layer control scrollable on touch browsers
// var container = $(".leaflet-control-layers")[0];
// if (!L.Browser.touch) {
//   L.DomEvent
//   .disableClickPropagation(container)
//   .disableScrollPropagation(container);
// } else {
//   L.DomEvent.disableClickPropagation(container);
// }