(function() {
    'use strict';

    angular
        .module('modules.gitlab-milestones')
        .factory('gitlab', gitlab);

    //Gitlab API stuff
    function gitlab(configService) {
        var gitlab_token = "";
        var gitlab_base_url = "";

        configService.one('gitlab').get().then(function(data) {
            gitlab_token = data.token;
            gitlab_base_url = data.url;
        });

    }
})();
