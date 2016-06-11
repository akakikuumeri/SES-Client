'use strict';

describe('Odoo service', function() {
    var odooPollingService;
    var key = 'testKey';
    var config = {
        dataOptions: {
            dataType: 'DateBar',
            chartType: 'Bar', // Make sure that datatype is compatible
            groups: 4, // Or bars in this case
            dateOffset: -3, // Step offset from today
            dateInterval: 'month', // Can be month, week, or quarter.
            groupByDate: true,
            datasets: [{
                name: 'Invoices',
                targetModule: 'account.invoice', // Wanted module
                targetFields: ['date_invoice', 'amount_total', 'type'], // Wanted fields
                valueField: 'amount_total',
                groupField: 'date_invoice', // Name of group field
                domain: [ // Limiting factors for odoo query
                    ['state', 'not in', ['draft']],
                    ['type', 'in', ['out_invoice']],
                ]
            },{
                name: 'Drafts',
                targetModule: 'account.invoice', // Wanted module
                targetFields: ['date_invoice', 'amount_total', 'type'], // Wanted fields
                valueField: 'amount_total',
                groupField: 'date_invoice', // Name of group field
                domain: [ // Limiting factors for odoo query
                    ['state', 'in', ['draft']],
                    ['type', 'in', ['out_invoice']],
                ]
            }]
        }
    }

    beforeEach(function() {
        module('odoo-service');
    });

    beforeEach(inject(function (_odooPollingService_) {
       odooPollingService = _odooPollingService_;
    }));

    it('should have odooPollingService service be defined', function () {
      expect(odooPollingService).toBeDefined();
    });

    it('should have data object for key defined', function() {
        odooPollingService.start(key, config.dataOptions);
        var a = odooPollingService.data[key];
        expect(a).toBeDefined();
    });

    it('should have data object with defined properties', function() {
        odooPollingService.start(key, config.dataOptions);
        var a = odooPollingService.data[key];
        expect(a.parsed).toBeDefined();
        expect(a.parsed.labels).toBeDefined();
        expect(a.parsed.series).toBeDefined();
    });

    it('should update config when calling update', function() {
        odooPollingService.start(key, config.dataOptions);
        var a = odooPollingService.data[key];
        expect(a.config.dateInterval).toEqual('month');
        config.dataOptions.dateInterval = 'week';
        odooPollingService.update(key, config.dataOptions);
        expect(a.config.dateInterval).toEqual('week');
    });

    it('should remove key when calling delete', function() {
        odooPollingService.start(key, config.dataOptions);
        expect(odooPollingService.data[key]).toBeDefined();
        odooPollingService.stop(key);
        expect(odooPollingService.data[key]).not.toBeDefined();
    });
});
