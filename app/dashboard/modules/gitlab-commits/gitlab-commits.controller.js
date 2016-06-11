(function() {
    'use strict';

    angular
        .module('modules.gitlab-commits')
        .controller('GitlabCommitsController', GitlabCommitsController);

    function GitlabCommitsController($q, $scope, Restangular) {

        var gitlab = Restangular.withConfig(function(instance) {
            instance.setBaseUrl($scope.settings.gitlab_url);
            instance.setDefaultHeaders({ 'private-token': $scope.settings.gitlab_token });
        });
        // Properties
        $scope.loginRequired = !('gitlab_url' in $scope.settings && $scope.settings.gitlab_url &&
            'gitlab_token' in $scope.settings && $scope.settings.gitlab_token);

        // Implementation
        if(!$scope.loginRequired) {
            init();
        }

        function init() {
            //Get 4 most recent project from gitlab repository via API
            gitlab.all('projects').getList({ order_by: 'last_activity_at', per_page: 4 }).then(function(projects) {
                $scope.projects = projects;//store projects here

                projects.forEach(function(project) {//for each project
                    project.all('repository').all('branches').getList().then(function(branches) {//for each branch in all repos
                        project.branches = branches; //store branches for later use
                        project.activeBranches = _(branches).sortBy(function(branch) {
                            return branch.commit.committed_date;
                        }).reverse().slice(0, 3);

                        var branchesPromises = project.activeBranches.map(function(branch) {
                            return project.all('repository').all('commits').getList({ ref_name: branch.name, per_page: 3 }).then(function(commits) {
                                branch.commits = commits.map(function(commit) {
                                    return angular.extend(commit, { branchName: branch.name });
                                });
                            });
                        });

                        $q.all(branchesPromises).then(function() {
                            project.latestCommits = project.activeBranches.reduce(function(res, branch) {
                                return res.concat(branch.commits);
                            }, []);

                            project.latestCommits = _(project.latestCommits).sortBy('created_at').reverse().splice(0, 3);
                        });
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
