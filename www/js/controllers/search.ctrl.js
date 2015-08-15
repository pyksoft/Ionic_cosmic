// Search
angular.module('cosmic.controllers').controller('SearchCtrl', function($scope,$q, cosmicDB,cosmicConfig,cosmicPlayer,$ionicViewSwitcher,$state,$timeout,$ionicPopover,$cordovaToast) {
    $scope.miniaturesPath = cosmicConfig.appRootStorage + 'miniatures/';

    // Focus on search
    $timeout(function(){
        var searchElement = angular.element(document.getElementById('search-input'));
        cordova.plugins.Keyboard.show();
        searchElement[0].focus();
    },150);

    // Watch for search update
    $scope.$watch('search',function(){
        var search = $scope.search;
        if (search){
            $timeout(function(){
                searchInDB(search);
            }, 400);
        } else {
            $scope.titles=[];
        }

    });

    $scope.cancel = function(){
        $scope.hideKeyboard();
        $scope.search = '';
        $scope.titles = [];
    };

    // Hide keyboard on enter
    $scope.hideKeyboard = function(){
        console.log('hideKeyboard');
        cordova.plugins.Keyboard.close();
    };

    $scope.playTitle = function (title){
        cosmicPlayer.loadPlaylist($scope.titles);
        cosmicPlayer.launchPlayer(title);
        $ionicViewSwitcher.nextDirection('forward');
        $state.go('player');
    };

    // Search function
    var searchInDB = function(search){
        if (search == $scope.search && search.length>0){
            console.log('Search: '+search);
            cosmicDB.search(search).then(function(titles){
                $scope.titles = titles;
            });
        }
    };

    // Popover
    var selectedTitle;
    var event;
    $scope.showPopover = function(ev,title){
        ev.stopPropagation();
        event = ev;
        selectedTitle = title;
        $ionicPopover.fromTemplateUrl('templates/title-popover.html', {
            scope: $scope,
        }).then(function(popover) {
            $scope.popover = popover;
            $scope.popover.show(event);

            // add the title to an existing playlist
            $scope.addToPlaylist = function(){
                console.log('add to playlist');
                $scope.popover.hide();
                $ionicPopover.fromTemplateUrl('templates/select-playlist-popover.html', {
                    scope: $scope,
                }).then(function() {
                    // Get playlists
                    cosmicDB.getPlaylistsNames().then(function(playlists){
                        $scope.playlists = playlists;
                        $scope.popover=popover;
                        $scope.popover.show(event);
                        $scope.addTitleToPlaylist = function(playlistId){
                            cosmicDB.addTitleToPlaylist(playlistId,selectedTitle.id).then(function(){
                                $cordovaToast.showShortTop('Done !');
                                $scope.popover.hide();
                            });
                        };
                    });

                });

            };
            // Add the current title as next on the current playlist
            $scope.addNext = function(){
                console.log('select title : ');
                cosmicPlayer.setNext(selectedTitle);
                $scope.popover.hide();
                $cordovaToast.showShortTop('Done !');
            };
        });
    };

    var destroy = true;
    $scope.$on('popover.hidden', function(){
        console.log('destroyPopover');
        if (destroy){
            destroy = false;
            $scope.popover.remove().then(function(){
                $scope.popover = null;
                destroy = true;
            });
        }
    });
});


