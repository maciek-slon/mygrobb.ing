var map, allMarkersList = [], allMarkersGroup, featureList, tracksList, boroughSearch = [], theaterSearch = [], museumSearch = [];

var new_visited = [], last_id = -1;

var data = [], source_data = [], changes = {};


function genTSID(base_date = new Date(2025, 0, 1)) { 
  var ts = Date.now() - base_date; 
  var id = Math.floor(Math.random() * 1024); 
  return ts * 1024 + id; 
}

function getTimeFromTSID(tsid, base_date = new Date(2025, 0, 1)) { 
  var ts = Math.floor(tsid / 1024) + base_date.valueOf(); 
  return new Date(ts); 
}










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
  if ($("#sidebar").is(":hidden")) animateSidebar();
  return false;
});

$("#tracks-btn").click(function() {
  $("#tracks").show()
  $("#features").hide()
  if ($("#sidebar").is(":hidden")) animateSidebar();
  return false;
});

$("#data-maps-btn").click(function() {
  $("#attributionModal").modal("show");
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$(".sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function showSidebar() {
  $("#sidebar").animate({
    width: "350px"
  }, 350, function() {
    map.invalidateSize();
  });
}

function hideSidebar() {
  $("#sidebar").animate({
    width: "0px"
  }, 350, function() {
    map.invalidateSize();
  });
}

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
const wig_25 = L.tileLayer.wms('https://pastmaps.cenagis.edu.pl/geoserver/ihpan/wms/?', {
  layers: 'wig25k_3857',
  attribution: 'Mapa szczegółowa WIG 1:25 000 (1913-1939). Źródło: <a href="http://igrek.amzp.pl/" title="MAPSTER - Mapy archiwalne Polski i Europy Środkowej">http://igrek.amzp.pl</a>, kalibracja: Cartomatic, pozyskane ze strony <a href="https://atlas.ihpan.edu.pl/pastmaps">Mapy z przeszłością</a>'
});
const wig_100 = L.tileLayer.wms('https://pastmaps.cenagis.edu.pl/geoserver/ihpan/wms/?', {
   layers: 'wig100k_3857',
   attribution: 'Mapa taktyczna WIG 1:100 000 (1913-1939). Źródło: <a href="http://igrek.amzp.pl/" title="MAPSTER - Mapy archiwalne Polski i Europy Środkowej">http://igrek.amzp.pl</a>, kalibracja: Cartomatic, pozyskane ze strony <a href="https://atlas.ihpan.edu.pl/pastmaps">Mapy z przeszłością</a>'
});

// -------------------------------------------------------
// Overlay layers
// -------------------------------------------------------

// kolory strava: blue, bluered, red, hot, gray, orange, purple
strava_proxy_url = 'https://proxy.nakarte.me/https/heatmap-external-b.strava.com/tiles-auth/ride/orange/{z}/{x}/{y}.png?px=256';
strava_url = "https://heatmap-external-{s}.strava.com/tiles-auth/ride/bluered/{z}/{x}/{y}.png?Key-Pair-Id=APKAIDPUN4QMG7VUQPSA&Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHBzOi8vaGVhdG1hcC1leHRlcm5hbC0qLnN0cmF2YS5jb20vKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTczNzQ2MzM3MH0sIkRhdGVHcmVhdGVyVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzM2MjM5MzcwfX19XX0_&Signature=Sn0XwNcgnzq8HS5hqdoj1jtPMbwEHX1W42sYeHryQ-aOtfY5cvgotJ8B7GQJriZy7JjOU57O10H0J81Qka-7ypTY63gOyJQOPvvi0Mc3PvodqhjpT2h8ZOyd8I7wQPd-gWRvJe~2IF6~beczzO3CzcRJyFp2eaew0~ne5c0-sj1yKzdOLzYgceYQqmGxrra9MxqTJMvH2xlGp2Il84hdsKEg2WkTC1A~DHw5NMMXbDM2Ke4LMGU6SuegE45gacQZwPMRMRv8DlZs4TNnareeQ-JSGdzf5Xc2zg-eLwO7W61cxW1HlHQS5B7Wqr~D63B6W3-nvgxenurTUedTiSrmcQ__";
const strava = L.tileLayer(strava_proxy_url, {
  maxZoom: 19,
  attribution: ''
});



var OpenRailwayMap = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var WaymarkedTrails_hiking = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://waymarkedtrails.org">waymarkedtrails.org</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
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
  console.log("CAT: ", elem)
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

  var data_elem = data.find((el) => el.id == e.target.id);

  // CTRL+click: oznacz obiekt jako odwiedzony
  if (isCtrlKey || ismetaKey) {
    
    map.closePopup();
    var layer = e.target;
    console.log(e.target.cat, e.target.subcat)
    e.target.variant = "visited";
    e.target.setIcon(icons[e.target.cat][e.target.subcat]["visited"]);

    
    if (active_track && data_elem) {
      addTrackWaypoint(active_track, data_elem);
    }

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

  } else {

    var lat = e.target.getLatLng().lat.toFixed(5);
    var lon = e.target.getLatLng().lng.toFixed(5);
    $("#poi_id").val(e.target.id);
    $("#poi_name").val(data[e.target.ref].name);
    $("#poi_lat").val(lat);
    $("#poi_lon").val(lon);
    $("#poi_cat").val(e.target.cat + "|" + e.target.subcat).trigger('change');
    $("#poi_url").val(data[e.target.ref].url);

    // fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&layer=address&zoom=13`, { 
    //   method: 'GET'
    // })
    // .then(function(response) { 
    //   if (response.status == 200) {
    //     console.log("OK");
    //     return response.json(); 
    //   } 
    // })
    // .then(function(json) {
    //   console.log(json)
    // })
    


    if (active_track && data_elem) {
      map.closePopup();
      handleTrackPoint(e.target.getLatLng().lat, e.target.getLatLng().lng);
      addTrackWaypoint(active_track, data_elem);
    }
  }
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
  
  var marker = L.marker([lat, lon], {icon: icon, riseOnHover: true, draggable: true}).bindPopup(desc);
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

    changes[elem.id] = elem;
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
let request = indexedDB.open("local_changes", 2);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains("points")) db.createObjectStore("points", { keyPath: "id" });
  if (!db.objectStoreNames.contains("visited")) db.createObjectStore("visited", { autoIncrement: true });
  if (!db.objectStoreNames.contains("tracks")) db.createObjectStore("tracks", { autoIncrement: true });
  // objectStore.createIndex("nameIndex", "name", { unique: false });
};

request.onsuccess = function(event) {
  db = event.target.result;
  loadData();
  loadTracks();
};

request.onerror = function(event) {
  // Error occurred while opening the database
  console.log("Cant't open DB", event)
};

function odmiana(liczba, pojedyncza, mnoga, mnoga_dopelniacz) {
	liczba = Math.abs(liczba); // tylko jeśli mogą zdarzyć się liczby ujemne
	if (liczba === 1) return pojedyncza;
	var reszta10 = liczba % 10;
	var reszta100 = liczba % 100;
	if (reszta10 > 4 || reszta10 < 2 || (reszta100 < 15 && reszta100 > 11))
		return mnoga_dopelniacz;
	return mnoga;
}

function renderChanges() {
  elem = $("#changes-table-body")
  elem.empty()


  Object.keys(changes).forEach((ch) => {
    ref_data = source_data.find((el) => el.id == changes[ch].id);
    var styles = [];
    var items = [];

    console.log(ref_data, changes[ch]);

    Object.keys(changes[ch]).forEach((k) => {
      if (!ref_data) {
        styles.push("change-new")
        items.push(changes[ch][k])
      } else if (ref_data[k] != changes[ch][k]) {
        styles.push("change-alter")
        items.push('<span class="text-decoration-line-through fw-light">' + ref_data[k] + "</span><br>" + changes[ch][k])
      } else {
        styles.push("")
        items.push(changes[ch][k])
      }
    });

    console.log(styles);

    var row = '<tr scope="row">';
    row += '  <td scope="col" class="' + styles[0] + '">' + items[0] + '</td>'
    row += '  <td scope="col" class="' + styles[1] + '">' + items[1] + '</td>'
    row += '  <td scope="col" class="' + styles[2] + '">' + items[2] + '</td>'
    row += '  <td scope="col" class="' + styles[3] + '">' + items[3] + '</td>'
    row += '  <td scope="col" class="' + styles[4] + '">' + items[4] + '</td>'
    row += '  <td scope="col" class="' + styles[5] + '">' + items[5] + '</td>'
    row += '</tr>'
    elem.append(row)
  });
}

$("#download-changes").click(function() {
  if ($("#download-changes").hasClass("disabled")) {

  } else {
    renderChanges();
    $("#changesModal").modal("show")

    // let transaction = db.transaction("points", "readonly");
    // db_points = transaction.objectStore("points");
    // let request = db_points.getAll();
    // request.onerror = (event) => {
    //   console.err("error fetching data");
    // };
    // request.onsuccess = (event) => {
    //   csvString = Papa.unparse(request.result, {delimiter: ";"});
    //   download("changes.csv", csvString);
    // }
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
    source_data = Papa.parse(csvString, {header: true, dynamicTyping: true}).data;


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

  changes[elem.id] = elem;

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
  $("#poi_lat").val(latlng.lat.toFixed(5));
  $("#poi_lon").val(latlng.lng.toFixed(5));
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
  attributionControl: false,
  urlHash: true,
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
  handleTrackPoint(e.latlng.lat, e.latlng.lng);
});

/* Attribution control */
// function updateAttribution(e) {
//   $.each(map._layers, function(index, layer) {
//     if (layer.getAttribution) {
//       $("#attribution").html((layer.getAttribution()));
//     }
//   });
// }
// map.on("layeradd", updateAttribution);
// map.on("layerremove", updateAttribution);

var tilePoints = [];
var tileLayer = null;

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames

function LatLng2tile(latLng) {
  var n = Math.pow(2, 14);
  var lon_deg = latLng.lng;
  var lat_rad = latLng.lat * Math.PI / 180;
 
  var xtile = n * ((lon_deg + 180) / 360);
  var ytile = n * (1 - (Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI)) / 2;

  return [xtile, ytile];
}

function tile2LatLng(xtile, ytile) {
  var n = 2 ^ 14
  var lon_deg = xtile / n * 360.0 - 180.0
  var lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * ytile / n)))
  var lat_deg = lat_rad * 180.0 / Math.PI

  return [lat_deg, lon_deg];
}

var COORDINATES_PRECISION = 7

function lon2squadrat(lon, z) {
  return (Math.floor((lon + 180) / 360 * Math.pow(2, z)));
}
function lat2squadrat(lat, z) {
  return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z)));
}
function squadrat2lon(x, z) {
  return +(x / Math.pow(2, z) * 360 - 180).toFixed(COORDINATES_PRECISION);
}
function squadrat2lat(y, z) {
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
  return +(180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))).toFixed(COORDINATES_PRECISION);
}

function redrawTiles() {
  return;
  if (tileLayer) tileLayer.removeFrom(map);
  tileLayer = null;
  tilePoints = [];

  if (map.getZoom() < 10) return;

  var bounds = map.getBounds();
  console.log(bounds);

  // [min_x, min_y] = LatLng2tile(bounds._southWest);
  // [max_x, max_y] = LatLng2tile(bounds._northEast);

  min_x = lon2squadrat(bounds._southWest.lng, 14) - 1;
  max_x = lon2squadrat(bounds._northEast.lng, 14) + 1;
  min_y = lat2squadrat(bounds._northEast.lat, 14) - 1;
  max_y = lat2squadrat(bounds._southWest.lat, 14) + 1;

  console.log(min_x, max_x, min_y, max_y);

  for (var i = min_x; i <= max_x; i += 1) {
    var lat1 = squadrat2lat(min_y, 14);
    var lat2 = squadrat2lat(max_y, 14);
    var lon1 = squadrat2lon(i, 14);
    tilePoints.push([
      [lat1, lon1],
      [lat2, lon1]
    ]);
  }

  for (var i = min_y; i <= max_y; i += 1) {
    var lon1 = squadrat2lon(min_x, 14);
    var lon2 = squadrat2lon(max_x, 14);
    var lat1 = squadrat2lat(i, 14);
    tilePoints.push([
      [lat1, lon1],
      [lat1, lon2]
    ]);
  }

  tileLayer = L.polyline(tilePoints, {weight: 0.8});
  tileLayer.addTo(map);
}

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
      if (icon_size == "") {
        if (layer.dragging) layer.dragging.enable();
      } else {
        if (layer.dragging) layer.dragging.disable();
      }
  });

  redrawTiles();
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

var geo_color_id = 0;
var geo_colors = ['#800000', '#008000', '#000080']

fileInput.addEventListener('change', function (event) {
  var file = fileInput.files[0],
      fr = new FileReader();
  fileInput.value = ''; // Clear the input.
  extension = file.name.split('.')[1]
  if (extension === 'geojson') {
      fr.onload = function () {
        geojson = JSON.parse(fr.result);
        geoj = {type: "FeatureCollection", features: [geojson.features[0]]};
        var layer = L.geoJson(geoj, {weight: 0.8, interactive: false, fillColor: geo_colors[geo_color_id]}).addTo(map);
        geo_color_id += 1;
        var coords = geojson.features[0].geometry.coordinates[0][0];
        console.log(coords)
        var marker = L.marker(new L.LatLng(coords[1], coords[0]), {
            title: 'My Bike Route',
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
  div.innerHTML = "<span class='d-none d-sm-block'><a href='https://leafletjs.com' title='A JavaScript library for interactive maps'>Leaflet</a> | <a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Źródła map</a></span>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomleft"
}).addTo(map);





  // marker = new L.marker([lat, lon], {icon: icons["sakralne"]["inne"]["s_white"]});
  // marker.addTo(map);
  // cur = [lat, lon];
  // if (track_points.length > 0) {
  //   prev = track_points.slice(-1)[0];

  //   url = "https://brouter.de/brouter?alternativeidx=0&format=geojson&";
  //   url += "lonlats=";
  //   url += prev[1];
  //   url += "%2C";
  //   url += prev[0];
  //   url += "%7C"
  //   url += cur[1];
  //   url += "%2C"
  //   url += cur[0];
  //   url += "&profile=trekking"

  //   fetch(url, { 
  //     method: 'GET'
  //   })
  //   .then(function(response) { 
  //     if (response.status == 200) {
  //       console.log("OK");
  //       return response.json(); 
  //     } else {
  //       console.log("400");
  //       return {type: "FeatureCollection", features: []};
  //     }
  //   })
  //   .then(function(json) {
  //     L.geoJson(json).addTo(map);
  //   })
  //   .catch(function() {
  //     console.log("EEE")
  //   });
  // }
  // track_points.push(cur);


// --------------------------------------------------------------
// Leaflet Routing Machine
// --------------------------------------------------------------

/*

router = {
  route(wpts, callback, context, options) {
    console.log("route", wpts, options, context);
    ret = {
      name: "test",
      summary: {
        totalTime: 0,
        totalDistance: 0
      },
      inputWaypoints: [],
      coordinates: [],
      waypoints: [],
      instructions: []
    }

    wptArr = [];
    wpts.forEach((wpt) => {
      wp = {
        latLng: L.latLng(wpt.latLng.lat, wpt.latLng.lng),
        name: "",
        options: ""
      };
      wptArr.push(wp);
    });

    ret.inputWaypoints = wptArr;
    ret.wayPoints = wptArr;
    wpts.forEach((wpt) => ret.coordinates.push(wpt.latLng));
    stat = {
      status: 0,
      message: "OK"
    }
    console.log(ret);

    if (wpts.length > 1) {
      // cur = wpts[1].latLng;
      // prev = wpts[0].latLng;

      url = "https://brouter.de/brouter?alternativeidx=0&format=geojson&";
      url += "lonlats=";
      wpts.forEach((wpt) => {
        url += wpt.latLng.lng;
        url += "%2C";
        url += wpt.latLng.lat;
        url += "%7C"
      })
      url += "&profile=trekking"

      fetch(url, { 
        method: 'GET'
      })
      .then(function(response) { 
        if (response.status == 200) {
          console.log("OK");
          return response.json(); 
        } else {
          console.log("400");
          return {type: "FeatureCollection", features: []};
        }
      })
      .then(function(json) {
        // L.geoJson(json).addTo(map);
        if (json.features.length == 0) { 
          callback.call(context || callback, null, [ret])   
        } else {
          console.log(json.features);
          ret.coordinates = [];
          json.features[0].geometry.coordinates.forEach((c) => {
            ret.coordinates.push(L.latLng(c[1], c[0]));
          });
          
          callback.call(context || callback, null, [ret])   
        }
      })
      .catch(function() {
        console.log("EEE")
      });
    }
  },
}

ctrl  = L.Routing.control({
  // waypoints: [
  //     L.latLng(57.74, 11.94),
  //     L.latLng(57.6792, 11.949)
  // ],
  // routeWhileDragging: true,
  position: "topleft",
  router: router
});
ctrl.addTo(map);

function handleTrackPoint(lat, lon) {
  wpts = ctrl.getWaypoints();
  if (!wpts[0].latLng) {
    console.log("1")
    wpts[0] = L.latLng(lat, lon);
    ctrl.setWaypoints(wpts);
  }
  else if (!wpts[1].latLng) {
    console.log("2")
    wpts[1] = L.latLng(lat, lon);
    ctrl.setWaypoints(wpts);
  } else {
    console.log("3")
    ctrl.spliceWaypoints(wpts.length, 0, L.latLng(lat, lon));
  }
}

*/



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
        layer: cartoLight,
        active: true
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
      },
      {
        active: false,
        name: "Waymarker trails",
        layer: WaymarkedTrails_hiking
      }
    ]
  },
]


html = '<ol class="list-group list-group-flush">';
$.each(baseLayers[0].layers, function(id, layer) {
  console.log(layer);
  if (layer.layer.getAttribution) {
    html += '<li class="list-group-item d-flex justify-content-between align-items-start"><div class="ms-2 me-auto">';
    html += '<div class="fw-bold">' + layer.name + '</div>';
    html += layer.layer.getAttribution();
    html += '</div>';
  }
});
$.each(overLayers[0].layers, function(id, layer) {
  console.log(layer);
  if (layer.layer.getAttribution) {
    html += '<li class="list-group-item d-flex justify-content-between align-items-start"><div class="ms-2 me-auto">';
    html += '<div class="fw-bold">' + layer.name + '</div>';
    html += layer.layer.getAttribution();
    html += '</div>';
  }
});
html += '</ol>';
$("#attribution").html(html);



for (cat in layer_groups) {
  lg = layer_groups[cat];
  group_def = {group: cat, layers: []}
  for (subcat in lg) {
    layer = lg[subcat];
    group_def.layers.push({active: false, name: subcat, layer: layer, icon: "<img src='assets/icons/symbol/"+icons[cat][subcat]["name"]+".png' class='panel_icon'>"});
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

  // tracksList = new List("tracks", {valueNames: ["track-name"]});
  // tracksList.sort("track-name", {order:"asc"});
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



var all_tracks = [];


var track_points = [],
  track_layer = L.layerGroup().addTo(map),
  track_nodes = [],
  track_segments = [];

class trackSegment {
  constructor(n1, n2, segment) {
    this.n1 = n1;
    this.n2 = n2;
    this.segment = segment;
    this.coords = [];
  }
}

class trackNode {
  constructor(s1, s2, marker) {
    this.s1 = s1;
    this.s2 = s2;
    this.marker = marker;
  }
}

class trackInfo {
  constructor() {
    this.name = "Nowa trasa";
    this.first_node = null;
    this.last_node = null;
    this.wpts = [];
    this.id = -1;
    this.length = 0;
    this.layer = L.layerGroup([]);
    this.visible = true;
    this.enabled = true;
  }

  serialize = function() {
    var ret = {
      id: this.id,
      name: this.name,
      segments: [],
      nodes: [],
      wpts: [],
      length: this.length,
      visible: this.visible,
      enabled: this.enabled,
    }

    var n = this.first_node;

    if (!n) return ret;
    ret.nodes.push(n.marker.getLatLng());
    while(n.s2) {
      ret.segments.push(n.s2.json);
      n = n.s2.n2;
      ret.nodes.push(n.marker.getLatLng());
    }

    for (var wpt of this.wpts) {
      ret.wpts.push(wpt);
    }

    return ret;
  }
}

var active_track = null;

function loadTrack(track) {
  if (!track.enabled) return;

  var ti = new trackInfo();
  ti.id = track.id;
  ti.name = track.name;
  ti.length = track.length;
  ti.visible = track.visible;
  ti.enabled = track.enabled;

  if (track.nodes.length > 0) {
    addTrackNode(ti, track.nodes[0].lat, track.nodes[0].lng);
  }

  for (var i = 1; i < track.nodes.length; i += 1) {
    addTrackNode(ti, track.nodes[i].lat, track.nodes[i].lng, track.segments[i-1]);
  }

  all_tracks.push(ti);
  if (ti.visible) ti.layer.addTo(map);

  addTrackItem(ti);

  
  for (var wpt of track.wpts) {
    addTrackWaypoint(ti, wpt, false)
  }

  updateTrackInfo(ti, false);
}

function loadTracks() {
  let transaction = db.transaction("tracks", "readwrite");
  let db_tracks = transaction.objectStore("tracks");

  let getRequest = db_tracks.getAll();

  getRequest.onsuccess = function(event) {
    // console.log("TRASY W BAZIE:", event.target.result)
    for (var track of event.target.result) {
      console.log(track);
      loadTrack(track);
    }
  }
}

$("#btn-new-track").on("click", (e) => {
  addNewTrack();
});

function saveTrack(track) {
  console.log("Saving track", track)
  let transaction = db.transaction("tracks", "readwrite");
  let db_tracks = transaction.objectStore("tracks");
  let addRequest = db_tracks.put(track.serialize(), track.id);

  addRequest.onsuccess = function(event) {
    console.log("Track ", event.target.result, " saved");
  }
}

function showHideTrack(track_id) {
  var track = all_tracks.find((el) => el.id == track_id);
  if (!track) return;
  if (track.visible) {
    track.visible = false;
    track.layer.removeFrom(map);
    saveTrack(track);
    // $("track-info-" + track_id).hide();
    $("#track-eye-" + track_id).removeClass('fa-eye')
    $("#track-eye-" + track_id).addClass('fa-eye-slash')
  } else {
    track.visible = true;
    track.layer.addTo(map);
    saveTrack(track);
    $("#track-eye-" + track_id).addClass('fa-eye')
    $("#track-eye-" + track_id).removeClass('fa-eye-slash')
  }
}

function getTrackRow(track_info) {
  
  let tmp = track_info.wpts.length;
  tmp += " " + odmiana(tmp, "punkt", "punkty", "punktów")

  return  `<div class="track-row px-1 border mx-0" id="track-info-${track_info.id}" lat="0" lng="0">` + 
          ` <div class="row align-items-center mx-0 px-0">` + 
          `   <div class="col-2 text-center py-1">` + 
          `     <button type="button" id="showhide-${track_info.id}" class="btn btn-light py-0" onclick="showHideTrack(${track_info.id})">` + 
          `       <i id="track-eye-${track_info.id}" class="fa fa-regular fa-eye"></i>`+
          `     </button>` + 
          `   </div>` + 
          `   <div class="col track-name">` + 
          `     <div class="track-title" id="track-name-${track_info.id}">${track_info.name}</div>` +
          `     <div class="track-summary" id="track-summary-${track_info.id}">` + 
          `       <span id="track-length-${track_info.id}">${track_info.length.toFixed(2)}</span> km., ` + 
          `       <span id="track-points-${track_info.id}">${tmp}</span>` +
          `     </div>` +
          `   </div>` + 
          ` </div>` +           
          ` <div class="btn-group float-end" role="group" aria-label="Opcje zapisu ścieżki">` + 
          `   <button type="button" id="btn-trackbook-${track_info.id}" class="btn btn-sm btn-light py-0 float-end">` + 
          `     <i class="fa fa-table-list"></i>` + 
          `   </button>` + 
          `   <button type="button" id="btn-trackgpx-${track_info.id}"	class="btn btn-sm btn-light py-0 float-end" onclick="handleDownloadGpx(${track_info.id})">` + 
          `     <i class="fa fa-download"></i>` + 
          `   </button>` + 
          `   <button type="button" id="btn-trackdel-${track_info.id}" class="btn btn-sm btn-light py-0 float-end me-2" onclick="removeTrack(${track_info.id})">` + 
          `     <i class="fa-regular fa-trash-can"></i>` + 
          `   </button>` + 
          ` </div>` + 
          `` + 
          ` <div id="track-pois-${track_info.id}">` + 
          `` + 
          ` </div>`
          // ` <div class="track-overlay">asd</div>`
}

function getTrackPointRow(point) {

  return  `  <div class="row align-items-center my-1 mx-0" style="font-size: 80%">`+
          `    <div class="col-2 mb-1 text-end">${point.distance}</div>`+
          `    <div class="col-1 px-0 py-0 text-center">`+
          `      <img style="width: 20px; height: 20px;" src="assets/icons/symbol/${point.icon}.png">`+
          `    </div>`+
          `    <div class="col pl-2 track-point-name">${point.name}</div>`+
          `    <div class="col-1 text-end">`+
          `      X`+
          `    </div>`+
          `  </div>`
}

    














function addTrackItem(track_info) {
  var track_id = track_info.id;
  var lat = 0;
  var lng = 0;

  // let tmp = track_info.wpts.length;
  // tmp + " " + odmiana(tmp, "punkt", "punkty", "punktów")


  // elem_str  = '<tr class="track-row" id="track-info-' + track_id + '" lat="' + lat + '" lng="' + lng + '"><td style="vertical-align: top;">';
  // elem_str += '<button type="button" id="showhide-' + track_id + '" class="btn btn-light py-0" onclick="showHideTrack(' + track_id + ')"><i id="track-eye-' + track_id + '" class="fa fa-regular ' + (track_info.visible?'fa-eye':'fa-eye-slash') + '"></button></td>'
  // elem_str += '<td class="track-name" style="width: 100%;">';
  // elem_str += '<div class="track-title" id="track-name-' + track_id + '">'  + track_info.name + '</div>';
  // elem_str += '<div id="track-summary-' + track_id + '">';
  // elem_str += '<span id="track-length-' + track_id + '">' + track_info.length.toFixed(2) + '</span> km., ';
  // elem_str += '<span id="track-points-' + track_id + '">' + tmp + " " + odmiana(tmp, "punkt", "punkty", "punktów") + '</span>';
  // elem_str += '</div>';
  // elem_str += '<div id="track-pois-' + track_id + '"></div>';
  // elem_str += '</td><td style="vertical-align: top;">';
  // elem_str += '<div class="btn-group float-end" role="group" aria-label="Opcje zapisu ścieżki">';
  // elem_str += '<button type="button" id="btn-trackbook-' + track_id + '" class="btn btn-sm btn-light py-0 float-end"><i class="fa fa-table-list"></i></button>';
  // elem_str += '<button type="button" id="btn-trackgpx-' + track_id + '" class="btn btn-sm btn-light py-0 float-end" onclick="handleDownloadGpx(' + track_id + ')"><i class="fa fa-download"></i></button>';
  // elem_str += '<button type="button" id="btn-trackdel-' + track_id + '" class="btn btn-sm btn-light py-0 float-end me-2" onclick="removeTrack(' + track_id + ')"><i class="fa-regular fa-trash-can"></i></button>';
  // elem_str += '</div>';
  // elem_str += '</td></tr>';
  // $("#tracks-list tbody").append(elem_str);

  // tracksList = new List("tracks", {valueNames: ["track-name"]});
  // tracksList.sort("track-name", {order:"asc"});

  let itemRow = getTrackRow(track_info);
  $("#tracks-list").append(itemRow);
}

function addNewTrack() {
  var new_track = new trackInfo();

  let transaction = db.transaction("tracks", "readwrite");
  let db_tracks = transaction.objectStore("tracks");
  let addRequest = db_tracks.put(new_track.serialize());

  addRequest.onsuccess = function(event) {
    track_id = event.target.result;
    new_track.id = track_id;

    saveTrack(new_track);

    all_tracks.push(new_track);
    active_track = new_track;
    lat = 0;
    lng = 0;
    track_name = "Nowa trasa";
    // console.log($("#tracks-list tbody"))
    addTrackItem(new_track);
    new_track.layer.addTo(map);
  };
}


function handleMarkerDragEnd(e) {
  track_node = e.target.trackNode;

  console.log(track_node);

  if (track_node.s1) {
    track_node.s1.segment.removeFrom(map);
    calculateRoute(track_node.s1.track, track_node.s1.n1, track_node);
  }
  if (track_node.s2) {
    track_node.s2.segment.removeFrom(map);
    calculateRoute(track_node.s2.track, track_node, track_node.s2.n2);
  }
}

function calculateRoute(track, n1, n2) {


  // if (track_points.length > 0) {
  prev = n1.marker.getLatLng();
  cur = n2.marker.getLatLng();

  url = "https://brouter.de/brouter?alternativeidx=0&format=geojson&";
  url += "lonlats=";
  url += prev.lng;
  url += "%2C";
  url += prev.lat;
  url += "%7C"
  url += cur.lng;
  url += "%2C"
  url += cur.lat;
  url += "&profile=trekking"

  console.log(url);

  fetch(url, { 
    method: 'GET'
  })
  .then(function(response) { 
    if (response.status == 200) {
      console.log("OK");
      return response.json(); 
    } else {
      console.log("400");
      return {type: "FeatureCollection", features: []};
    }
  })
  .then(function(json) {
    addTrackSegment(track, n1, n2, json)
    
    updateTrackInfo(track);
  })
  .catch(function(e) {
    console.log("EEE", e)
  });
}

function addTrackSegment(track, n1, n2, json) {
  var new_segment = new trackSegment(n1, n2, null);
  new_segment.track = track;
  n2.s1 = new_segment;
  n1.s2 = new_segment;

  segment = L.geoJson(json);
  new_segment.segment = segment;
  console.log(json.features[0].properties["track-length"] * 0.001)
  new_segment.length_km = json.features[0].properties["track-length"] * 0.001;
  segment.trackSegment = new_segment;
  console.log(json)
  new_segment.coords = json.features[0].geometry.coordinates;
  new_segment.json = json
  // track_segments.push(segment);
  // console.log(segment);
  segment.on("click", handleSegmentClick);
  segment.addTo(track.layer);
}

function handleSegmentClick(e) {
  latLng = e.latlng;
  new_marker = new L.marker([latLng.lat, latLng.lng], {icon: icons["sakralne"]["inne"]["s_white"], draggable: true});
  new_marker.on("dragend", handleMarkerDragEnd);
  
  selected_segment = e.target;
  var track = selected_segment.trackSegment.track;
  new_marker.addTo(track.layer);
  x_prev_node = selected_segment.trackSegment.n1;
  x_next_node = selected_segment.trackSegment.n2;
  x_new_node = new trackNode(null, null, new_marker);
  new_marker.trackNode = x_new_node;
  selected_segment.removeFrom(map);

  calculateRoute(track, x_prev_node, x_new_node);
  calculateRoute(track, x_new_node, x_next_node);


  L.DomEvent.stopPropagation(e);
}

function removeTrack(track_id) {
  track = all_tracks.find((el) => el.id == track_id);
  if (!track) return;

  if (track.visible) track.layer.removeFrom(map);

  var elem = $("#track-info-" + track_id);
  elem.remove();
  
  var track_index = all_tracks.indexOf(track);
  if (track_index > -1) {
    all_tracks.splice(track_index, 1);
    console.log(track_index, all_tracks)
  }

  track.enabled = false;
  
  saveTrack(track)
}

function addTrackNode(track, lat, lon, segment = null) {
  marker = new L.marker([lat, lon], {icon: icons["sakralne"]["inne"]["s_white"], draggable: true});
  marker.on("dragend", handleMarkerDragEnd);
  marker.addTo(track.layer);
  var cur = [lat, lon];

  if (!track.first_node) {
    track.first_node = new trackNode(null, null, marker);
    marker.trackNode = track.first_node;
    return;
  }
  
  var prev_node = track.last_node ? track.last_node : track.first_node;
  

  var new_node = new trackNode(null, null, marker);
  new_node.track = track;
  track.last_node = new_node;
  marker.trackNode = new_node;


  if (!segment) {
    console.log("Calculating new route")
    calculateRoute(track, prev_node, track.last_node);
  } else {
    addTrackSegment(track, prev_node, track.last_node, segment)
  }
}

function handleTrackPoint(lat, lon) {
  if (!active_track) return;

  addTrackNode(active_track, lat, lon);
}

function addTrackWaypoint(track, elem, update = true) {
  track.wpts.push(elem);

  let cat = elem.cat;
  let subcat = elem.subcat;
  let icon_name = icons[cat][subcat]["name"];

  // var html_elem = '<div class="my-1"><div style="float: left; display: inline-block", class="mx-1"><img style="width: 20px; height: 20px;" src="assets/icons/symbol/' + icon_name + '.png"></div>';
  // html_elem += '<span class="ml-2">' + elem.name + '</span></div>';

  let html_elem = getTrackPointRow({name: elem.name, icon: icon_name, distance: 0});

  $("#track-pois-" + track.id).append(html_elem);

  if (update) updateTrackInfo(track);
}

function updateTrackInfo(track, save_changes = true) {
  let tmp = track.wpts.length;
  $("#track-points-" + track.id).text(tmp + " " + odmiana(tmp, "punkt", "punkty", "punktów"));

  let total = 0;
  let n = track.first_node;

  while(n.s2) {
    console.log(n.s2.length_km);
    total += n.s2.length_km;
    n = n.s2.n2;
  }
  track.length = total;
  $("#track-length-" + track.id).text(total.toFixed(2));

  if (save_changes) saveTrack(track);
}

function getClosestTrackPoint(coords, wpt) {
  console.log(wpt);
  lat = wpt.lat;
  lon = wpt.lon;
  min_dist = 10000;
  min_pt = [lat, lon, 0];
  coords.forEach((c) => {
    la = c[1];
    lo = c[0];
    di = Math.abs(la-lat) + Math.abs(lo-lon);
    if (di < min_dist) {
      min_dist = di;
      min_pt = c;
    }
  })

  return min_pt;
}

function handleDownloadGpx(e) {
  console.log(e);
  track = all_tracks.find((elem) => elem.id == e);
  if (track) download("trasa.gpx", generateGpx(track));
}

function generateGpx(track) {
  var coords = []
  n = track.first_node;
  while(n) {
    if (n.s2) {
      coords.push(...n.s2.coords);
      n = n.s2.n2;
    } else {
      break
    }
  }

  console.log(coords);

  geojson = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "creator": "BRouter-1.7.0",
          "name": "brouter_trekking_0",
          // "track-length": "6373",
          // "filtered ascend": "21",
          // "plain-ascend": "5",
          // "total-time": "1156",
          // "total-energy": "115600",
          // "cost": "10809",
        },
        "geometry": {
          "type": "LineString",
          "coordinates": coords
        }
      }
    ]
  }

  track.wpts.forEach((wpt) => {
    pt = getClosestTrackPoint(coords, wpt);
    console.log(pt);
    feat = {
      "type": "Feature",
      "properties": {
        "name": wpt.name
      },
      "geometry": {
        "type": "Point",
        "coordinates": pt
      }
    };
    geojson.features.push(feat);
  });

  return togpx(geojson);
}