tomorrowWeatherStore = {} //global to store and retrieve weather info

function setShowHideDefaults() {
    jQuery(".default-hide").hide()
    jQuery(".default-show").show()
}

function onLoad() {
    setShowHideDefaults()
    
    jQuery("#state").append(jQuery("<option>", {
            value: "",
            text: "Select your state"
    }));
    for (const [stateShort, stateLong] of Object.entries(states)) {
        jQuery("#state").append(jQuery("<option>", {
            value: stateShort,
            text: stateLong
        }));
    }

    var form  = document.getElementById('search-form');
    form.addEventListener('submit', (event) => {
        // handle the form data
        event.preventDefault();
        submitForm()
    });
}

function clearInputFields() {
    
    clearAddrFields()
    jQuery("#auto-detect-cb").prop('checked', false);
}

function clearAddrFields() {
    jQuery("#street").val("")
    jQuery("#city").val("")
    jQuery("#state").val("")
}

function onCheckboxChange() {
    if(jQuery("#auto-detect-cb").prop('checked')) {
        clearAddrFields()
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
    setShowHideDefaults()
    clearInputFields()
    onCheckboxChange()
}


debug_json = null;
function submitForm(){   
    jQuery("#no-records-card").hide() 
    if (jQuery("#auto-detect-cb").prop('checked') ) {
        // do auto-detect
        call_api( "https://ipinfo.io/json?token=6292e80abfdebd", function(rspObj){
            //use info and get lat/lng and submit
            var json = JSON.parse(rspObj.responseText)
            debug_json = json;
            var loc = json["loc"]
            var lat = loc.split(",")[0]
            var lng = loc.split(",")[1]
            call_tomorrow_weather(lat, lng, json["city"] + ", " + json["region"] + ", " + json["country"])
        });
    }
    else {

        // do geocode
        var addr = jQuery("#street").val()
        var city = jQuery("#city").val()
        var state = jQuery("#state").val()
        
        call_api("https://maps.googleapis.com/maps/api/geocode/json?" + 
                encodeURI("address=" + addr + ", " + city + ", " + state) + "&" + 
                encodeURI("key=" + "AIzaSyAoLc9k_wqEQNd9R-a9Skhqtl92gTHbfTc"), function(rspObj){
            var json = JSON.parse(rspObj.responseText)
            if(json["status"] == "OVER_QUERY_LIMIT" || json["status"] == "OVER_DAILY_LIMIT" || json["status"] == "ZERO_RESULTS"){
                jQuery("#no-records-card").show() 
                return null;
            }
            var resultsIdx = 0 //NOTE: hardcoded to just the first result
            var lat = json.results[resultsIdx].geometry.location.lat
            var lng = json.results[resultsIdx].geometry.location.lng
            call_tomorrow_weather(lat, lng, json.results[resultsIdx]["formatted_address"])
        });
    }    
}

function getTimestepIdxByName(timelines, timestepName){
    for (const [idx, timeline] of timelines.entries()) {
        if (timeline.timestep == timestepName){
            return idx
        }
    }
    console.log("Error finding " + timestepName)
    return null; //error condition
}

function call_tomorrow_weather(lat, lng, loc) {
    var req_data = {
        "location": "" + lat + "," + lng + "",
        "fields": [
            "temperature", "temperatureMin", "temperatureMax",
            "humidity", "pressureSeaLevel", "windSpeed", "windDirection", 
            "visibility", "cloudCover", "uvIndex", 
            "weatherCode", "precipitationProbability", "precipitationType", 
            "sunriseTime", "sunsetTime"],
        "timesteps": ["current", "1h", "1d"],
        "timezone": "America/Los_Angeles",
        "units": "imperial"
    };
    get_api_info("tomorrow", "timelines", req_data, function(rspObj){
        tomorrowWeatherStore = JSON.parse(rspObj.responseText);
        
        // weather for today
        currentTimeIdx = getTimestepIdxByName(tomorrowWeatherStore.data.timelines, "current")
        startTimeIdx = 0
        
        var values = tomorrowWeatherStore["data"]["timelines"][currentTimeIdx]["intervals"][startTimeIdx]["values"]
        
        jQuery("#location").text(loc)
        
        jQuery("#humidity-value").text(values["humidity"] + "%")
        jQuery("#pressure-value").text(values["pressureSeaLevel"] + "inHg")
        jQuery("#wind-speed-value").text(values["windSpeed"] + "mph")
        jQuery("#visibility-value").text(values["visibility"] + "mi")
        jQuery("#cloud-cover-value").text(values["cloudCover"] + "%")
        jQuery("#uv-level-value").text(values["uvIndex"])
        
        jQuery("#current-temp").text(Math.round(values["temperature"]*10)/10 + "\u00B0");
        
        jQuery("#humidity-icon").attr("src", get_current_weather_icon("humidity"))
        jQuery("#pressure-icon").attr("src", get_current_weather_icon("pressureSeaLevel"))
        jQuery("#wind-speed-icon").attr("src", get_current_weather_icon("windSpeed"))
        jQuery("#visibility-icon").attr("src", get_current_weather_icon("visibility"))
        jQuery("#cloud-cover-icon").attr("src", get_current_weather_icon("cloudCover"))
        jQuery("#uv-level-icon").attr("src", get_current_weather_icon("uvIndex"))
        
        jQuery("#weather-code-icon").attr("src", get_weather_code_icon(values["weatherCode"]))
        jQuery("#weather-code-text").text(get_weather_code_text(values["weatherCode"]))
        
        jQuery("#x-day-forecast").empty();
        
        var twentyFourHrIdx = getTimestepIdxByName(tomorrowWeatherStore.data.timelines, "1d")
        var forecastData = tomorrowWeatherStore["data"]["timelines"][twentyFourHrIdx]["intervals"]
        var headerRow = '<tr class="forecast-table-header"><th>Date</th><th>Status</th><th>Temp High</th><th>Temp Low</th><th>Wind Speed</th></tr>'
        jQuery("#x-day-forecast").append(headerRow);
        for (var timeIdx in forecastData) {
            var timeData = forecastData[timeIdx]
            var date = timeData["startTime"]
            var timestamp = new Date(timeData.startTime)
            var date = getPrettyDate(timestamp)

            var weatherCode = timeData["values"]["weatherCode"]
            var weatherStatusIconPath = get_weather_code_icon(weatherCode);
            var weatherStatusText = get_weather_code_text(weatherCode);
            var highTemp = timeData["values"]["temperatureMax"]
            var lowTemp = timeData["values"]["temperatureMin"]
            var windSpeed = timeData["values"]["windSpeed"]
            
            
            var newRow = "<tr class='forecast-table-row' data-timeidx='" + timeIdx + "'>";
            newRow += "<td>" + date + "</td>";
            newRow += "<td><span><img class='forecast-weather-status-icon' src='" + weatherStatusIconPath + "'></span><span>" + weatherStatusText + "</span></td>";
            newRow += "<td>" + highTemp + "</td>";
            newRow += "<td>" + lowTemp + "</td>";
            newRow += "<td>" + windSpeed + "</td>";
            newRow += "</tr>";
            
            jQuery("#x-day-forecast").append(newRow);
        }
        
        jQuery(".forecast-table-row").click(showForecastDetail);
    
        
        jQuery("#current-weather").show()
        jQuery("#forecast").show()        
    });
}

function getPrettyDate(d){
    var localeUS = 'en-us'
    return d.toLocaleDateString(localeUS, { weekday: 'long' }) + ", " + 
            ("0"+d.getDate()).slice(-2) + " " + 
            d.toLocaleDateString(localeUS, {month: 'short'}) + " " + 
            d.getFullYear()
}

test = ""
function showForecastDetail(elem){
    startTimeIdx = jQuery(elem.currentTarget).attr("data-timeidx")
    
    jQuery("#current-weather").hide()
    jQuery("#forecast").hide()
    jQuery("#daily-weather-details").show()
    jQuery("#weather-charts-card").hide() //don't show this until the button is clicked
    jQuery("#weather-charts").show()
    jQuery("#up-button").hide()
    
    // weather for today
    var twentyFourHrIdx = getTimestepIdxByName(tomorrowWeatherStore.data.timelines, "1d")
    var values = tomorrowWeatherStore["data"]["timelines"][twentyFourHrIdx]["intervals"][startTimeIdx]["values"]
    
    var timestamp = new Date(tomorrowWeatherStore.data.timelines[twentyFourHrIdx].intervals[startTimeIdx].startTime)
    var date = getPrettyDate(timestamp)

    var weatherCode = values.weatherCode;
    var highTemp = values.temperatureMax;
    var lowTemp = values.temperatureMin;
    
    jQuery("#daily-day").text(date);
    jQuery("#daily-weather-code-text").text(get_weather_code_text(weatherCode));
    jQuery("#daily-weather-code-icon").attr("src", get_weather_code_icon(weatherCode));
    jQuery("#daily-hi-low-temp").text(highTemp + "°F/" + lowTemp + "°F");
    
    //clear the table before adding new rows
    jQuery("#daily-weather-details-table").empty()
    
    jQuery("#daily-weather-details-table").append(
            "<tr class='daily-details-row'><td class='daily-details-label'>Precipitation:</td><td class='daily-details-value'>" + getPrecipitationTypeName(values.precipitationType) + "</td></tr>");
            
    jQuery("#daily-weather-details-table").append(
            "<tr class='daily-details-row'><td class='daily-details-label'>Chance of Rain:</td><td class='daily-details-value'>" + values.precipitationProbability + "%</td></tr>");
            
    jQuery("#daily-weather-details-table").append(
            "<tr class='daily-details-row'><td class='daily-details-label'>Wind Speed:</td><td class='daily-details-value'>" + values.windSpeed + " mph</td></tr>");
            
    jQuery("#daily-weather-details-table").append(
            "<tr class='daily-details-row'><td class='daily-details-label'>Humidity:</td><td class='daily-details-value'>" + values.humidity + "%</td></tr>");
            
    jQuery("#daily-weather-details-table").append(
            "<tr class='daily-details-row'><td class='daily-details-label'>Visibility:</td><td class='daily-details-value'>" + values.visibility + " mi</td></tr>");
                  
    var sunriseTime = new Date(values.sunriseTime)
    var HOURS_PER_MERIDIAN = 12;
    sunriseTime = roundToHours(sunriseTime) % HOURS_PER_MERIDIAN + getAMPM(sunriseTime)
    
    var sunsetTime = new Date(values.sunsetTime)
    sunsetTime = roundToHours(sunsetTime) % HOURS_PER_MERIDIAN + getAMPM(sunsetTime)
    
    jQuery("#daily-weather-details-table").append(
            "<tr class='daily-details-row'><td class='daily-details-label'>Sunrise/Sunset:</td><td class='daily-details-value'>" + sunriseTime + "/" + sunsetTime + "</td></tr>");
}


function roundToHours(timestamp) {
    var MINUTES_PER_HOUR = 60;
    return Math.round(timestamp.getHours() + timestamp.getMinutes()/MINUTES_PER_HOUR);
}

//Ref: https://docs.tomorrow.io/reference/data-layers-core
function getPrecipitationTypeName(typeCode){
    var lookupTable = [
        "N/A",
        "Rain",
        "Snow",
        "Freezing Rain",
        "Ice Pellets"
    ]
    
    return lookupTable[typeCode]
}

function getAMPM(d){
    if(!d.getHours())
    {
        return null
    }
    else if(d.getHours() >= 12){
        return "PM"
    }
    else {
        return "AM"
    }
}

iconPrefix = "web/images/";
weatherCodeLookup = {
    "0": ["N/A", ""],
    "1000": ["Clear", iconPrefix + "clear_day.svg"],
    "1001": ["Cloudy", iconPrefix + "cloudy.svg"],
    "1100": ["Mostly Clear", iconPrefix + "mostly_clear_day.svg"],
    "1101": ["Partly Cloudy", iconPrefix + "partly_cloudy_day.svg"],
    "1102": ["Mostly Cloudy", iconPrefix + "mostly_cloudy.svg"],
    "2000": ["Fog", iconPrefix + "fog.svg"],
    "2100": ["Light Fog", iconPrefix + "fog_light.svg"],
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
    try {
        return weatherCodeLookup[weatherCode][0]
    } catch (error) {
        return weatherCodeLookup["0"][0] //N/A
    }
}
function get_weather_code_icon(weatherCode){
    try {
        return weatherCodeLookup[weatherCode][1]
    } catch (error) {
        return weatherCodeLookup["0"][1] //N/A
    }
}


function call_api(url, callback) {
    const req = new XMLHttpRequest();
    req.open("GET", url);
    req.onreadystatechange = function (){
        if (this.readyState == 4) {
            if(this.status == 200) {
                callback(this)
            }
            else if (this.status == 429){
                jQuery("#no-records-card").show()
            }
        }
    }
    req.send();
}

// var url = "/apis/tomorrow/test";
/*
* callback(this)
* var data = JSON.parse(this.responseText);
*/
function get_api_info(api, method, req_data, callback){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function (){
        if (this.readyState == 4) {
            if(this.status == 200) {
                callback(this)
            }
            else if (this.status == 429){
                jQuery("#no-records-card").show()
            }
        }
    }
    
    url = "/apis/" + api + "?" + jQuery.param(req_data)
    req.open("GET", url , true);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    
    req_data.method = method;
    
    req.send();
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