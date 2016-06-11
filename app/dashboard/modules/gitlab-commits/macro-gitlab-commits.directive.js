(function() {
    'use strict';

    angular
        .module('modules.gitlab-commits')
        .directive('sesGitlabCommitsMacro', sesGitlabCommitsMacro);

    function sesGitlabCommitsMacro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/gitlab-commits/macro-gitlab-commits.html',
            controller: 'GitlabCommitsController',
            controllerAs: 'gitlab-commits'
        };

        return directive;
    }
})();
