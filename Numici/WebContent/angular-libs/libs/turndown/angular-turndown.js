'use strict';

angular.module('turndown', [])
  .provider('turndown', [function () {
    var opts = {};
    return {
      config: function (newOpts) {
        opts = newOpts;
      },
      $get: function () {
    	var turndownService = new window.TurndownService(opts);
    	turndownService.use(turndownPluginGfm.gfm);
        return turndownService;
      }
    };
  }])
  .filter('turndown', ['turndown', function (turndown) {
    return function (text) {
      return turndown.turndown(text || '');
    };
  }]);
