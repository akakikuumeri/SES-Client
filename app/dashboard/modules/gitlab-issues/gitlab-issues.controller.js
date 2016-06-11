(function() {
    'use strict';

    angular
        .module('modules.gitlab-issues')
        .controller('GitlabIssuesController', GitlabIssuesController);

    function GitlabIssuesController($scope, Restangular) {

        var gitlab = Restangular.withConfig(function(instance) {
            instance.setBaseUrl($scope.settings.gitlab_url);
            instance.setDefaultHeaders({ 'private-token': $scope.settings.gitlab_token });
        });
        // Properties
        $scope.loginRequired = !('gitlab_url' in $scope.settings &&
            $scope.settings.gitlab_url && 'gitlab_token' in $scope.settings &&
            $scope.settings.gitlab_token);

        $scope.projects = [];

        // Implementation
        if(!$scope.loginRequired) {
            init();
        }

        // Implementation
        function init() {
            gitlab.all('projects').getList().then(function(projects) { //Get all projects from Gtilab API
                $scope.projects = projects;
                $scope.projects.forEach(function(project) { //For each project gotten from Gitlab
                    // Get list of all issues that project has:
                    project.all('issues?state=opened&order_by=updated_at&sort=desc').getList().then(function (issues) {
                        project.issues = issues;
                    });
                });

            }).catch(handleError);
        }

        function handleError(e) {
            if(e.status == 401) {
                $scope.loginRequired = true;
            } else {
                throw e;
            }
        }
    }
})();
