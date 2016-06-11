module.exports = function(config) {
    config.set({
        basePath: './',
        files: [
            'app/resources/bower_components/jquery/dist/jquery.js',
            'app/resources/bower_components/angular/angular.js',
            'app/resources/bower_components/**/angular-*.js',
            'app/resources/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'app/resources/bower_components/underscore/underscore.js',
            'app/resources/bower_components/chartist/dist/chartist.js',
            'app/resources/bower_components/chartist-plugin-axistitle/dist/chartist-plugin-axistitle.js',
            'app/resources/bower_components/chartist-plugin-legend/chartist-plugin-legend.js',
            'app/resources/bower_components/chartist-plugin-pointlabels/dist/chartist-plugin-pointlabels.js',
            'app/resources/bower_components/restangular/dist/restangular.js',
            'app/resources/lib/*.js',
            'app/app.module.js',
            'app/**/*.module.js',
            'app/!(resources)/**/*.js',
            'app/**/*.html'
        ],
        autoWatch: true,
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
        reporters: ['progress', 'coverage'],
        plugins: [
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-ng-html2js-preprocessor',
            'karma-coverage',
            'karma-phantomjs-launcher'
        ],
        preprocessors: {
            'app/**/*.html': ['ng-html2js'],
            'app/!(resources|odoo)/**/*.js' : ['coverage']
        },
        coverageReporter: {
            type : 'html',
            dir : 'coverage/'
        },
        ngHtml2JsPreprocessor: {
            stripPrefix: 'app/',
            moduleName: 'templates'
        }
    });
};
