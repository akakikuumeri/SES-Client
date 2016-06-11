(function() {
    'use strict';

    angular
        .module('modules.gitlab-commits')
        .directive('sesGitlabCommitsMicro', sesGitlabMicro);

    function sesGitlabMicro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/gitlab-commits/micro-gitlab-commits.html',
            controller: 'GitlabCommitsController',
            controllerAs: 'gitlab'
        };

        return directive;
    }
})();
