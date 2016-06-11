(function () {
    'use strict';

    angular
        .module('modules.weather')
        .controller('microWeather', microWeather)
        .controller('macroWeather', macroWeather);

    function microWeather($scope, $http) {
        var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + $scope.settings.location +
            '&appid=' + $scope.settings.weather_token;

        $http.get(url).then(function (response) {
            $scope.data = response.data;
            $scope.temp = Math.round($scope.data.main.temp - 273.15);
            $scope.mintemp = Math.round($scope.data.main.temp_min - 273.15);
            $scope.maxtemp = Math.round($scope.data.main.temp_max - 273.15);
            $scope.city = $scope.settings.location;
            $scope.icon = 'http://openweathermap.org/img/w/' + $scope.data.weather[0].icon + '.png';
        });

    }

    function macroWeather($scope, $http) {
        var url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + $scope.settings.location +
            '&units=metric&appid=' + $scope.settings.weather_token;

        //create arrays for chart data
        var chartLabels = [];
        var chartTemps = [];

        $http.get(url).then(function (response) {
            var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            $scope.list = response.data.list.slice(0, 15);

            for (var i = 0; i < $scope.list.length; i++) {
                var current = $scope.list[i];

                var currentDate = new Date(current.dt_txt.replace(/-/g,"/"));
                var day = days[currentDate.getDay()];
                var time = currentDate.getHours() + ":00";

                //add day and time to label array
                chartLabels.push(day + "\n" + time);

                //add temperature to temp array
                chartTemps.push(Math.round(current.main.temp));
            }

            $scope.chartType = "Line";

            $scope.chartData = {
                labels: chartLabels,
                series: [chartTemps]
            };

            $scope.options = {
                high: (_.max(chartTemps) + 1),
                low: (_.min(chartTemps) - 1),
                axisY: {
                    onlyInteger: true,
                    offset: 20
                },
                chartPadding: {
                    top: 0,
                    right: 10,
                    bottom: 0,
                    left: 10
                }
            };

            $scope.options.plugins = [
                Chartist.plugins.ctPointLabels({
                    textAnchor: 'middle',
                    labelInterpolationFnc: function (value) {
                        return value + '℃'
                    }
                })
            ]


        });


    }
})
();
