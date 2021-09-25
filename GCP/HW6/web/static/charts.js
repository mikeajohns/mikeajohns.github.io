debug_timestamps = null;
debug_days = null;
function loadDaysWeatherChart() {
    // weather for today
    twentyFourHrIdx = 1 // TODO fix the query to only ask what we need
    var days = tomorrowWeatherStore.data.timelines[twentyFourHrIdx].intervals;
    daysChartData = []
        
    //Confirmed from video walkthrough that these are not based on which day you click in the forecast
    //TODO remove var daysCount = 0
    for (day of days) {
        timestamp = (new Date(day.startTime)).getTime()
        debug_days = day
        daysChartData.push([timestamp, day.values.temperatureMin, day.values.temperatureMax])
        /*TODO remove
        daysCount += 1
        if (daysCount >= 15){
            break;
        }
        */
    }
    debug_timestamps = daysChartData
    const chart = Highcharts.chart('days-chart', {
        chart: {
            type: 'arearange'
        },
        title: {
            text: 'Temperature Ranges (Min, Max)'
        },
        xAxis: {
            labels: {
                enabled: true
            },
            title: {
                enabled: false
            },
            type: 'datetime',
            crosshair: true,
        },
        yAxis: {
            labels: {
                enabled: true
            },
            title: {
                enabled: false
            }
        },
        tooltip: {
            xDateFormat: '%A, %b, %e',
            valueSuffix: '\u00B0F'
        },
        legend: {
            enabled: false
        },
        series: [{
            name: "Temperatures",
            data: daysChartData,
            color: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [
                    [0, '#f7af2f'], // start
                    [0.5, '#d5d0c0'], // middle
                    [1, '#e0eaf8'] // end 
                ]
            },
            marker: {
                enabled: true,
                fillColor: "#87AFEB"
            },

        }]
    });
}


hours_data = null;
debugHoursChart = null;
function loadHoursWeatherChart() {
    // set beaufort floor for MPH
    // Taken from: https://jsfiddle.net/BlackLabel/brnLxeto/
    // And verified values against to: https://www.weather.gov/jetstream/beaufort_max
    Highcharts.seriesTypes.windbarb.prototype.beaufortFloor = [
            0, 0.6710820000000001, 3.5791040000000005, 7.605596, 12.303170000000001, 
            17.89552, 24.158952000000003, 31.093466000000003, 38.475368, 
            46.528352000000005, 54.80503, 63.752790000000005, 73.14793800000001];

    
    // weather for today
    hourIdx = 0 // TODO fix the query to only ask what we need
    var hours = tomorrowWeatherStore.data.timelines[hourIdx].intervals;
    hours_data = hours
    hoursTemps = []
    hoursPressures = []
    hoursHumidities = []
    hoursWinds = []
    WIND_RESOLUTION_FACTOR = 2
    HOURS_IN_5_DAYS = 5 * 24
    //NOTE: following same guidance here as from the 15/16 day forecast and not limiting the data we receive from tomorrow.io
    
    //Confirmed from video walkthrough that these are not based on which day you click in the forecast
    for (hour of hours) {
        timestamp = (new Date(hour.startTime)).getTime()
        hoursTemps.push([timestamp, hour.values.temperature])
        hoursPressures.push([timestamp, hour.values.pressureSeaLevel])
        hoursHumidities.push([timestamp, hour.values.humidity])
        if(hoursHumidities.length % WIND_RESOLUTION_FACTOR == 1) {
            hoursWinds.push({
                x: timestamp,
                value: hour.values.windSpeed,
                direction: hour.values.windDirection
            })
        }
        //TODO remove, don't limit//if (hoursTemps.length > HOURS_IN_5_DAYS) break;
    }
    
    WIND_BARB_LENGTH = 10
    WIND_BARB_X_OFFSET = WIND_BARB_LENGTH/2
    WIND_BARB_X_OFFSET_2 = 0
    WIND_BARB_BOX_HEIGHT = 20
    const chart = Highcharts.chart('hours-chart', {
        tooltip: {
            shared: true,
        },
        title: {
            text: 'Hourly Forecast (For Next 5 Days)'
        },
        xAxis: [{
            type: 'datetime',
            labels: {
                enabled: true,
                format: '{value:%H}'
            },
            title: {
                enabled: false
            },
            //tickInterval: 36e5, //1 hr
            tickInterval: 4 * 36e5, // four hours
            minorTickInterval: 36e5, // one hour
            offset: WIND_BARB_BOX_HEIGHT,
            gridLineColor: 'rgba(128, 128, 128, 0.1)',
            gridLineWidth: 1,
            endOnTick: false,
            crosshair: true,
            startOnTick: false,
            minPadding: 0.005,
        },{ // Top X axis
            linkedTo: 0,
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            labels: {
                format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
                align: 'left',
                x: 3,
                y: -5
            },
            opposite: true,
            tickLength: 20,
            gridLineWidth: 1
        }],
        yAxis: [
        { //===temperatures axis
            labels: {
                format: '{value}°',
            },
            gridLineColor: 'rgba(128, 128, 128, 0.1)',
            gridLineWidth: 1,
            title: {
                enabled: false
            }
        }, 
        { //===humidities axis
            labels: {
                enabled: false
            },
            title: {
                enabled: false
            },
        }, 
        { //===pressure axis
            labels: {
                enabled: true,
                style: {
                    color: '#F7B53D',
                },
                offset: 0,
                allowOverlap: false, /*this should be the default*/
                textAlign: 'left',
                align: 'left',
                padding: '5px',
                x: 3,
            },
            allowDecimals: false,
            title: {
                text: 'inHg',
                offset: 0,
                align: 'high',
                rotation: 0,
                style: {
                    fontSize: '10px',
                    color: '#F7B53D',
                },
                textAlign: 'left',	
                x: 3,
                padding: '5px',
            },
            opposite: true,
            endOnTick: false,
        }],
        plotOptions: {
            column: {
                pointPlacement: 'on' //per video, this looks right
            },
            series: {
                pointPlacement: 'on',
            },
        },
        legend: {
            enabled: false
        },
        //======================SERIES======================================
        series: [{
            name: "Temperature",
            data: hoursTemps,
            type: "spline",
            tooltip: {
                valueSuffix: '\u00B0F',
                valueDecimals: 0,
            },
            color: '#FF3333',
            yAxis: 0,
            marker: {
                enabled: false
            },
            zIndex: 2
        }, {
            name: "Humidity",
            data: hoursHumidities,
            type: "column",
            dataLabels: {
                enabled: true,
                formatter: function () {
                    return Math.round(this.y);
                }
            },
            groupPadding: 0,
            pointPadding: 0,
            tooltip: {
                valueSuffix: ' %',
                valueDecimals: 0,
            },
            yAxis: 1,
            marker: {
                enabled: false
            },
        },  {
            name: "Air Pressure",
            data: hoursPressures,
            type: "spline",
            tooltip: {
                valueSuffix: ' inHg',
                valueDecimals: 0,
            },
            color: '#F7B53D',
            yAxis: 2,
            marker: {
                enabled: false
            },
            dashStyle: 'shortdot',
        }, {
            name: "Wind",
            data: hoursWinds,
            type: 'windbarb',
            id: 'windbarbs',
            vectorLength: WIND_BARB_LENGTH,
            yOffset: -WIND_BARB_BOX_HEIGHT/2,
            xOffset: WIND_BARB_X_OFFSET,
            tooltip: {
                valueSuffix: ' mph'
            },
            lineWidth: 1,
        }]
    });
    
    debugHoursChart = chart
    
    drawBlocksForWindArrows(chart)
    showWeatherCharts();//TODO remove debug
    /*TODO remove debug
    jQuery("#days-chart").hide()//TODO remove debug
    */
}


/**
 * Draw blocks around wind arrows, below the plot area
 * Taken from Meteogram here: https://www.highcharts.com/demo/combo-meteogram#https://www.yr.no/place/United_Kingdom/England/London/forecast_hour_by_hour
 * TODO proper credit or replace/remove
 */
drawBlocksForWindArrows = function (chart) {
    var xAxis = chart.xAxis[0],
        x,
        pos,
        max,
        isLong,
        isLast,
        i;

    for (pos = xAxis.min, max = xAxis.max, i = 0; pos <= max + 36e5; pos += 36e5, i += 1) {

        // Get the X position
        isLast = pos === max + 36e5;
        x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);

        // Draw the vertical dividers and ticks
        if (this.resolution > 36e5) {
            isLong = pos % this.resolution === 0;
        } else {
            isLong = i % 2 === 0;
        }
        chart.renderer.path(['M', x, chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
            'L', x, chart.plotTop + chart.plotHeight + WIND_BARB_BOX_HEIGHT + 2, 'Z'])
            .attr({
                stroke: chart.options.chart.plotBorderColor,
                'stroke-width': 1
            })
            .add();
    }
    
    // Center items in block
    chart.get('windbarbs').markerGroup.attr({
        translateX: chart.get('windbarbs').markerGroup.translateX + WIND_BARB_X_OFFSET_2
    });
};

//down button
function showWeatherCharts(){
    jQuery("#weather-charts-card").show()
    jQuery("#weather-charts").show()
    jQuery("#up-button").show()
    jQuery("#down-button").hide()
}

//up button
function hideWeatherCharts(){
    jQuery("#weather-charts-card").hide()
    jQuery("#up-button").hide()
    jQuery("#down-button").show()
}