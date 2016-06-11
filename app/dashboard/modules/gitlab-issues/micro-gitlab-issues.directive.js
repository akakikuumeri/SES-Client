(function() {
    'use strict';

    angular
        .module('modules.gitlab-issues')
        .directive('sesGitlabIssuesMicro', sesGitlabIssuesMicro);

    /* @ngInject */
    function sesGitlabIssuesMicro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/gitlab-issues/micro-gitlab-issues.html',
            controller: 'GitlabIssuesController',
            controllerAs: 'gitlab-issues'
        };

        return directive;
    }
})();
