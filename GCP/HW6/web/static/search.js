function onLoad() {
    jQuery(".default-hide").hide()
    
    for (const [stateShort, stateLong] of Object.entries(states)) {
        jQuery("#state").append(jQuery("<option>", {
            value: stateShort,
            text: stateShort
        }));
    }
    
    /*TODO remove debug code*/
    jQuery("#street").val("1600 Ampitheatre Parkway")
    jQuery("#city").val("Mountain View")
    jQuery("#state").val("CA")
}

function onCheckAutoDetect() {
    if (jQuery("#auto-detect").prop("checked") ) {
        //TODO do auto-detect
        clearInputFields()
        setInputFieldsNoEdit()
    }
}

function setInputFieldsNoEdit() {
    //TODO
}

function clearInputFields() {
    jQuery("#street").val("")
    jQuery("#city").val("")
    jQuery("#state").val("")
    jQuery("#auto-detect").prop('checked', false);
}

function onCheckboxChange() {
    if(jQuery("#auto-detect").prop('checked')) {
        jQuery("#street").val("").prop('disabled', true)
        jQuery("#city").val("").prop('disabled', true)
        jQuery("#state").val("").prop('disabled', true)
    }
    else {
        jQuery("#street").prop('disabled', false)
        jQuery("#city").prop('disabled', false)
        jQuery("#state").prop('disabled', false)
    }
}

function clearForm(){
    jQuery(".default-hide").hide()
    clearInputFields()
}
function submitForm(){
    if (jQuery("#auto-detect").prop('checked') ) {
        //TODO do auto-detect
        get_api_info("ipinfo", "json", {}, function(rspObj){
            //use info and get lat/lng and submit
            var json = JSON.parse(rspObj.responseText)
            var loc = json["loc"]
            var lng = loc.split(",")[1]
            var lat = loc.split(",")[0]
            call_tomorrow_weather(lng, lat, json["city"] + ", " + json["region"] + ", " + json["country"])
        });
    }
    else {
        //TODO geocode
        var addr = jQuery("#street").val()
        var city = jQuery("#city").val()
        var state = jQuery("#state").val()
        var req_data = {
            /*NOTE: This is the method to call and is treated special*/
            "address": addr + ", " + city + ", " + state,
        };
        get_api_info("geocode", "json", req_data, function(rspObj){
            var json = JSON.parse(rspObj.responseText)
            //TODO remove debug (get these from geocode -> results -> 0 -> geometry -> location -> lat/long
            var lng = -73.98529171943665;
            var lat = 40.75872069597532;
            resultsIdx = 0 //TODO stop hardcoding
            call_tomorrow_weather(lng, lat, json["results"][resultsIdx]["formatted_address"])
        });
    }    
}

function call_tomorrow_weather(lng, lat, loc) {
    var req_data = {
        "location": "" + lng + "," + lat + "",
        "fields": [
            "temperature", "temperatureApparent", "temperatureMin", "temperatureMax", 
            "humidity", "pressureSeaLevel", "windSpeed", "windDirection", 
            "visibility", "cloudCover", "uvIndex", 
            "weatherCode", "precipitationProbability", "precipitationType", 
            "sunriseTime", "sunsetTime", "moonPhase"],
        "timesteps": ["1h", "1d"], //TODO for current, only use 1d
        "timezone": "America/Los_Angeles",
        "units": "imperial"
    };
    get_api_info("tomorrow", "timelines", req_data, function(rspObj){
        var rspJSON = JSON.parse(rspObj.responseText)
        
        // weather for today
        twentyFourHrIdx = 1 // TODO fix the query to only ask what we need
        startTimeIdx = 0 //TODO either fix the query to only ask for what we need or make this smarter
        alert(rspJSON["data"]["timelines"][twentyFourHrIdx]["intervals"][startTimeIdx]["values"])
        var values = rspJSON["data"]["timelines"][twentyFourHrIdx]["intervals"][startTimeIdx]["values"]
        
        jQuery("#location").text(loc)
        
        //TODO format the strings and add units
        jQuery("#humidity-value").text(values["humidity"])
        jQuery("#pressure-value").text(values["pressureSeaLevel"])
        jQuery("#wind-speed-value").text(values["windSpeed"])
        jQuery("#visibility-value").text(values["visibility"])
        jQuery("#cloud-cover-value").text(values["cloudCover"])
        jQuery("#uv-level-value").text(values["uvIndex"])
        
        jQuery("#current-temp").text(values["temperature"])
        
        jQuery("#humidity-icon").attr("src", get_current_weather_icon("humidity"))
        jQuery("#pressure-icon").attr("src", get_current_weather_icon("pressureSeaLevel"))
        jQuery("#wind-speed-icon").attr("src", get_current_weather_icon("windSpeed"))
        jQuery("#visibility-icon").attr("src", get_current_weather_icon("visibility"))
        jQuery("#cloud-cover-icon").attr("src", get_current_weather_icon("cloudCover"))
        jQuery("#uv-level-icon").attr("src", get_current_weather_icon("uvIndex"))
        
        jQuery("#weather-code-icon").attr("src", get_weather_code_icon(values["weatherCode"]))
        
        
        jQuery("#current-weather").show()
    });
}

iconPrefix = "https://raw.githubusercontent.com/Tomorrow-IO-API/tomorrow-weather-codes/master/color/";
weatherCodeLookup = {
    //TODO remove "0": ["Unknown", "ico"],
    "1000": ["Clear", iconPrefix + "clear_day.svg"],
    //TODO night: https://github.com/Tomorrow-IO-API/tomorrow-weather-codes/blob/master/color/clear_night.svg
    "1001": ["Cloudy", iconPrefix + "cloudy.svg"],
    "1100": ["Mostly Clear", iconPrefix + "mostly_clear_day.svg"],
    //TODO night: https://github.com/Tomorrow-IO-API/tomorrow-weather-codes/blob/master/color/mostly_clear_night.svg
    "1101": ["Partly Cloudy", iconPrefix + "partly_cloudy_day.svg"],
    //TODO night: https://github.com/Tomorrow-IO-API/tomorrow-weather-codes/blob/master/color/partly_cloudy_night.svg
    "1102": ["Mostly Cloudy", iconPrefix + "mostly_cloudy.svg"],
    "2000": ["Fog", iconPrefix + "fog.svg"],
    "2100": ["Light Fog", iconPrefix + "fog_light.svg"],
    "3000": ["Light Wind", "ico"],
    "3001": ["Wind", "ico"],
    "3002": ["Strong Wind", "ico"],
    "4000": ["Drizzle", iconPrefix + "drizzle.svg"],
    "4001": ["Rain", iconPrefix + "rain.svg"],
    "4200": ["Light Rain", iconPrefix + "rain_light.svg"],
    "4201": ["Heavy Rain", iconPrefix + "rain_heavy.svg"],
    "5000": ["Snow", iconPrefix + "snow.svg"],
    "5001": ["Flurries", iconPrefix + "flurries.svg"],
    "5100": ["Light Snow", iconPrefix + "snow_light.svg"],
    "5101": ["Heavy Snow", iconPrefix + "snow_heavy.svg"],
    "6000": ["Freezing Drizzle", iconPrefix + "freezing_drizzle.svg"],
    "6001": ["Freezing Rain", iconPrefix + "freezing_rain.svg"],
    "6200": ["Light Freezing Rain", iconPrefix + "freezing_rain_light.svg"],
    "6201": ["Heavy Freezing Rain", iconPrefix + "freezing_rain_heavy.svg"],
    "7000": ["Ice Pellets", iconPrefix + "ice_pellets.svg"],
    "7101": ["Heavy Ice Pellets", iconPrefix + "ice_pellets_heavy.svg"],
    "7102": ["Light Ice Pellets", iconPrefix + "ice_pellets_light.svg"],
    "8000": ["Thunderstorm", iconPrefix + "tstorm.svg"]
}

function get_weather_code_text(weatherCode){
    return weatherCodeLookup[weatherCode][0]
}
function get_weather_code_icon(weatherCode){
    return weatherCodeLookup[weatherCode][1]
}

function todo_callback(rspObj) {
    console.log("rspObj length: " + rspObj.responseText.length)
}

// var url = "/apis/tomorrow/test";
/*
* callback(this)
* var data = JSON.parse(this.responseText);
*/
function get_api_info(api, method, req_data, callback){
    url = "/apis/" + api
    var req = new XMLHttpRequest();
    req.onreadystatechange = function (){
        if (this.readyState == 4 && this.status == 200) {
            callback(this)
        }
    }
    req_type = "POST";
    req.open(req_type, url , true);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    
    req_data.method = method;
    
    req.send(JSON.stringify(req_data));
}

function get_current_weather_icon(infoType){
    lookup = {
        "humidity":         "https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-16-512.png",
        "pressureSeaLevel": "https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-25-512.png",
        "windSpeed":        "https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-27-512.png",
        "visibility":       "https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-30-512.png",
        "cloudCover":       "https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-28-512.png",
        "uvIndex":          "https://cdn2.iconfinder.com/data/icons/weather-74/24/weather-24-512.png"
    };
    return lookup[infoType];
}