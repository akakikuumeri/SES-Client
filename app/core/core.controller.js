(function () {
    'use strict';

    angular
        .module('app.core')
        .controller('Core', Core)
        .controller('OdooLoginController', OdooLoginController);

    function Core($state, $odoo, $scope, $uibModal, $rootScope) {
        var vm = this;

        vm.switchView = switchView;
        vm.checkLogin = checkLogin;
        vm.switchToMicro = switchToMicro;

        var originatorEv;
        vm.openMenu = function($mdOpenMenu, ev) {
          originatorEv = ev;
          $mdOpenMenu(ev);
        };

        function switchView() {
            if ($state.current.name.indexOf('admin-view') === 0) {
                $state.go('channel');
            } else {
                $state.go('admin-view.channel-management');
            }
        }

        function switchToMicro() {
          if ($state.current.name.indexOf('admin-view') === 0) {
              $state.go('channel');
          }
      }

        //pressing the cog takes you to the admin-view if logged in, otherwise it opens the login modal
        function checkLogin() {
            if (typeof $rootScope.username !== 'undefined') {
                switchView();
            } else {
                $odoo.get_session_info().then(function (result) {
                    if (result.data.result.uid) {
                        $rootScope.username = result.data.result.username;
                        switchView();
                    } else {
                        loginModal('sm');
                    }
                });
            }
        }

        //creates instance of the login modal that uses the odoo login controller
        function loginModal(size) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'core/login-modal.html',
                controller: 'OdooLoginController',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });
        }
    }

    //handles odoo login
    function OdooLoginController($scope, $state, $odoo, $uibModalInstance, $rootScope) {
        $scope.master = {};
        $scope.loginOdoo = function (user) {
            $scope.master = angular.copy(user);
            $odoo.login($scope.master.database, $scope.master.email, $scope.master.pwd).then(
                function (success) {
                    if (success.data.error) {
                        $scope.error = "Database doesn't exist!";
                    } else if (success.data.result.uid) {
                        $uibModalInstance.close();
                        $rootScope.username = success.data.result.username;
                        $state.go('admin-view.channel-management');
                    } else {
                        $scope.error = "Wrong password or username!";
                    }
                },
                function (error) {
                    console.log("Login error");
                }
            );
        };


        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };

    }
})();
