var api_url = 'https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json'
var ss = SpreadsheetApp.openById('XXXXXXXXX-YOUR-TARGET-GOOGLE-SHEET-ID-HERE-XXXXXXXXX');
var ws_msl = ss.getSheetByName('Weather_Data_MSL_Curiosity');//YOU CAN HAVE YOUR CUSTOMER TAB/SHEET NAME HERE FOR CURIOSITY REMS DATA
var ws_percy = ss.getSheetByName('Weather_Data_Perseverance');//YOU CAN HAVE YOUR CUSTOMER TAB/SHEET NAME HERE FOR PERSEVERANCE MEDA
var api_data = [];

/**
 * FETCH THE ALL WEATHER DATA FROM API URL
 */
function fetch_weather_data(api_url){
  var response = UrlFetchApp.fetch(api_url);
  var json = response.getContentText();
  var data = JSON.parse(json);
  var weather_data = data.soles;
  return weather_data;
}

/**
 * THIS FUNCTION IS INTENDED TO FETCH A LINE OF SOL WEATHER DATA AND WRITE/APPEND IT TO SPREADSHEET
 * THIS WILL TAKE LONG IN THIS APPROACH. IF YOU'RE STARTING FROM SCRATCH, RECOMMEND TO CREATE A SINGLE
 * ARRAY THEN WRITE THEM AT ONCE TO SPREADSHEET WITH .GETRANGE().SETVALUES(ARRAY) METHOD.
 */
function bulk_fetch_weather_data(){
  var weather_data = fetch_weather_data(api_url);
  var ws_db = ws_msl.getDataRange().getValues();
  var last_sol_ws_db_recorded = ws_db[ws_db.length - 1][2];
  weather_data.map(function(el){
    if(el.sol > last_sol_ws_db_recorded){
      var row = [
        el.id,
        el.terrestrial_date,
        el.sol,
        el.ls,
        el.season,
        el.min_temp,
        el.max_temp,
        el.pressure,
        el.pressure_string,
        el.abs_humidity,
        el.wind_speed,
        el.wind_direction,
        el.atmo_opacity,
        el.sunrise,
        el.sunset,
        el.local_uv_irradiance_index,
        el.min_gts_temp,
        el.max_gts_temp
      ]
      ws_msl.appendRow(row);
    }
  });
}
//
/**
 * ROVER ENVIROMENTAL MONITORING STATION (REMS)
 * CUSTOM API. TO PROCESS FURTHER AND SOMEHOW RECREATE THE WEB STRUCTURE AS SHOWN ON THIS PAGE - https://mars.nasa.gov/msl/spacecraft/instruments/rems/
 * CHECK THE SCRIPT USED ON THE SAME WEBSITE/PAGE = https://mars.nasa.gov/js/general/weather/msl-weather.js
 * CREATED BY TRACKING PERSEVERANCE 
 * WEBSITE: www.trackingperseverance.com
 * FACEBOOK: www.facebook.com/trackingperseverance
 * CONTACT: info@trackingperseverance.com
 */
function doGet(e){
  var manifest = e.parameter.manifest;
  var rover = e.parameter.rover;
  var sol = e.parameter.sol;
  var min_sol = e.parameter.min_sol;
  var max_sol = e.parameter.max_sol;
  if(manifest === 'yes'){
    data = fetch_manifest();
  }else{
    if(rover === 'Curiosity'){
      data = fetch_rover_data(rover,sol,min_sol,max_sol);
    }
  }
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * MANIFEST - GENERAL INFORMATION ABOUT ROVER REMS DATA CALL.
 * RETURNS ROVERS INCLUDED IN THE API AND ITS CORRESPONDING PARAMETERS NEEDED/AVAILABLE FOR QUERY
 * RETURNS MAX SOL OR LATEST SOL CAPTURED
 * RETURNS SUPPORTED CALLS:
 *  MANIFEST                : https://script.google.com/macros/s/AKfycbwV7SeFLW_LM0NDfZNVHyDYss8Cq7RSGMMnicX3Jo1aGsasaxxbkWzqiR3DAMyHwE8N/exec?manifest=yes
 *  ALL ROVER REMS          : https://script.google.com/macros/s/AKfycbwV7SeFLW_LM0NDfZNVHyDYss8Cq7RSGMMnicX3Jo1aGsasaxxbkWzqiR3DAMyHwE8N/exec?rover=Curiosity
 *  ROVER REMS BY SOL       : https://script.google.com/macros/s/AKfycbwV7SeFLW_LM0NDfZNVHyDYss8Cq7RSGMMnicX3Jo1aGsasaxxbkWzqiR3DAMyHwE8N/exec?rover=Curiosity&sol=9
 *  ROVER REMS BY SOL RANGE : https://script.google.com/macros/s/AKfycbwV7SeFLW_LM0NDfZNVHyDYss8Cq7RSGMMnicX3Jo1aGsasaxxbkWzqiR3DAMyHwE8N/exec?rover=Curiosity&min_sol=1&max_sol=15
 */
function fetch_manifest(){
  var db_msl = ws_msl.getDataRange().getValues();
  var max_sol_msl = db_msl[db_msl.length - 1][2];
  return {'rovers':{'Curiosity':{'max_sol':max_sol_msl,'PARAMETERS':['rover','sol']},
          'Perseverance':{'max_sol':null,'PARAMETERS':['rover','sol']}},
          'sample_calls':{'manifest':'https://script.google.com/macros/s/AKfycbwV7SeFLW_LM0NDfZNVHyDYss8Cq7RSGMMnicX3Jo1aGsasaxxbkWzqiR3DAMyHwE8N/exec?manifest=yes',
                          'rover_all_rems':'https://script.google.com/macros/s/AKfycbwV7SeFLW_LM0NDfZNVHyDYss8Cq7RSGMMnicX3Jo1aGsasaxxbkWzqiR3DAMyHwE8N/exec?rover=Curiosity',
                          'rover_rems_by_sol':'https://script.google.com/macros/s/AKfycbwV7SeFLW_LM0NDfZNVHyDYss8Cq7RSGMMnicX3Jo1aGsasaxxbkWzqiR3DAMyHwE8N/exec?rover=Curiosity&sol=9',
                          'rover_rems_by_sol_range':'https://script.google.com/macros/s/AKfycbwV7SeFLW_LM0NDfZNVHyDYss8Cq7RSGMMnicX3Jo1aGsasaxxbkWzqiR3DAMyHwE8N/exec?rover=Curiosity&min_sol=1&max_sol=15'}};
}

/**
 * THIS IS A FUNCTION TO EXTRACT FROM DB THE CORRESPONDING ROVER REMS DATA
 * CALL BY ROVER NAME
 * CALL BY ROVER NAME AND SOL
 * CALL BY SOL RANGE (MIN_SOL AND MAX_SOL)
 */
function fetch_rover_data(rover,sol,min_sol,max_sol){
  var db;
  if(rover === 'Curiosity'){
    db = ws_msl.getDataRange().getValues();//GET DATA
  }
  db.shift();//REMOVES HEADER
  return fetch_weather_api_data(db,sol,min_sol,max_sol);//RETURNS DATA
}

/**
 * THIS WILL FETCH THE CORRESPONDING REMS DATA
 * EACH ROW IS A SOL WEATHER INFORMATION
 */
function fetch_weather_api_data(ws_db,sol,min_sol,max_sol){
  //FETCH BY SOL
  if(sol != null){
    ws_db = ws_db.filter(function(el){
      return Number(el[2]) === Number(sol);
    });
  }
  //FETCH BY SOL RANGE
  if(min_sol != null && max_sol != null){
    ws_db = ws_db.filter(function(el){
      return (Number(el[2]) >= Number(min_sol) && Number(el[2]) <= Number(max_sol));
    });
  }
  //ASSEMBLE JSON STRING BY EACH ROW OF REMS WEATHER DATA
  ws_db.map(function(el){
    var row = {
      'id':el[0],
      'terrestrial_date':el[1],
      'sol':el[2],
      'ls':el[3],
      'season':el[4],
      'min_temp':el[5],
      'max_temp':el[6],
      'pressure':el[7],
      'pressure_string':el[8],
      'abs_humidity':el[9],
      'wind_speed':el[10],
      'wind_direction':el[11],
      'atmo_opacity':el[12],
      'sunrise':el[13],
      'sunset':el[14],
      'local_uv_irradiance_index':el[15],
      'min_gts_temp':el[16],
      'max_gts_temp':el[17]
    };
    api_data.push(row);//COMBINES ALL JSON STRING REMS WEATHER DATA
  });
  //API CALL JSON RETURN
  return {'desclaimer':'I do not own the data. You are using the data being pulled from my personal script that logged daily weater data from REMS as published on this url(\'https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json\'. There could be mismatch from actual data and delay expected as my custom script is dependent on the original api from NASA. Use at your discretion. As a hobbyist this was for education purpose. Thank you!info@trackingperseverance.com)','data':api_data};
}