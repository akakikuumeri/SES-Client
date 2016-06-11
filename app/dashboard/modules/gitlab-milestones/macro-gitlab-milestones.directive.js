(function() {
    'use strict';

    angular
        .module('modules.gitlab-milestones')
        .directive('sesGitlabMacro', sesGitlabMacro);

    function sesGitlabMacro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/gitlab-milestones/macro-gitlab-milestones.html',
            controller: 'GitlabMilestonesController',
            controllerAs: 'gitlab-milestones'
        };

        return directive;
    }
})();
