/**
 * GLOBAL VARIABLES
 * INSERT NECESSARY API KEYS AND EMAIL ADDRESS
 */
var api_key = 'XXXXXXXXXX_API_KEY_XXXXXXXXXXX'; //<--- INSERT YOUR API KEY HERE
var api_base_url = 'https://api.nasa.gov/mars-photos/api/v1';
var email_address = 'NAME@EMAIL.COM'; //<---- INSERT THE EMAIL ADDRESS YOU NEED BE INCLUDED IN THE NOTIFICATION

/**
 *  THIS WILL EXTRACT THE NECESSARY MANIFEST FOR THE PERSEVERANCE ROVER
 *  WE NEED TO FETCH THIS FIRST FOR US TO GET THE LATEST SOL AVAILABLE IN 
 *  API IMAGE RESOURCES
 */
function fetch_manifest(api_base_url,rover_name,api_key){
  var url = api_base_url.concat('/manifests/', rover_name,'?api_key=',api_key);
  var response = UrlFetchApp.fetch(url);
  var json = response.getContentText();
  var data = JSON.parse(json);
  return data;
}

/**
 * THIS WILL CAPTURE THE IMAGE RESOURCES
 * PARAMETERS
 *  api_base_url
 *  rover_name = Perseverance
 *  api_key
 *  sol = the max sol capture in the fetch_manifest function
 */
function get_sol_photos(api_base_url,rover_name,api_key,sol){
  var url = api_base_url.concat('/rovers/', rover_name,'/photos?sol=',sol,'&api_key=',api_key);
  var response = UrlFetchApp.fetch(url);
  var json = response.getContentText();
  var data = JSON.parse(json);
  return data.photos;
}

/**
 * THIS WILL EXTRACT CAPTURE THE CURRENT SOL IMAGE RESOURCES
 */
function get_max_sol_photo(){
  var manifest = fetch_manifest(api_base_url,'perseverance',api_key);
  var max_sol = manifest.photo_manifest.max_sol;
  var photos = get_sol_photos(api_base_url,'perseverance',api_key,max_sol);
  return {SOL:max_sol,PHOTOS:photos};
}

/**
 * THIS WILL CREATE THE HTML TABLE WITH THE IMAGE RESOURCE
 * STRUCTURED ACCORDINGLY
 */
function html_table_photos(photos){
  var html;
  html = '<table style="font-family: arial, sans-serif;border-collapse: collapse;width: 70%;">';
  html += '<tr style="border: 1px solid #dddddd;text-align: left;padding: 8px;"><th style="border: 1px solid #dddddd;text-align: left;padding: 8px;">id</th style="border: 1px solid #dddddd;text-align: left;padding: 8px;"><th style="border: 1px solid #dddddd;text-align: left;padding: 8px;">camera</th><th style="border: 1px solid #dddddd;text-align: left;padding: 8px;">image</th></tr>';
  photos.map(function(row){
    // Logger.log(row.img_src);
    var image_row = ''.concat('<tr><td style="border: 1px solid #dddddd;text-align: left;padding: 8px;"><a href="',row.img_src,'">',row.id,'</a></td><td style="border: 1px solid #dddddd;text-align: left;padding: 8px;">',row.camera.name,'</td><td style="border: 1px solid #dddddd;text-align: left;padding: 8px;">','<a href="',row.img_src,'"><img src="',row.img_src,'" width="100"></a></td></tr>');
    //var image_row = ''.concat('<tr><td>',row.id,'</td><td>',row.camera.name,'</td><td>','<img src="cid:',row.img_src,' width="50"></td></tr>');
    html += image_row;
  })
  html += '</table>';
  return html;
}

/**
 * THIS WILL SEND EMAIL NOTIFICATION OF THE FETCH 
 * CURRENT SOL IMAGE RESOURCES.
 */
function email_photos(){
  var photos = get_max_sol_photo();
  var html = html_table_photos(photos.PHOTOS);
  MailApp.sendEmail(
    {
      to:email_address,
      subject:'NASA Mars 2020 Perseverance Rover On Mars photos | Sol '.concat(photos.SOL),
      htmlBody:html
    }
  );
}





