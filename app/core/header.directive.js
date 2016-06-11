(function() {
    'use strict';

    angular
        .module('app.core')
        .directive('sesHeader', sesHeader);

    function sesHeader(configService) {
        var directive = {
            restrict: 'E',
            scope: {
                channelPromise: '=channel'
            },
            templateUrl: "core/header.html",
            link: function(scope) {
                configService.all('channel').getList().then(function(channels) {
                    scope.channels = channels;
                });

                if(scope.channelPromise) {
                    scope.channelPromise.then(function(channel) {
                        scope.channel = channel;
                    });
                }
            }
        };

        return directive;
    }
})();
