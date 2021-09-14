function clearForm(){
    alert("cleared (TODO)");
}
function submitForm(){
    get_api_info("/apis/tomorrow/test", "timelines");
}


// var path = "/apis/tomorrow/test";
function get_api_info(path, method){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function (){
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
        }
    }
    req_type = "POST";
    req.open(req_type, path, true);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    req_data = {
        /*NOTE: This is the method to call and is treated special*/
        "method": method, 
        "location": "-73.98529171943665,40.75872069597532",
        "fields": "temperature",
        "timesteps": "1h",
        "units": "metric"
    };
    req.send(JSON.stringify(req_data));
}