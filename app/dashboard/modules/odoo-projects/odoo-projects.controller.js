(function() {
    'use strict';

    angular
        .module('modules.odoo-projects')
        .controller('Projects', Projects);

    function Projects($scope, $interval, $odoo, $rootScope) {
        $scope.config = $scope.settings;

        function getSession() {
            return $odoo.get_session_info()
        }

        function checkLogin() {
            if (typeof $rootScope.username !== 'undefined') {
                $scope.loggedIn = true;
            } else {
               getSession().then(function(result) {
                    if (result.data.result.uid) {
                        $rootScope.username = result.data.result.username;
                        $scope.loggedIn = true;
                    } else {
                        $scope.loggedIn = false;
                    }
                });
            }
        }

        $scope.chartEvents = {
            draw: function(data) {
                data.element.animate({
                    opacity: {
                        begin: 0,
                        dur: 100,
                        from: 0,
                        to: 1
                    },
                    y2: {
                        begin: 0,
                        dur: 100,
                        from: data.y1,
                        to: data.y2,
                        easing: 'easeOutExpo'
                    }
                });
            }
        };

        $scope.chartData = {
            series: [],
            labels: []
        };

        $interval(poller, 10000);
        poller();

        $scope.delete = function (a) {
            console.log("delete projects controller");
        };

        function pollAnalytics() {
            return $odoo.search_read($scope.config.analytic_account.targetModule, {
                fields: $scope.config.analytic_account.targetFields,
                domain: $scope.config.analytic_account.domain
            }).$promise;
        }

        function pollTimesheets(projParent, anaIds){
            return $odoo.search_read($scope.config.timesheet.targetModule, {
                fields: $scope.config.timesheet.targetFields,
                domain: $scope.config.timesheet.domain.concat([
                    ['account_id', 'in', anaIds]
                ])
            }).$promise;
        }

        function poller() {
            pollAnalytics().then(function(success){
                var times = {};

                var ids = jQuery.map(success.result, function(obj){
                    if(obj.parent_id[0] === 1){
                        // $scope.project_id = obj.id;
                        times[obj.id] = {
                            value: 0,
                            name: obj.name,
                            users: []
                        };
                        // times[obj.id]. = 0;
                        return obj.id;
                    }
                });

                pollTimesheets($scope.project_id, ids).then(function(success){
                    success.result.forEach(function(timesheet){
                        // console.log(timesheet);
                        var timeObj = times[timesheet.account_id[0]];
                        timeObj.value += timesheet.unit_amount;

                        var userInList = timeObj.users.findIndex( function(element, index, array){
                            return isUserInList(element, index, array, timesheet.user_id);
                        });

                        if(userInList < 0){
                            timeObj.users.push({
                                id: timesheet.user_id[0],
                                name: timesheet.user_id[1]
                            });
                        }
                    });
                    // All data is here and ready to be formatted for chartist.
                    var timeArr = [];

                    Object.keys(times).forEach(function(key){
                        var obj = times[key];
                        obj.id = key;
                        timeArr.push(obj);
                    });

                    timeArr = timeArr.sort(function(a,b){
                        return a.value - b.value;
                    });

                    $scope.chartData.labels = jQuery.map(timeArr, function(t){
                        return t.name;
                    });
                    $scope.chartData.series[0] = jQuery.map(timeArr, function(t){
                        return t.value;
                    });
                    $scope.chartData.series[1] = jQuery.map(timeArr, function(t){
                        return t.users.length;
                    });
                });

                function isUserInList(element, index, array, user){
                    return element.id == user[0];
                }
            });
        }

        checkLogin();
    }
})();
