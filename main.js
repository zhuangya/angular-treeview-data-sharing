'use strict';

var playApp = angular.module('playApp', []);

playApp.controller('StageCtrl', function($scope, $http, ShareService) {
  $scope.selectedTags = [];
  // 获得数据
  $http.get('./tree.json').success(function(resp) {
    $scope.tree = resp;
  });

  // some event driven :P
  $scope.$on('handleBroadcast', function() {
    $scope.tags = ShareService.tags;
  });

});

// 新建一个用来分享数据的 Service ，使用的是 `$rootScope` 提供的方法
playApp.factory('ShareService', function($rootScope) {
  var share = {};

  // 分享的 `tags` 统一存储在这里
  share.tags = [];

  // 增加 `tag` 的时候调用的方法
  share.addTag = function(t) {
    this.tags.push({
      name: t.name,
      id: t.id
    });
    this.broadcastItem();
  };

  // 每当有数据改动的时候，调用 `broadcastItem` 的方法就可以通知到程序的所有地方
  share.broadcastItem = function() {
    $rootScope.$broadcast('handleBroadcast');
  };
  return share;
});

playApp.directive('tagTree', function() {
  return {
    restrict: 'A', // 限定为 attribute
    scope: {
      tree: '='
    },
    template: '<ul class="box"><div branch tree="t" ng-repeat="t in tree"></div></ul>'
  };
});

// 引入 ShareService ，用来共享数据
playApp.directive('branch', function($compile, ShareService) {
  return {
    restrict: 'A',
    scope: {
      tree: '='
    },
    template: '<li><button ng-click="pick(tree)">{{tree.name}}</button></li>',
    controller: function($scope) {
      $scope.pick = function(what) {
        // 使用这个方法来增加 `tag`
        ShareService.addTag(what);
      };
    },
    link: function(scope, element) {
      if(scope.tree.sub && scope.tree.sub.length) {
        var childTree = $compile('<div class="target" tag-tree tree="tree.sub"></div>')(scope);
        element.append(childTree);
      }
    }
  };
});

