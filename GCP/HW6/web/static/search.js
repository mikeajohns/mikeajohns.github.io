function clearForm(){
    alert("cleared (TODO)");
}
function submitForm(){
    var req = new XMLHttpRequest();
    //var url = window.location.hostname + 
    var path = "/apis/tomorrow/test";
    req.onreadystatechange = function (){
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            alert(this.responseText);
        }
    }
    req_type = "POST"
    req.open(req_type, path, true);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    req.send(JSON.stringify({"from":"js"}));
}