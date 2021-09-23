tomorrowWeatherStore = {} //global to store and retrieve weather info

mjglob = null

function onLoad() {
    jQuery(".default-hide").hide()
    
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
    
    /*TODO remove debug code*/
    jQuery("#street").val("1600 Ampitheatre Parkway")
    jQuery("#city").val("Mountain View")
    jQuery("#state").val("CA")

    var form  = document.getElementById('search-form');
    form.addEventListener('submit', (event) => {
        // handle the form data
        event.preventDefault();
        submitForm()
    });
    /*
    */
}

function clearInputFields() {
    
    clearAddrFields()
    jQuery("#auto-detect").prop('checked', false);
}

function clearAddrFields() {
    jQuery("#street").val("")
    jQuery("#city").val("")
    jQuery("#state").val("")
}

function onCheckboxChange() {
    if(jQuery("#auto-detect").prop('checked')) {
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
    jQuery(".default-hide").hide()
    clearInputFields()
    onCheckboxChange()
}

debug_geocode = null //TODO remove
debug_ipinfo = null //TODO remove
function submitForm(){    
    if (jQuery("#auto-detect").prop('checked') ) {
        // do auto-detect
        get_api_info("ipinfo", "json", {}, function(rspObj){
            //use info and get lat/lng and submit
            var json = JSON.parse(rspObj.responseText)
            debug_ipinfo = json
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
        
        
        var req_data = {
            /*NOTE: This is the method to call and is treated special*/
            "address": addr + ", " + city + ", " + state,
        };
        get_api_info("geocode", "json", req_data, function(rspObj){
            var json = JSON.parse(rspObj.responseText)
            debug_geocode = json;
            //TODO remove debug (get these from geocode -> results -> 0 -> geometry -> location -> lat/long
            var lat = json.results[0].geometry.location.lat
            var lng = json.results[0].geometry.location.lng
            /*TODO remove
            var lng = -73.98529171943665;
            var lat = 40.75872069597532;
            */
            resultsIdx = 0 //TODO stop hardcoding
            call_tomorrow_weather(lat, lng, json["results"][resultsIdx]["formatted_address"])
        });
    }    
}

function call_tomorrow_weather(lat, lng, loc) {
    var req_data = {
        "location": "" + lat + "," + lng + "",
        "fields": [
            "temperature", "temperatureApparent", "temperatureMin", "temperatureMax", //TODO use temp apparent?
            "humidity", "pressureSeaLevel", "windSpeed", "windDirection", 
            "visibility", "cloudCover", "uvIndex", 
            "weatherCode", "precipitationProbability", "precipitationType", 
            "sunriseTime", "sunsetTime"/*, "moonPhase"*/],//TODO remove commented out
        "timesteps": ["1h", "1d"],
        "timezone": "America/Los_Angeles",
        "units": "imperial"
    };
    get_api_info("tomorrow", "timelines", req_data, function(rspObj){
        tomorrowWeatherStore = JSON.parse(rspObj.responseText);
        
        // weather for today
        twentyFourHrIdx = 1 // TODO fix the query to only ask what we need
        startTimeIdx = 0 //TODO either fix the query to only ask for what we need or make this smarter
        
        var values = tomorrowWeatherStore["data"]["timelines"][twentyFourHrIdx]["intervals"][startTimeIdx]["values"]
        
        jQuery("#location").text(loc)
        
        //TODO format the strings and add units
        jQuery("#humidity-value").text(values["humidity"] + "%")
        jQuery("#pressure-value").text(values["pressureSeaLevel"] + "inHg")
        jQuery("#wind-speed-value").text(values["windSpeed"] + "mph")
        jQuery("#visibility-value").text(values["visibility"] + "mi")
        jQuery("#cloud-cover-value").text(values["cloudCover"] + "%")
        jQuery("#uv-level-value").text(values["uvIndex"])
        
        jQuery("#current-temp").text(values["temperature"] + "\u00B0");
        
        jQuery("#humidity-icon").attr("src", get_current_weather_icon("humidity"))
        jQuery("#pressure-icon").attr("src", get_current_weather_icon("pressureSeaLevel"))
        jQuery("#wind-speed-icon").attr("src", get_current_weather_icon("windSpeed"))
        jQuery("#visibility-icon").attr("src", get_current_weather_icon("visibility"))
        jQuery("#cloud-cover-icon").attr("src", get_current_weather_icon("cloudCover"))
        jQuery("#uv-level-icon").attr("src", get_current_weather_icon("uvIndex"))
        
        jQuery("#weather-code-icon").attr("src", get_weather_code_icon(values["weatherCode"]))
        jQuery("#weather-code-text").text(get_weather_code_text(values["weatherCode"]))
        
        
        
        var twentyFourHrIdx = 1 //TODO stop hard coding
        var forecastData = tomorrowWeatherStore["data"]["timelines"][twentyFourHrIdx]["intervals"]
        var daysToForecast = 15
        
        /*TODO remove debug*/
        for (var timeIdx in forecastData) {
            
            if(timeIdx >= daysToForecast)
            {
                break;
            }
            
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
            newRow += "<td><img class='forecast-weather-status-icon' src='" + weatherStatusIconPath + "'>" + weatherStatusText + "</td>";
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
    return d.toLocaleDateString(localeUS, { weekday: 'short' }) + ", " + 
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
    
    // weather for today
    twentyFourHrIdx = 1 // TODO fix the query to only ask what we need
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
            "<tr class='daily-details-row'><td>Precipitation:</td><td>" + getPrecipitationTypeName(values.precipitationType) + "</td></tr>");
            
    jQuery("#daily-weather-details-table").append(
            "<tr class='daily-details-row'><td>Chance of Rain:</td><td>" + values.precipitationProbability + "%</td></tr>");
            
    jQuery("#daily-weather-details-table").append(
            "<tr class='daily-details-row'><td>Wind Speed:</td><td>" + values.windSpeed + " mph</td></tr>");
            
    jQuery("#daily-weather-details-table").append(
            "<tr class='daily-details-row'><td>Humidity:</td><td>" + values.humidity + "%</td></tr>");
            
    jQuery("#daily-weather-details-table").append(
            "<tr class='daily-details-row'><td>Visibility:</td><td>" + values.visibility + " mi</td></tr>");
                  
    var sunriseTime = new Date(values.sunriseTime)
    mjdate = sunriseTime
    sunriseTime = sunriseTime.getHours() % 12 + getAMPM(sunriseTime)
    var sunsetTime = new Date(values.sunsetTime)
    sunsetTime = sunsetTime.getHours() % 12 + getAMPM(sunsetTime)
    jQuery("#daily-weather-details-table").append(
            "<tr class='daily-details-row'><td>Sunrise/Sunset:</td><td>" + sunriseTime + "/" + sunsetTime + "</td></tr>");
    
    loadDaysWeatherChart()
    loadHoursWeatherChart()
}

mjdate = null

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
    mjdate = d
    console.log(d)
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

//TODO fix so that a failure doesn't just crash
function get_weather_code_text(weatherCode){
    return weatherCodeLookup[weatherCode][0]
}
function get_weather_code_icon(weatherCode){
    return weatherCodeLookup[weatherCode][1]
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
    req_type = "POST";//TODO must be a GET per https://piazza.com/class/ksgpd7vrj2x4d7?cid=126
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