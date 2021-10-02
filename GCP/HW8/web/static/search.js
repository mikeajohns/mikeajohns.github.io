tomorrowWeatherStore = {} //global to store and retrieve weather info

function setShowHideDefaults() {
    jQuery(".default-hide").hide()
    jQuery(".default-show").show()
}

function onLoad() {
    setShowHideDefaults()
}

function resetSearchFields() {
    jQuery("#keyword").val("")
    jQuery("#category").val("All")
    jQuery("#distance").val("10")
    jQuery("#distance-units").val("miles")
    jQuery("#current-location").prop('checked', true)
}
