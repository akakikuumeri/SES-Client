(function() {
    'use strict';

    angular
        .module('date-service', [])
        .factory('dateService', dateService);

    /* @ngInject */
    function dateService($log) {
        Date.prototype.getWeekYear = function() {
            var date = new Date(this.getTime());
            date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
            return date.getFullYear();
        };

        var intervals = {
            'day': {'y':0,'m':0,'d':1},
            'month': {'y':0,'m':1,'d':0},
            'week': {'y':0,'m':0,'d':7},
            'quarter': {'y':0,'m':3,'d':0},
        };

        // Label formating for different intervals
        var labels = {
            'day': function(d){return "day";},
            'month': function(d){
                return d.getMonth() + 1 + "/" + d.getFullYear();
            },
            'week': function(d){
                //TODO: Find week number
                return "W" + "X" + "/" + d.getWeekYear();
            },
            'quarter': function(d){
                //TODO: Find quarter number
                return "QX/" + d.getFullYear();
            }
        };

        // Functions for setting start time for different intervals
        var setStartTime = {
            'day': function(d){
            },
            'month': function(d){
                d.setDate(1);
            },
            'week': function(d){
                var day = d.getDay();
                d.setDate(d.getDate() - day + 1);
            },
            'quarter': function(d){
                d.setDate(1);
                var m = d.getMonth() % 3;
                d.setMonth(m * 3);
            }
        };

        var service = {
            getDateConfig: getDateConfig,
        };

        var monthEnum = [
            'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
            'JUN', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
        ];

        // Returns group label
        function getLabel(interval, startDate){
            return labels[interval](startDate);
        }

        // Get start date of time interval with offset
        function getStartDate(interval, offset){
            var startDate = new Date();

            startDate.setHours(0);
            startDate.setMinutes(0);
            startDate.setSeconds(0);

            setStartTime[interval](startDate);

            var inter = intervals[interval];
            startDate.setYear(startDate.getFullYear() + inter.y * offset);
            startDate.setMonth(startDate.getMonth() + inter.m * offset);
            startDate.setDate(startDate.getDate() + inter.d * offset);
            return startDate;
        }

        // Returns labels and intervals needed for data grouping.
        function getDateConfig(interval, count, offset){
            var dateConfig = {
                labels: [],
                times: []
            };
            var inter = intervals[interval];

            var startDate = getStartDate(interval, offset);
            dateConfig.times.push(startDate);

            for (var i = 1; i <= count; i++) {
                var prev = dateConfig.times[i - 1];

                var date = new Date(
                    prev.getFullYear() + inter.y,
                    prev.getMonth() + inter.m,
                    prev.getDate() + inter.d,
                    0,0,0,0
                );
                dateConfig.times.push(date);
                dateConfig.labels.push(getLabel(interval, prev));
            }

            return dateConfig;
        }
        return service;
    }
})();
