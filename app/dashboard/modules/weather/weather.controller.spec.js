(function() {
    'use strict';

    describe('Weather', function() {
        var controller, rootScope, scope, httpBackend, auth, http;

        beforeEach(module('modules.weather'));

        beforeEach(inject(function($injector, $controller) {
            httpBackend = $injector.get('$httpBackend');
            rootScope = $injector.get('$rootScope');
            scope = rootScope.$new();
            scope.settings = {
                location: 'London',
                token: 'abc123'
            };
            scope.options = {
                plugins: []
            };

            auth = httpBackend.whenGET(scope.urli).respond({
                "list": [{
                    "main": {
                        "temp": 271.51
                    },
                    "dt_txt": "2016-01-17 18:00:00"
                }, {
                    "main": {
                        "temp": 261.14
                    },
                    "dt_txt": "2016-01-18 18:00:00"
                }, {
                    "main": {
                        "temp": 262.62
                    },
                    "dt_txt": "2016-01-18 21:00:00"
                }]
            });

            controller = $controller('macroWeather', {
                $scope: scope
            });

        }));

        it('should be defined', function() {
            expect(controller).toBeDefined();
        });

        it('should fetch weather data', function() {
            httpBackend.expectGET(scope.urli);
        });

        it('should have valid chartData', function() {
            httpBackend.flush();
            expect(scope.chartData).toBeTruthy();
        });

        it('should have valid chartType', function() {
            httpBackend.flush();
            expect(scope.chartType).toBeTruthy();
        });
    });
})();
