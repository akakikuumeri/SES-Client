(function () {
    'use strict';

    angular
        .module('app')
        .config(run);

    /* @ngInject */
    function run($stateProvider, $urlRouterProvider, $mdThemingProvider) {
        $stateProvider.state('channel', {
            url: '/channel/:channelName',
            templateUrl: 'dashboard/home.html'
        }).state('channel.module', {
            url: '/module/:moduleId',
            template: function ($stateParams) {
                return '<ses-macro-module id="' + $stateParams.moduleId + '"></ses-macro-module>';
            }
        }).state('admin-view', {
            url: '/admin',
            templateUrl: 'admin-view/admin-view.html',
            controller: 'AdminView as adminview'
        }).state('admin-view.global-settings', {
            url: '/global',
            templateUrl: 'admin-view/global-settings.html',
            controller: 'AdminView as adminview'
        }).state('admin-view.channel-management', {
            url: '/channels',
            templateUrl: 'admin-view/channel-management.html',
            controller: 'AdminView as adminview'
        });
        $mdThemingProvider.theme('default')
          .primaryPalette('light-blue')
          .accentPalette('orange')
          .backgroundPalette('grey');
        $urlRouterProvider.otherwise('/channel/default');
    }
})();
