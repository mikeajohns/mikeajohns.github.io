function loadDaysWeatherChart() {
    // weather for today
    twentyFourHrIdx = 1 // TODO don't hard code
    var days = tomorrowWeatherStore.data.timelines[twentyFourHrIdx].intervals;
    daysChartData = []
        
    //Confirmed from video walkthrough that these are not based on which day you click in the forecast
    for (day of days) {
        timestamp = (new Date(day.startTime)).getTime()
        daysChartData.push([timestamp, day.values.temperatureMin, day.values.temperatureMax])
    }
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
function loadHoursWeatherChart() {
    // set beaufort floor for MPH
    // Taken from: https://jsfiddle.net/BlackLabel/brnLxeto/
    // And verified values against to: https://www.weather.gov/jetstream/beaufort_max
    Highcharts.seriesTypes.windbarb.prototype.beaufortFloor = [
            0, 0.6710820000000001, 3.5791040000000005, 7.605596, 12.303170000000001, 
            17.89552, 24.158952000000003, 31.093466000000003, 38.475368, 
            46.528352000000005, 54.80503, 63.752790000000005, 73.14793800000001];

    
    // weather for today
    hourIdx = 0 // TODO don't hard code
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
            type: 'datetime', //bottom ticks (hours)
            tickInterval: 4 * 36e5, // four hours
            minorTickInterval: 36e5, // one hour
            tickLength: 0,
            gridLineWidth: 1,
            gridLineColor: 'rgba(128, 128, 128, 0.1)',
            startOnTick: false,
            endOnTick: false,
            minPadding: 0,
            maxPadding: 0, //NOTE could add padding here to close off the wind barb box, but that wouldn't match the screenshots from the HW6 Description PDF
            offset: WIND_BARB_BOX_HEIGHT,
            showLastLabel: true,
            labels: {
                format: '{value:%H}'
            },
        },{ // Top X axis - dates
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
                pointPlacement: 'between' //per video, this looks right
            },
            series: {
                pointPlacement: 'between',
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
    
    drawBlocksForWindArrows(chart)
}


/**
 * Draw blocks around wind arrows, below the plot area
 * Taken from Meteogram here and modified: 
 *  https://www.highcharts.com/demo/combo-meteogram#https://www.yr.no/place/United_Kingdom/England/London/forecast_hour_by_hour
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
        
        if(isLong) {
            //draw box edges
            startY = chart.plotTop + chart.plotHeight
            endY = startY + WIND_BARB_BOX_HEIGHT            
        }
        else {
            //draw minor ticks
            WIND_BARB_MINOR_TICK_LENGTH = 4
            startY = chart.plotTop + chart.plotHeight + WIND_BARB_BOX_HEIGHT - WIND_BARB_MINOR_TICK_LENGTH / 2 //off by 1 because of other boundaries
            endY = chart.plotTop + chart.plotHeight + WIND_BARB_BOX_HEIGHT + WIND_BARB_MINOR_TICK_LENGTH / 2 //off by 1 because of other boundaries
        }
        chart.renderer.path(['M', x, startY, 'L', x, endY, 'Z'])
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
    loadDaysWeatherChart()
    loadHoursWeatherChart()
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