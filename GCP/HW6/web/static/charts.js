
hours_data = null;

function loadHoursWeatherChart() {
    // weather for today
    hourIdx = 0 // TODO fix the query to only ask what we need
    var hours = tomorrowWeatherStore.data.timelines[hourIdx].intervals;
    hours_data = hours
    hoursTemps = []
    hoursPressures = []
    hoursHumidities = []
    hoursWinds = []
    //for (const [stateShort, stateLong] of Object.entries(states)) {
    for (hour of hours) {
        timestamp = (new Date(hour.startTime)).getTime()
        hoursTemps.push([timestamp, hour.values.temperature])
        hoursPressures.push([timestamp, hour.values.pressure])
        hoursHumidities.push([timestamp, hour.values.humidity])
        hoursWinds.push([timestamp, hour.values.windSpeed])
        if (hoursTemps.length > 20) break; // TODO remove debug code
    }
    
    //TODOs to make chart done
    /*
    * Add the Meteogram.prototype.drawBlocksForWindArrows = function
    *     on ChartLoad->this.drawBlocksForWindArrows(chart);


    */
    const chart = Highcharts.chart('hours-chart', {
        tooltip: {
            shared: true,
           // xDateFormat: '%A, %b, %e',
        },
        title: {
            text: 'Hourly Forecast (For Next 5 Days)'
        },
        xAxis: {
            type: 'datetime',
            labels: {
                enabled: false
            },
            title: {
                enabled: false
            },
            tickInterval: 36e5, //1 hr
            
        },
        yAxis: [{ //===temperatures axis
            labels: {
                format: '{value}°',
            },
            gridLineColor: 'rgba(128, 128, 128, 0.1)',
            title: {
                enabled: false
            }
        }, { //===humidities axis
            labels: {
                enabled: false
            },
            title: {
                enabled: false
            }
        }, { //===pressure axis
            labels: {
                enabled: true
            },
            title: {
                enabled: false
            },
            opposite: true,
        }],
        legend: {
            enabled: false
        },
        //======================SERIES======================================
        series: [{
            name: "Temperature",
            data: hoursTemps,
            type: "spline",
            tooltip: {
                valueSuffix: '\u00B0F'
            },
            color: '#FF3333',
            yAxis: 0,
            zIndex: 2
        }, {
            name: "Air Pressure",
            data: hoursPressures,
            type: "spline",
            color: Highcharts.getOptions().colors[2],
            tooltip: {
                valueSuffix: ' inHg'
            },
            dashStyle: 'shortdot',
            yAxis: 2
        }, {
            name: "Humidity",
            data: hoursHumidities,
            type: "column",
            datalabels: {
                enabled: true,
                formatter: function () {
                    return this.y;
                }
            },
            tooltip: {
                valueSuffix: ' %'
            },
            yAxis: 1
        }, {
            name: "Wind",
            data: hoursWinds,
            /*
            type: 'windbarb',
            id: 'windbarbs',
            */
            yOffset: -15,
            tooltip: {
                valueSuffix: ' mph'
            }
        }]
    });
    
    showWeatherCharts();//TODO remove debug
    /*TODO remove debug
    jQuery("#days-chart").hide()//TODO remove debug
    */
}

debug_timestamps = null;
debug_days = null;
function loadDaysWeatherChart() {
    // weather for today
    twentyFourHrIdx = 1 // TODO fix the query to only ask what we need
    var days = tomorrowWeatherStore.data.timelines[twentyFourHrIdx].intervals;
    daysChartData = []
    //for (const [stateShort, stateLong] of Object.entries(states)) {
    for (day of days) {
        timestamp = (new Date(day.startTime)).getTime()
        debug_days = day
        daysChartData.push([timestamp, day.values.temperatureMin, day.values.temperatureMax])
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
                enabled: false
            },
            title: {
                enabled: false
            },
            type: 'datetime'
        },
        yAxis: {
            labels: {
                enabled: false
            },
            title: {
                enabled: false
            }
        },
        tooltip: {
            xDateFormat: '%A, %b, %e',
            valueSuffix: '\u00B0'
        },
        legend: {
            enabled: false
        },
        series: [{
            data: daysChartData
        }]
    }, function(){
        //TODO on chart load here
        //NOTE: this doesn't work because chart isn't initialized
        //drawBlocksForWindArrows(chart);
    });
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
            'L', x, chart.plotTop + chart.plotHeight + 32, 'Z'])
            .attr({
                stroke: chart.options.chart.plotBorderColor,
                'stroke-width': 1
            })
            .add();
    }

    // Center items in block
    chart.get('windbarbs').markerGroup.attr({
        translateX: chart.get('windbarbs').markerGroup.translateX + 8
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