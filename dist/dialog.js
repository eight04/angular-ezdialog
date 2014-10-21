(function(){

"use strict";

angular.module("ezdialog", ["ngAnimate"])
	.directive("ezdialogStack", ["$animate", "$timeout", "ezdialog", function($animate, $timeout, ezdialog){
		return {
			restrict: "A",
			templateUrl: "templates/ezdialogStack.html",
			scope: {},
			controller: ["$scope", "$document", function($scope, $document){
				$scope.dialogs = [];
				
				$scope.default = ezdialog.conf;
				
				$scope.backdropToggle = function(dialog){
					if (dialog.toggleBackdrop) {
						dialog.close();
					}
				};
				
				$scope.getBackdropZ = function(){
					var last = $scope.dialogs.length - 1;
					if (last >= 0) {
						return $scope.dialogs[last].zIndex - 1;
					}
					return 1399;
				};

				$scope.backdropCleanup = function(){
					$document.find("body")
						.removeClass("modal-open")
						.css("padding-right", "");
				};
				
				this.add = function(dialog){
					var body = $document.find("body"), scrWidth;
					if (!$scope.dialogs.length && !body.hasClass("modal-open")) {
						scrWidth = window.innerWidth - document.body.clientWidth;
						body.addClass("modal-open").css("padding-right", scrWidth + "px");
					}
					
					var last = $scope.dialogs.length - 1;
					if (last >= 0) {
						dialog.zIndex = $scope.dialogs[last].zIndex + 10;
					} else {
						dialog.zIndex = 1400;
					}
					
					dialog.isOpened = true;
					
					if (!dialog.isDialog) {
						dialog.element.css("z-index", dialog.zIndex);
						$animate.addClass(dialog.element, "show");
					}
					
					$scope.dialogs.push(dialog);
					
					$timeout(function(){
						var modalDialog = dialog.element[0].querySelector(".modal-dialog");
						modalDialog.style.outline = "none";
						var eles = modalDialog.querySelectorAll("input, textarea, button"), i;
						for (i = 0; i < eles.length; i++) {
							if (eles[i].autofocus) {
								eles[i].focus();
								return;
							}
						}
						modalDialog.focus();
					});
				};
				
				this.remove = function(dialog){
					var k = $scope.dialogs.indexOf(dialog);
					if (k < 0) {
						return;
					}
					
					dialog.isOpened = false;
					
					if (!dialog.isDialog) {
						$animate.removeClass(dialog.element, "show");
					}
					
					$scope.dialogs.splice(k, 1);
				};
				
				this.top = function(){
					var last = $scope.dialogs.length - 1;
					if (last < 0) {
						return null;
					}
					return $scope.dialogs[last];
				};
				
				this.open = function(dialog){
					dialog.isDialog = true;
					this.add(dialog);
				};
			}]
		};
	}])
	.directive("ezdialogBody", ["$templateCache", "$compile", function($templateCache, $compile){
		return {
			restrict: "A",
			scope: {
				ezdialogBody: "="
			},
			link: function(scope, element){
				var dialog = scope.ezdialogBody;
				var template = $templateCache.get(dialog.template);
				element.html(template);
				$compile(element.contents())(dialog.scope);
			}
		};
	}])
	.factory("ezdialog", ["$rootScope", "$compile", "$timeout", "$document", "$q",
			function($rootScope, $compile, $timeout, $document, $q){
		var dialogStack,
			dialogStackElement = $compile("<div ezdialog-stack />")($rootScope),
			dialogs = {};
			
		angular.element(document.body).append(dialogStackElement);
		
		// You can't access modalCtrl before DOM update.
		$timeout(function(){
			dialogStack = dialogStackElement.controller("ezdialogStack");
		});
		
		$document.on("keydown", function(e){
			var modal, inputs, dirty, next, i;
			if (!dialogStack || !(modal = dialogStack.top()) || e.ctrlKey || e.altKey) {
				return;
			}
			
			if (e.keyCode == 27 && !e.shiftKey) {
				$rootScope.$apply(function(){
					modal.close();
				});
				e.preventDefault();
			}
			
			if (e.keyCode == 13 && !modal.fake && !e.shiftKey) {
				$rootScope.$apply(function(){
					modal.ok();
				});
				e.preventDefault();
			}
			
			if (e.keyCode == 9) {
				inputs = modal.element[0].querySelectorAll("input, select, button, textarea, a, [tabindex]");
				for (i = 0; i < inputs.length; i++) {
					if (inputs[i] == document.activeElement) {
						if (!e.shiftKey) {
							next = (i + 1) % inputs.length;
						} else {
							next = (i - 1 + inputs.length) % inputs.length;
						}
						inputs[next].focus();
						dirty = true;
						break;
					}
				}
				if (!dirty && inputs.length) {
					inputs[0].focus();
				}
				e.preventDefault();
			}
		});

		var scope = {};
		
		var conf = scope.conf = {
			btn: {
				ok: "OK",
				cancel: "Cancel",
				yes: "Yes",
				no: "No"
			},
			title: {
				show: "Info",
				confirm: "Confirm",
				yesno: "Confirm",
				error: "Error"
			},
			msg: {
				show: "Hi!",
				confirm: "Are you sure?",
				yesno: "Yes or no?",
				error: "An error occurred!"
			},
			size: "sm",
			toggleBackdrop: false,
			handleEnter: true
		};
		
		var init = scope.init = function(dialog) {
			switch (dialog.use) {
				case "show":
				case "error":
					dialog.yes = dialog.yes || conf.btn.ok;
					break;
					
				case "confirm":
					dialog.yes = dialog.yes || conf.btn.ok;
					dialog.no = dialog.no || conf.btn.cancel;
					break;
					
				case "yesno":
					dialog.yes = dialog.yes || conf.btn.yes;
					dialog.no = dialog.no || conf.btn.no;
					break;
			}
			
			if (dialog.use == "error") {
				dialog.type = "danger";
			} else if (dialog.use) {
				dialog.type = "primary";
			} else {
				dialog.type = "default";
			}
			
			dialog.deferred = $q.defer();
			
			var promise = dialog.deferred.promise;
			
			promise.ok = function(func){
				dialog.onok = func;
			};
			
			promise.cancel = function(func){
				dialog.oncancel = func;
			};
			
			promise.close = function(func){
				dialog.onclose = func;
			};
			
			promise.instance = dialog;
			
			dialog.close = function(value){
				if (dialog.onclose) {
					dialog.onclose(dialog.realClose);
				} else {
					dialog.realClose(value);
				}
			};
			
			dialog.ok = function() {
				if (dialog.onok) {
					dialog.onok(dialog.realClose);
				} else {
					dialog.realClose(true);
				}
			};
			
			dialog.cancel = function() {
				if (dialog.oncancel) {
					dialog.oncancel(dialog.realClose);
				} else {
					dialog.realClose(false);
				}
			};
			
			dialog.realClose = function(value){
				dialogStack.remove(dialog);
				dialog.deferred.resolve(value);
			};
		};
		
		function create(arg, title, use){
			var dialog = {
				use: use
			};
			if (angular.isString(arg)) {
				dialog.msg = arg;
				dialog.title = title;
			} else if (angular.isObject(arg)) {
				angular.extend(dialog, arg);
			}
			
			init(dialog);
			
			dialogStack.open(dialog);
			
			return dialog.deferred.promise;
		}
		
		scope.error = function(arg, title){
			return create(arg, title, "error");
		};
		
		scope.confirm = function(arg, title){
			return create(arg, title, "confirm");
		};
		
		scope.yesno = function(arg, title){
			return create(arg, title, "yesno");
		};
		
		scope.show = function(arg, title){
			return create(arg, title, "show");
		};
		
		scope.register = function(dialog){
			dialogs[dialog.id] = dialog;
		};
		
		scope.toggle = function(id){
			var dialog = dialogs[id];
			
			if (!dialog.isOpened) {
				dialogStack.add(dialog);
			} else {
				dialogStack.remove(dialog);
			}
		};
		
		return scope;
	}])
	.directive("ngDestroy", function(){
		return {
			restrict: "A",
			scope: {
				ngDestroy: "&"
			},
			link: function(scope, element){
				element.on("$destroy", function(){
					scope.ngDestroy();
				});
			}
		};
	})
	.directive("ezdialogToggle", ["ezdialog", function(ezdialog){
		return {
			restrict: "A",
			link: function(scope, element, attrs){
				element.on("click", function(){
					scope.$apply(function(){
						var id = attrs.ezdialogToggle;
						ezdialog.toggle(id);
					});
				});
			}
		};
	}])
	.directive("ezdialog", ["ezdialog", function(ezdialog){
		return {
			restrict: "A",
			transclude: true,
			templateUrl: "templates/ezdialog.html",
			scope: {
				id: "@ezdialog",
				size: "@",
				backdropToggle: "@",
				title: "@",
				type: "@",
				use: "@",
				onclose: "&",
				oncancel: "&",
				onok: "&",
				yes: "@",
				no: "@"
			},
			link: function(scope, element){
				if (!scope.id) {
					throw "ezdialog directive requires 'id' attribute";
				}
				
				scope.default = ezdialog.configure;
				scope.element = element;
				
				if (scope.backdropToggle === undefined) {
					scope.backdropToggle = false;
				} else {
					scope.backdropToggle = true;
				}
				
				ezdialog.init(scope);
				
				element.addClass("modal modal-" + scope.type);

				element.on("click", function(e){
					if (e.target == this && scope.backdropToggle) {
						scope.$apply(function(){
							scope.close();
						});
					}
				});
				
				ezdialog.register(scope);
			}
		};
	}])
	.directive("ezdialogBindElement", function(){
		return {
			restrict: "A",
			scope: {
				dialog: "=ezdialogBindElement"
			},
			link: function(scope, element){
				if (!scope.dialog.element) {
					scope.dialog.element = element;
				}
			}
		};
	});

})();
angular.module('ezdialog').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/ezdialog.html',
    "<div class=\"modal-dialog\" ng-class=\"'modal-' + (size || default.size)\" tabindex=\"-1\" role=\"dialog\"><div class=\"modal-content\"><form role=\"form\" name=\"form\"><div class=\"modal-header\"><h3 class=\"modal-title\">{{title || default.title[type]}}</h3></div><div class=\"modal-body\" ng-transclude></div><div class=\"modal-footer\"><button class=\"btn\" ng-class=\"'btn-' + theme\" ng-click=\"ok()\" type=\"submit\" ng-if=\"yes!==undefined\" ng-disabled=\"form.$invalid\">{{yes}}</button> <button class=\"btn btn-default\" ng-click=\"cancel()\" type=\"button\" ng-if=\"no!==undefined\">{{no}}</button></div></form></div></div>"
  );


  $templateCache.put('templates/ezdialogStack.html',
    "<div class=\"modal-backdrop in\" ng-style=\"{'z-index': getBackdropZ()}\" ng-if=\"dialogs.length\" ng-destroy=\"backdropCleanup()\"></div><div class=\"modal show\" ng-class=\"'modal-' + (dialog.type || 'default')\" ng-repeat=\"dialog in dialogs | filter:{isDialog:true}\" ng-style=\"{'z-index': dialog.zIndex}\" ng-click=\"backdropToggle(dialog)\" ezdialog-bind-element=\"dialog\"><div class=\"modal-dialog\" ng-class=\"'modal-' + (dialog.size || default.size)\" tabindex=\"-1\" role=\"dialog\"><div class=\"modal-content\"><form role=\"form\" name=\"form\"><div class=\"modal-header\"><h3 class=\"modal-title\">{{dialog.title || default.title[dialog.use]}}</h3></div><div class=\"modal-body\"><span style=\"white-space: pre-wrap\" ng-if=\"!dialog.template && !dialog.loaded\">{{dialog.msg}}</span> <span style=\"white-space: pre-wrap\" ng-if=\"dialog.template && !dialog.loaded\">{{dialog.error || dialog.msg}}</span><div ezdialog-body ng-if=\"dialog.template\"></div></div><div class=\"modal-footer\"><button class=\"btn\" ng-class=\"'btn-' + (dialog.type || 'default')\" ng-click=\"dialog.ok()\" ng-if=\"dialog.yes !== undefined\" ng-disabled=\"form.$invalid\">{{dialog.yes}}</button> <button class=\"btn btn-default\" ng-click=\"dialog.cancel()\" type=\"button\" ng-if=\"dialog.no !== undefined\">{{dialog.no}}</button></div></form></div></div></div>"
  );

}]);
