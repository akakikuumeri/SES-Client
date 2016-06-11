(function () {
    'use strict';

    angular
        .module('app.admin-view')
        .controller('AdminView', AdminView);

    function AdminView($state, $scope, $timeout, $uibModal, configService) {
        var vm = this;

        //bind to view model
        vm.createChannel = createChannel;
        vm.duplicateChannel = duplicateChannel;
        vm.removeChannel = removeChannel;
        vm.removeModule = removeModule;
        vm.setAsDefault = setAsDefault;
        vm.editModuleConfig = editModuleConfig;
        vm.isActive = isActive;
        vm.channelSelected = channelSelected;
        vm.addModule = addModule;
        vm.modulePressed = modulePressed;
        vm.saveSettings = saveSettings;

        vm.channels = [];
        vm.modules = [];
        vm.selectedChannel = {};
        vm.globalSettings = {};

        // Load channels when this page is opened:
        loadChannels(true);

        vm.defaultChannelSelected = function () {
            return vm.selectedChannel.is_default;
        };

        //load global settings
        function loadSettings() {
            configService.one('settings', 'main_settings').get().then(function (s) {
                vm.globalSettings = s;
                vm.globalSettings.id = 'main_settings';
                $scope.newSettings = angular.copy(vm.globalSettings.settings);
            });

        }

        // Load all channels from server and put them to the channel list (setDefaultSelected is true when we want to set
        // first list value as selected:
        function loadChannels(setDefaultSelected) {
            configService.all('channel').getList().then(function (channels) {
                vm.channels = channels;
                // Mark default into the channel dropdown list:
                vm.channels.forEach(function (chan) {
                    chan.fullName = chan.label;
                    if (chan.is_default) {
                        chan.fullName += " (default)";
                        vm.defaultChannel = chan;
                    }
                });
                // If channels are loaded at the first time, then we need to set first value in the list as active one:
                if (channels.length && setDefaultSelected) {
                    vm.selectedChannel = channels[0];
                    // Do necessary actions for selecting a channel (update view accordingly):
                    channelSelected();
                }
            });
        }

        // Load channels and settings when this page is opened:
        loadChannels(true);
        loadSettings();

        //save global settings
        function saveSettings() {
            vm.globalSettings.settings = angular.copy($scope.newSettings);
            vm.globalSettings.patch().then(function () {
                $scope.success = "Settings saved!";
                $timeout(function () {
                    $scope.success = false;
                }, 3000);
            });

        }

        // Load all module choices into a list vm.modules:
        configService.all('module').getList().then(function (modules) {
            vm.modules = modules;
        });

        // Set options for sortable dragging:
        vm.sortableOptions = {
            // We dont want to be able to drag any locked items, in our case the
            // add module button
            items: "li:not(.locked)",
            stop: function (event, ui) { // Called when an item is dragged and dropped somewhere
                var oldModules = vm.selectedChannel.modules;
                $scope.channel = vm.selectedChannel;
                removeAddModuleButton($scope.channel); // remove add module button from the object before saving
                var modules = [];
                // Set the new order of the modules:
                for (var i = 0; i < vm.selectedChannel.modules.length; i++) {
                    var mod = vm.selectedChannel.modules[i];
                    modules.push({
                        id: mod.id,
                        module: mod.module,
                        ordernumber: i + 1
                    });
                }
                $scope.channel.modules = modules;
                $scope.channel.id = $scope.channel.name; // Id needs to be set for Restangular to send request into right url
                $scope.channel.patch(); // Save new module order instantly
                vm.selectedChannel.modules = oldModules;
                setFullNamesToModuleList();
            }
        };

        // Open add module modale if plus button is selected:
        function modulePressed(index) {
            if (index === -1) {
                vm.addModule();
            }
        }

        //
        function isActive(stateName) {
            return $state.current.name.indexOf(stateName) === 0;
        }

        // Create a new channel
        function createChannel(size) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'admin-view/channel-name-modal.html',
                controller: function ($scope, $uibModalInstance, channels) {
                    $scope.channels = channels;
                    $scope.channel = { // Init empty channel object
                        name: '',
                        description: '',
                        label: ''
                    };
                    $scope.title = 'Create a new channel';
                    $scope.confirm = function () {
                        $scope.channel.name = slugify($scope.channel.label);

                        // Check if there is a duplicate:
                        // TODO check that required fields are filled
                        var duplicate = vm.channels.filter(function (item) {
                            return item.name == $scope.channel.name;
                        });
                        if (duplicate.length === 0) {
                            // Post a new channel object:
                            vm.channels.post($scope.channel).then(function() {
                                $scope.channel.fullName = $scope.channel.label;
                                $scope.channels.push($scope.channel);
                                vm.selectedChannel = $scope.channel;
                                setFullNamesToModuleList();
                                channelSelected(); // set just created channel active in the view
                                addModuleAddButton(); // Add a plus button into empty channel
                                setFullNamesToModuleList();
                                $uibModalInstance.close();
                            });
                        } else {
                            // TODO error message to the form
                            alert("Error! Channel must have a unique name!");
                        }
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss();
                    };
                },
                size: size,
                resolve: {
                    channels: function () {
                        return vm.channels;
                    }
                }
            });
        }

        function duplicateChannel(size) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'admin-view/channel-name-modal.html',
                controller: function ($scope, $uibModalInstance, channels) {
                    $scope.channels = channels;
                    $scope.channel = {
                        name: vm.selectedChannel.name,
                        label: vm.selectedChannel.label,
                        description: vm.selectedChannel.description
                    };
                    $scope.title = 'Duplicate channel "' + vm.selectedChannel.name + '"';
                    var oldName = '';
                    $scope.confirm = function (newLabel, newDescription) {
                        // Check if there is a duplicate:
                        // TODO check that required fields are filled
                        var duplicate = vm.channels.filter(function (item) {
                            return item.label == newLabel;
                        });
                        if (duplicate.length == 0) {
                            var match = _.find(channels, function (item) {
                                // Find old channel for copying:
                                oldName = item.name;
                                return item.name === vm.selectedChannel.name;
                            });
                            if (match) {
                                // Copy content from the other channel:
                                $scope.channel = configService.copy(vm.selectedChannel);
                                $scope.channel.name = slugify(newLabel);
                                $scope.channel.label = newLabel;
                                $scope.channel.fullName = $scope.channel.label;
                                $scope.channel.is_default = false;
                                $scope.channel.description = newDescription;
                                $scope.channel.id = oldName;
                                removeAddModuleButton($scope.channel);
                                // Save a new channel with old channel's data
                                $scope.channel.patch().then(function() {
                                    vm.channels.push($scope.channel);
                                    vm.selectedChannel = $scope.channel;
                                    setFullNamesToModuleList();
                                    channelSelected();
                                    $uibModalInstance.close();
                                });
                            }

                        } else {
                            // TODO error message to the form
                            alert("Error! Channel must have a unique name!");
                        }
                        $uibModalInstance.close();
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss();
                    };
                },
                size: size,
                resolve: {
                    channels: function () {
                        return vm.channels;
                    }
                }
            });
        }

        function removeChannel(size) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'admin-view/confirmation-modal.html',
                controller: function ($scope, $uibModalInstance, channels) {
                    $scope.channels = channels;
                    $scope.title = 'Are you sure you want to delete channel "' + vm.selectedChannel.name + '"?';
                    $scope.confirm = function () {
                        // Remove channel from the channel list:
                        channels = _(channels).filter(function (item) {
                            return item.name !== vm.selectedChannel.name;
                        });
                        vm.selectedChannel.id = vm.selectedChannel.name; // Set id for getting right url with Restangular
                        vm.selectedChannel.remove().then(function () { // Remove channel
                            vm.channels = channels;
                            vm.selectedChannel = vm.channels[0];
                            setFullNamesToModuleList();
                            channelSelected();
                            $uibModalInstance.close();
                        });

                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss();
                    };
                },
                size: size,
                resolve: {
                    channels: function () {
                        return vm.channels;
                    }
                }
            });
        }

        // Remove a module with the specified index from current selected channel
        // The add module button cannot be removed with this function
        function removeModule(index) {
            var channel = createChannelPatchObject();
            //Remove the module from both the patch-object and local copy
            channel.modules.splice(index, 1);
            vm.selectedChannel.modules.splice(index, 1);
            channel.patch();
        }

        function createChannelPatchObject() {
            // Clone the old channel object, since we need to 'trim' the data
            // which we send to server, we don't want to edit the original
            // channel object
            var newChannel = configService.copy(vm.selectedChannel);
            // Reset the module array and the highest order number within modules
            newChannel.modules = [];
            $scope.highestOrderNumber = 0;
            // Go through all modules in current channel
            vm.selectedChannel.modules.forEach(function(module) {
                // The add module has an id of -1, we dont want to do anything
                // with it
                if (module.id !== -1) {
                    // Add the critical data to the module array
                    newChannel.modules.push({
                        id: module.id,
                        module: module.module
                    });
                    // Update the orderNumber based on the ordernumbers
                    // of all modules in the channel
                    if ($scope.highestOrderNumber <= module.ordernumber) {
                        $scope.highestOrderNumber = module.ordernumber + 1;
                    }
                }
            });
            // Set the channel id as the channel name
            newChannel.id = newChannel.name;
            return newChannel;
        }

        function editModuleConfig(index) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'admin-view/module-config-modal.html',
                controller: function($scope, $uibModalInstance, module) {
                    $scope.title = 'Config for ' + module.fullName + " in channel " + vm.selectedChannel.name;
                    $scope.moduleConfig = JSON.stringify(module.settings, null, '\t');
                    $scope.onCancelConfig = angular.extend({}, $scope.moduleConfig);
                    $scope.confirm = function() {
                        var channel = createChannelPatchObject();
                        var mod = channel.modules.find(function(modu) {
                            return modu.id === module.id;
                        });
                        try {
                          mod.settings = JSON.parse($scope.moduleConfig);
                        } catch (err) {
                           window.alert("Invalid syntax!");
                        }
                        channel.patch().then(function(channel) {
                            vm.selectedChannel = channel;
                            channelSelected();
                        });
                        $uibModalInstance.close();
                    };
                    $scope.cancel = function () {
                        module.config = $scope.onCancelConfig;
                        $uibModalInstance.dismiss();
                    };
                },
                size: 'lg',
                resolve: {
                    module: function () {
                        return vm.selectedChannel.modules[index];
                    }
                }
            });
        }

        // Add a new module to a channel
        function addModuleToSelectedChannel(module) {
            var channel = createChannelPatchObject();
            // Push new module to modulelist in scope:
            channel.modules.push({
                name: module.name,
                module: module.name,
                ordernumber: $scope.highestOrderNumber,
                settings: {}
            });
            channel.patch().then(function(channel) { // get latest version from server
                vm.selectedChannel = channel;
                channelSelected();
            });
            // Push changes into selected channel:
            vm.selectedChannel.modules.push({
                name: module.name,
                module: module.name,
                image_url: module.image_url,
                settings: {},
                id: 1234321
            });
            setFullNamesToModuleList();
        }


        // Open modal for adding a new module
        function addModule() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'admin-view/add-module-modal.html',
                controller: function ($scope, $uibModalInstance) {
                    $scope.title = 'Add module to channel';
                    $scope.modules = vm.modules;
                    $scope.confirm = function (index) {
                        addModuleToSelectedChannel(vm.modules[index]);
                        addModuleAddButton();
                        $uibModalInstance.close();
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss();
                    };
                },
                size: 'lg'
            });
        }

        // Open modale for setting channel as a default
        function setAsDefault() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'admin-view/confirmation-modal.html',
                controller: function ($scope, $uibModalInstance) {
                    $scope.title = 'Set "' + vm.selectedChannel.name + '" as the default channel?';
                    $scope.confirm = function () {
                        $scope.defaultChannel = vm.selectedChannel;
                        var def = $scope.defaultChannel;
                        def.is_default = true; // Set channel as default
                        def.id = def.name;
                        removeAddModuleButton(def);
                        def.patch().then(function () { // Save changes to server
                            loadChannels(false);
                            vm.selectedChannel = $scope.defaultChannel;
                            channelSelected();
                            setFullNamesToModuleList();

                            $uibModalInstance.close();
                        });
                        $uibModalInstance.close();
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss();
                    };
                },
                size: 'sm'
            });
        }

        // Add plus button for adding modules into module list view:
        // We add the button to the list of modules because of how sortable.js
        // works.
        function addModuleAddButton() {
            removeAddModuleButton(vm.selectedChannel);
            vm.selectedChannel.modules.push({
                id: -1,
                image_url: '/app/resources/images/ic_add_module.png'
            });
        }

        // Channel is selected from some action or dropdown - this function does necessary settings for viewing the channel edit view:
        function channelSelected() {
            if (vm.selectedChannel) {
                configService.one('channel', vm.selectedChannel.name).get().then(function (detailedChannel) { // Get the channel (with its modules)
                    vm.selectedChannel = detailedChannel;
                    // Sort modules by their ordernumber
                    vm.selectedChannel.modules.sort(function(a, b) {
                        return a.ordernumber - b.ordernumber;
                    });
                    vm.selectedChannel.fullName = vm.selectedChannel.label;
                    // Set default to name if channel is default
                    if (vm.selectedChannel.is_default) {
                        vm.selectedChannel.fullName += " (default)";
                    }
                    // If there are no modules in channel, then ordernumber is zero
                    if (vm.selectedChannel.modules.length === 0) {
                        $scope.highestOrderNumber = 0;
                    } else { // Save current highest ordernumber of the channel:
                        $scope.highestOrderNumber = vm.selectedChannel.modules[vm.selectedChannel.modules.length - 1].ordernumber;

                    }
                    setFullNamesToModuleList();
                    addModuleAddButton();
                });
            }
        }

        // Remove add module button before saving object to the database
        // The add button is in the same list as the channel-modules,
        // so we must remove it from the list before sending anything to
        // server
        function removeAddModuleButton(channel) {
            channel.modules = _(channel.modules).filter(function (item) {
                return item.id != -1;
            });
        }

        // The server does not send module names with the "module-in-channel"
        // objects. To display the user-friendly name (eg. "Gitlab Milestones"
        // instead of "ses-gitlab-milestones"), we go through the list of
        // module objects, which have the name property, and update it
        // to the module-in-channel objects.
        function setFullNamesToModuleList() {
            if (vm.selectedChannel.modules) {
                vm.selectedChannel.modules.forEach(function(modInCh) {
                    var targetModule = (vm.modules).filter(function(item) {
                        return item.name == modInCh.module;
                    });
                    if (targetModule.length > 0) {
                        modInCh.fullName = targetModule[0].label;
                    }
                });
            }
        }

        // Slugify free-form channel name into url:
        function slugify(text) {
            return text.toString().toLowerCase()
                .replace(/\s+/g, '-') // Replace spaces with -
                .replace(/[^\w\-]+/g, '') // Remove all non-word chars
                .replace(/\-\-+/g, '-') // Replace multiple - with single -
                .replace(/^-+/, '') // Trim - from start of text
                .replace(/-+$/, ''); // Trim - from end of text
        }

    }
})();
