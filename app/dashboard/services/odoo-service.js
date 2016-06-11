(function() {
    'use strict';

    angular
        .module('odoo-service', ['ngOdoo', 'date-service'])
        .factory('odooPollingService', odooPollingService);

    /* @ngInject */
    function odooPollingService($log, $interval, $odoo, dateService) {
        var data = {};
        var deleted = [];

        var service = {
            start: start,
            stop: stop,
            update: update,
            data: data
        };

        $interval(poller, 10000);

        // Public functions
        // Starts polling for key and config
        function start(key, cfg) {
            var ser = Array.apply(null, new Array(cfg.datasets)).map(function(_, i) {
                return {};
            });

            if(data[key] === undefined){
                data[key] = {
                    'config': cfg,
                    'parsed': {
                        'series': ser,
                        'labels': []
                    }
                };
                if(cfg.groupByDate){
                    setDateConfig(cfg, key);
                }
            } else{
                // $log.info("Trying to start data polling with already defined key. Ignoring!");
            }
            poller();
        }

        // Updates config for key. Useful when changing configuration
        function update(key, cfg) {
            data[key].config = cfg;
            setDateConfig(cfg, key);
            poller();
        }

        // Sets date configuration for key
        function setDateConfig(cfg, key){
            var dateConfig = dateService.getDateConfig(
                cfg.dateInterval || 'month',
                cfg.groups,
                cfg.dateOffset || 0
            );
            data[key].config.groupLimits = dateConfig.times;
            data[key].parsed.labels = dateConfig.labels;
        }

        // Stops polling data with key
        function stop(key) {
            data[key] = undefined;
            delete data[key];
        }

        // Private functions

        // Parses data to match requiremets
        function parseDateBarData(config, dataset, dataToParse) {
            var groupLimits = config.groupLimits;
            var intervals = Array.apply(null, new Array(config.groups)).map(function(_, i) {
                return {
                    start: groupLimits[i],
                    end: groupLimits[i+1]
                };
            });

            var amounts = Array.apply(null, new Array(config.groups)).map(function() {
                return 0.0;
            });

            function isInInterval(element, index, array, obj) {
                var beforeEnd = element.end.getTime() > obj.getTime();
                var afterStart = element.start.getTime() < obj.getTime();
                return beforeEnd && afterStart;
            }

            dataToParse.forEach(function(obj) {
                var gField = dataset.groupField;
                var date = new Date(obj[gField].replace(/-/g,"/"));

                var a = intervals.findIndex( function(element, index, array){
                    return isInInterval(element, index, array, date);
                });
                amounts[a] += obj[dataset.valueField];
            });
            var series = amounts;

            return series;
        }

        var parseFunctions = {
            'DateBar': parseDateBarData,
        };

        function errorCallback(err) {
            console.error("Odoo polling unsuccessful!");
            console.error(err);
        }

        function successCallback(success, key, config, dataset) {
            var chart = config.dataType;
            var parseFunc = parseFunctions[chart];
            var parsedSeries = parseFunc(config, dataset, success.result);

            var i = config.datasets.indexOf(dataset);
            data[key].parsed.series[i] = parsedSeries;
            data[key].parsed.series[i].name = dataset.name;
        }

        // Polls data defined by dataset configuration.
        function pollDataset(config, datasetCfg) {
            // Poll data with ngOdoo
            var dom = datasetCfg.domain;
            var n = config.groupLimits.length-1;
            // TODO: Do not trust that group limits are in order
            // use min and max to find start and end for group limits
            dom = dom.concat([
                [datasetCfg.groupField, '<=', config.groupLimits[n]],
                [datasetCfg.groupField, '>=', config.groupLimits[0]]
            ]);
            var searchData = $odoo.search_read(datasetCfg.targetModule, {
                fields: datasetCfg.targetFields,
                domain: dom
            });
            return searchData.$promise;
        }

        // Main poller function. Polls and parses all data.
        function poller() {
            // Poll data
            Object.keys(data).forEach(function(key){
                // console.log("poll " + key);
                var config = data[key].config;
                config.datasets.forEach(function(dataset, index){
                    data[key].promise = pollDataset(config, dataset);
                    data[key].promise
                        .then(function(success) {
                            successCallback(success, key, config, dataset);
                        })
                        .catch(errorCallback);
                });
            });
        }

        return service;
    }
})();
