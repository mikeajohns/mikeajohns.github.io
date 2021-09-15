function onLoad() {
    jQuery(".default-hide").hide()
    
    /*TODO remove debug code*/
    jQuery("#street").val("1600 Ampitheatre Parkway")
    jQuery("#city").val("Mountain View")
    jQuery("#state").val("CA")
}

function onCheckAutoDetect() {
    if (jQuery("#auto-detect").prop('checked') ) {
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
            call_tomorrow_weather(lng, lat)
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
            var lng = 40.75872069597532;
            var lat = -73.98529171943665;
            call_tomorrow_weather(lng, lat)
        });
    }    
}

function call_tomorrow_weather(lng, lat) {
    var req_data = {
        /*NOTE: This is the method to call and is treated special*/
        "location": lng + "," + lat,
        "fields": ["temperature", "pressure", "windSpeed", "visibility", "cloudCover", "uvIndex"],
        "timesteps": "1h",
        "units": "metric"
    };
    get_api_info("tomorrow", "timelines", req_data, function(rspObj){
        //alert(rspObj.responseText)
        jQuery("#humitity-value").text(123)
        jQuery("#pressure-value").text(321)
        jQuery("#wind-speed-value").text(321)
        jQuery("#visibility-value").text(321)
        jQuery("#cloud-cover-value").text(321)
        jQuery("#uv-level-value").text(333)
        
        jQuery("#current-weather").show()
    });
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