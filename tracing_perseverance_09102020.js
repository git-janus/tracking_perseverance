
var d = new Date();
var timeNow = (d.getMinutes() * 60000) + (d.getSeconds() * 1000);
var timeNowSeconds = (d.getMinutes() * 60) + (d.getSeconds());
var timeLeft = 3600000 - timeNow;
var timeLeftSeconds = 3600 - timeNowSeconds;
var dateNowMonth = d.getMonth() + 1;
var dateNowDay = d.getDate();
var dateNowYear = d.getFullYear();
var dateNowString = dateNowMonth + '/' + dateNowDay + '/' + dateNowYear;
var format = 'mi';
var mi = 0.621371;
var nowEarth;
var fromEarth;
var ss = SpreadsheetApp.getActive();
var ws = ss.getSheetByName('Dashboard');
var wsLog = ss.getSheetByName('Log');
var rng_earth_miles = ws.getRange('B2');
var rng_earth_km = ws.getRange('C2');
var rng_mars_miles = ws.getRange('B3');
var rng_mars_km = ws.getRange('C3');

function tp_nasa_mars2020_web_scrape() {
  var url = 'https://mars.nasa.gov/mars2020/rss/api/?feed=cruise&category=mars2020&feedtype=json&' + d.getUTCHours();
  var response = UrlFetchApp.fetch(url);
  var json = response.getContentText();
  var data = JSON.parse(json);
  var sp1 = data.spacecraftdata[0];
  var sp2 = data.spacecraftdata[1];
  var distance = {EARTHMILES:calculateEarthMiles(sp1.TRAVELFROM, sp2.TRAVELFROM),
                  EARTHKM:calculateEarthKm(sp1.TRAVELFROM, sp2.TRAVELFROM),
                  MARSMILES:calculateMarsMiles(sp1.TRAVELTO, sp2.TRAVELTO),
                  MARSKM:calculateMarsKm(sp1.TRAVELTO, sp2.TRAVELTO)};
  rng_earth_miles.setValue(distance.EARTHMILES);
  rng_earth_km.setValue(distance.EARTHKM);
  rng_mars_miles.setValue(distance.MARSMILES);
  rng_mars_km.setValue(distance.MARSKM); 
  wsLog.appendRow([dateNowString,distance.EARTHMILES,distance.EARTHKM,distance.MARSMILES,distance.MARSKM]);
}

function calculateEarthMiles(dist1, dist2){ // calculate the miles and calculate the speed
  // calculate the speed
  // dist2 - dist1 / 1
  // convert KM to miles
  var distanceStart = dist1 * mi;
  var distanceEnd = dist2 * mi;
  var distanceDifference = distanceEnd - distanceStart; // This is also the mph
  var milesPerSecond = distanceDifference/3600;
  var distanceTraveled = distanceStart + (timeNowSeconds * milesPerSecond);
  return Math.floor(distanceTraveled).toString();
  //countTravel( distanceTraveled, distanceTraveled, 'milesEarth', distanceEnd );
}
		
function calculateEarthKm(dist1, dist2){
  var distanceStart = dist1;
  var distanceEnd = dist2;
  var distanceDifference = distanceEnd - distanceStart; // This is also the mph
  var kmPerSecond = distanceDifference/3600;
  var distanceTraveled = parseInt(distanceStart) + (timeNowSeconds * kmPerSecond);
  return Math.floor(distanceTraveled).toString();
}

function calculateMarsMiles(dist1, dist2){
  var distanceStart = dist1 * mi;
  var distanceEnd = dist2 * mi;
  var distanceDifference = Math.abs(distanceEnd - distanceStart); // This is also the mph
  var milesPerSecond = distanceDifference/3600;
  var distanceTraveled = distanceStart - (timeNowSeconds * milesPerSecond);
  return Math.floor(distanceTraveled).toString();
}

function calculateMarsKm(dist1, dist2){
  var distanceStart = dist1;
  var distanceEnd = dist2;
  var distanceDifference = distanceEnd - distanceStart; // This is also the mph
  var distanceDifference = Math.abs(distanceEnd - distanceStart); // This is also the mph
  var kmPerSecond = distanceDifference/3600;
  var distanceTraveled = distanceStart - (timeNowSeconds * kmPerSecond);
  return Math.floor(distanceTraveled).toString();
}

