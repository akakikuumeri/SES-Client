'use strict';

describe('Odoo service', function() {
    var dateService;

    beforeEach(function() {
        module('date-service');
    });
    beforeEach(function() {
        var baseTime = new Date(2016, 0, 15);
        jasmine.clock().mockDate(baseTime);
    });

    beforeEach(inject(function (_dateService_) {
        dateService = _dateService_;
    }));

    it('should have dateService service be defined', function () {
        expect(dateService).toBeDefined();
    });

    it('should return correct amount of labels', function () {
        var count = 5;
        var config = dateService.getDateConfig('month', count, 0);
        expect(config.labels.length).toEqual(count);
    });

    it('should return correct amount of time instants', function () {
        var count = 5;
        var config = dateService.getDateConfig('month', count, 0);
        // console.log(config);
        expect(config.times.length).toEqual(count + 1);
        // You need n+1 time instants to define n time intervals
    });

    it('should return time instants that are all midnight', function () {
        var config = dateService.getDateConfig('month', 5, 0);
        config.times.forEach(function(a){
            expect(a.getHours()).toEqual(0);
            expect(a.getMinutes()).toEqual(0);
            expect(a.getSeconds()).toEqual(0);
            expect(a.getMilliseconds()).toEqual(0);
        })
    });

    it('should return correct first time instant when interval is month', function () {
        var cDate = new Date(2016, 0, 1, 0, 0, 0, 0);
        var config = dateService.getDateConfig('month', 5, 0);
        expect(config.times[0]).toEqual(cDate);
    });

    it('should return correct first time instant when interval is week', function () {
        var cDate = new Date(2016, 0, 11, 0, 0, 0, 0);
        var config = dateService.getDateConfig('week', 5, 0);
        expect(config.times[0]).toEqual(cDate);
    });

    it('should return correct first time instant when interval is quarter', function () {
        var cDate = new Date(2016, 0, 1, 0, 0, 0, 0);
        var config = dateService.getDateConfig('quarter', 5, 0);
        expect(config.times[0]).toEqual(cDate);
    });
});
