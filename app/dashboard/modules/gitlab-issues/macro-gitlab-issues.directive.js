(function() {
    'use strict';

    angular
        .module('modules.gitlab-issues')
        .directive('sesGitlabIssuesMacro', sesGitlabIssuesMacro);

    /* @ngInject */
    function sesGitlabIssuesMacro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/gitlab-issues/macro-gitlab-issues.html',
            controller: 'GitlabIssuesController',
            controllerAs: 'gitlab-issues'
        };

        return directive;
    }
})();
