(function() {
    'use strict';

    angular
        .module('modules.gitlab-milestones')
        .directive('sesGitlabMicro', sesGitlabMicro);

    function sesGitlabMicro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/gitlab-milestones/micro-gitlab-milestones.html',
            controller: 'GitlabMilestonesController',
            controllerAs: 'gitlab-milestones'
        };

        return directive;
    }
})();
