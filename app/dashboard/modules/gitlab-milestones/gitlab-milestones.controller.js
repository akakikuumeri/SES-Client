(function() {
    'use strict';

    angular
        .module('modules.gitlab-milestones')
        .controller('GitlabMilestonesController', GitlabMilestonesController);

    function GitlabMilestonesController($scope, Restangular) {

        var gitlab = Restangular.withConfig(function(instance) {
            instance.setBaseUrl($scope.settings.gitlab_url);
            instance.setDefaultHeaders({ 'private-token': $scope.settings.gitlab_token });
        });

        // Properties
        $scope.loginRequired = !('gitlab_url' in $scope.settings &&
            $scope.settings.gitlab_url && 'gitlab_token' in $scope.settings &&
            $scope.settings.gitlab_token);

        // Implementation
        if(!$scope.loginRequired) {
            init();
        }

        function init() {
            gitlab.all('projects').getList().then(function(projects) { //Get all projects from Gtilab API
                $scope.projects = projects;

                projects.forEach(function(project) { //For each project gotten from Gitlab
                    project.milestonePercentage = 0.0; //init percentage
                    project.all('milestones').getList().then(function(stones){
                        project.milestones = stones;
                        stones.forEach( function (stone) {
                            if (stone.state !== "active") {
                                project.milestonePercentage += 100.0; //add 100% per completed milestone. Will divide by
                                //number below
                            }
                        })
                        //window.alert(project.milestones.length);
                        if (project.milestones.length == 0) {
                            //no milestones in the project
                            project.milestoePercentage = 100.0;
                        }else{
                            project.milestonePercentage /= project.milestones.length; //divide by number of milestones
                            // to get percentage
                        }
                    })
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
