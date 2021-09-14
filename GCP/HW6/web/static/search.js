function onLoad() {
    jQuery(".default-hide").hide()
}

function clearForm(){
    jQuery(".default-hide").hide()
    alert("cleared (TODO - actually empty fields)");
}
function submitForm(){
    jQuery("#current-weather").show()
    call_tomorrow_test()
    call_geocode_test()
}

function call_tomorrow_test() {
    var req_data = {
        /*NOTE: This is the method to call and is treated special*/
        "location": "-73.98529171943665,40.75872069597532",
        "fields": "temperature",
        "timesteps": "1h",
        "units": "metric"
    };
    get_api_info("tomorrow", "timelines", req_data);
}
function call_geocode_test() {
    var req_data = {
        /*NOTE: This is the method to call and is treated special*/
        "address": "1600 Ampitheatre Parkway, Mountain View, CA",
    };
    get_api_info("geocode", "json", req_data);
}


// var url = "/apis/tomorrow/test";
function get_api_info(api, method, req_data){
    url = "/apis/" + api
    var req = new XMLHttpRequest();
    req.onreadystatechange = function (){
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            console.log(this.responseText)
        }
    }
    req_type = "POST";
    req.open(req_type, url , true);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    
    req_data.method = method;
    
    req.send(JSON.stringify(req_data));
}