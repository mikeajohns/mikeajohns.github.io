tomorrowWeatherStore = {} //global to store and retrieve weather info

function setShowHideDefaults() {
    jQuery(".default-hide").hide()
    jQuery(".default-show").show()
}

function onLoad() {
    setShowHideDefaults()
    onLocationTypeChange() //set default disabled text box
}

function resetSearchFields() {
    jQuery("#keyword").val("")
    jQuery("#category").val("All")
    jQuery("#distance").val("")
    jQuery("#distance-units").val("miles")
    jQuery("#current-location").prop('checked', true)
    jQuery("#other-location").val("")
    onLocationTypeChange()
}

function onLocationTypeChange(){
    jQuery("#other-location").prop('disabled', jQuery("#current-location").prop('checked'))
}
function clearSearch() {
    resetSearchFields()
    jQuery("#results").hide()
}
