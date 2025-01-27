/*! angular-flash - v2.5.0 - 2017-07-23
* https://github.com/sachinchoolur/angular-flash
* Copyright (c) 2017 Sachin; Licensed MIT */

'use strict';

var app = angular.module('ngFlash', []);

app.run(['$rootScope', function ($rootScope) {
    return $rootScope.flashes = [];
}]);

app.directive('dynamic', ['$compile', function ($compile) {
    return {
        restrict: 'A',
        replace: true,
        link: function link(scope, ele, attrs) {
            return scope.$watch(attrs.dynamic, function (html) {
                ele.html(html);
                return $compile(ele.contents())(scope);
            });
        }
    };
}]);

app.directive('applytransclude', ['$compile', function ($compile) {
    return {
        restrict: 'A',
        link: function link(scope, ele, attrs) {
            scope._transclude(scope, function (clone, scope) {
                ele.empty().append(clone);
            });
        }
    };
}]);

app.directive('closeFlash', ['$compile', '$rootScope', 'Flash', function ($compile, $rootScope, Flash) {
    return {
        link: function link(scope, ele, attrs) {
            return ele.on('click', function () {
                var id = parseInt(attrs.closeFlash, 10);
                Flash.dismiss(id);
                $rootScope.$apply();
            });
        }
    };
}]);

app.directive('minOrMaximizeFalsh', ['$compile', '$rootScope', 'Flash', function ($compile, $rootScope, Flash) {
    return {
        link: function link(scope, ele, attrs) {
            return ele.on('click', function () {
                var id = parseInt(attrs.minOrMaximizeFalsh, 10);
                Flash.minOrMaximize(id);
                $rootScope.$apply();
            });
        }
    };
}]);

app.directive('flashMessage', ['Flash', function (Flash) {
    return {
        restrict: 'E',
        scope: {
            duration: '=',
            showClose: '=',
            onDismiss: '&',
            name: '@',
            showMinOrMaxFlash: '=',
            isFlashMinimized: '=',
            minOrMaximizeFalsh: '&'
        },
        link: function link(scope, ele, attrs, ctrl, transclude) {
            Flash.setTimeout(scope.duration);
            Flash.setShowClose(scope.showClose);
            function onDismiss(flash) {
                if (typeof scope.onDismiss !== 'function') return;
                scope.onDismiss({ flash: flash });
            }

            Flash.setOnDismiss(onDismiss);

            if (Flash.config.templateTransclude) {
                scope._transclude = transclude;
            }
            function minOrMaximizeFalsh(flash) {
                if (typeof scope.minOrMaximizeFalsh !== 'function') return;
                scope.minOrMaximizeFalsh({ flash: flash });
            }
            Flash.setShowMinOrMaxFlash(scope.showMinOrMaxFlash);
            Flash.setIsFlashMinimized(scope.isFlashMinimized);
            Flash.setMinOrMaximizeFalsh(minOrMaximizeFalsh);
        },
        transclude: Flash.config.templateTransclude,
        template: '\n                <div ng-repeat="flash in $root.flashes track by $index" ng-if="flash.config.container === name" class="alert-container">\n                    ' + Flash.config.template + '\n                </div>\n            '
    };
}]);

app.provider('Flash', function () {
    var defaultConfig = {};
    var templatePresets = {
        bootstrap: {
            html: '\n                <div role="alert" id="{{flash.config.id}}"\n                    class="alert {{flash.config.class}} alert-{{flash.type}} alert-dismissible alertIn alertOut" ng-class="{\'flash-minimized\':flash.isFlashMinimized,\'\':!flash.isFlashMinimized}">\n                    <div type="button" class="close" ng-show="flash.showClose" close-flash="{{flash.id}}">\n                        <span aria-hidden="true">&times;</span>\n                        <span class="sr-only">Close</span>\n                    </div>\n<div type="button" class="min-or-max-flash" ng-show="flash.showMinOrMaxFlash" min-or-maximize-falsh="{{flash.id}}">\n<i class="fa" ng-class="{\'fa-angle-up\':flash.isFlashMinimized,\'fa-angle-down\':!flash.isFlashMinimized}" aria-hidden="true"></i>\n</div>\n<span dynamic="flash.text"></span>\n                </div>',
            transclude: false
        },
        transclude: {
            html: '<div applytransclude></div>',
            transclude: true
        }
    };

    this.setTimeout = function (timeout) {
        if (typeof timeout !== 'number') return;
        defaultConfig.timeout = timeout;
    };
    this.setShowClose = function (value) {
        if (typeof value !== 'boolean') return;
        defaultConfig.showClose = value;
    };
    this.setTemplate = function (template) {
        if (typeof template !== 'string') return;
        defaultConfig.template = template;
    };
    this.setTemplatePreset = function (preset) {
        if (typeof preset !== 'string' || !(preset in templatePresets)) return;

        var template = templatePresets[preset];
        this.setTemplate(template.html);
        defaultConfig.templateTransclude = template.transclude;
    };
    this.setOnDismiss = function (callback) {
        if (typeof callback !== 'function') return;
        defaultConfig.onDismiss = callback;
    };
    this.setAutoDismiss = function (dismiss) {
        if (typeof dismiss !== 'boolean') return;
        defaultConfig.autoDismiss = dismiss;
    };
    this.setShowMinOrMaxFlash = function (value) {
        if (typeof value !== 'boolean') return;
        defaultConfig.showMinOrMaxFlash = value;
    };
    this.setIsFlashMinimized = function (value) {
        if (typeof value !== 'boolean') return;
        defaultConfig.isFlashMinimized = value;
    };
    this.setMinOrMaximizeFalsh = function (callback) {
        if (typeof callback !== 'function') return;
        defaultConfig.minOrMaximizeFalsh = callback;
    };
    
    this.setTimeout(5000);
    this.setShowClose(true);
    this.setTemplatePreset('bootstrap');
    this.setAutoDismiss(false);
    this.setShowMinOrMaxFlash(true);
    this.setIsFlashMinimized(false);
    
    this.$get = ['$rootScope', '$interval', function ($rootScope, $interval) {
        var dataFactory = {};
        var counter = 0;

        dataFactory.setTimeout = this.setTimeout;
        dataFactory.setShowClose = this.setShowClose;
        dataFactory.setOnDismiss = this.setOnDismiss;
        dataFactory.setShowMinOrMaxFlash = this.setShowMinOrMaxFlash;
        dataFactory.setIsFlashMinimized = this.setIsFlashMinimized;
        dataFactory.setMinOrMaximizeFalsh = this.setMinOrMaximizeFalsh;
        dataFactory.config = defaultConfig;

        dataFactory.create = function (type, text, timeout, config, showClose) {
            if ($rootScope.flashes.length === 1 && defaultConfig.autoDismiss) {
                dataFactory.dismiss($rootScope.flashes[0].id);
            }
            if (!text) return false;
            var $this = void 0,
                flash = void 0;
            $this = this;
            flash = {
                type: type,
                text: text,
                config: config,
                id: counter++
            };
            flash.showClose = typeof showClose !== 'undefined' ? showClose : defaultConfig.showClose;
            flash.showMinOrMaxFlash = defaultConfig.showMinOrMaxFlash;
            flash.isFlashMinimized = defaultConfig.isFlashMinimized;
            if (defaultConfig.timeout && typeof timeout === 'undefined') {
                flash.timeout = defaultConfig.timeout;
            } else if (timeout) {
                flash.timeout = timeout;
            }
            $rootScope.flashes.push(flash);
            if (flash.timeout) {
                flash.timeoutObj = $interval(function () {
                    $this.dismiss(flash.id);
                }, flash.timeout, 1);
            }
            return flash.id;
        };
        dataFactory.pause = function (index) {
            if ($rootScope.flashes[index].timeoutObj) {
                $interval.cancel($rootScope.flashes[index].timeoutObj);
            }
        };
        dataFactory.dismiss = function (id) {
            var index = findIndexById(id);
            if (index !== -1) {
                var flash = $rootScope.flashes[index];
                dataFactory.pause(index);
                $rootScope.flashes.splice(index, 1);
                if (typeof defaultConfig.onDismiss === 'function') {
                    defaultConfig.onDismiss(flash);
                }
            }
        };
        dataFactory.minOrMaximize = function (id) {
            var index = findIndexById(id);
            if (index !== -1) {
                var flash = $rootScope.flashes[index];
                //dataFactory.pause(index);
                //$rootScope.flashes.splice(index, 1);
                if (typeof defaultConfig.minOrMaximizeFalsh === 'function') {
                    defaultConfig.minOrMaximizeFalsh(flash);
                }
            }
        };
        dataFactory.clear = function () {
            while ($rootScope.flashes.length > 0) {
                dataFactory.dismiss($rootScope.flashes[0].id);
            }
        };
        dataFactory.reset = dataFactory.clear;
        function findIndexById(id) {
            return $rootScope.flashes.map(function (flash) {
                return flash.id;
            }).indexOf(id);
        }

        return dataFactory;
    }];
});
//# sourceMappingURL=angular-flash.js.map
