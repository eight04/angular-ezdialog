(function(){

"use strict";

angular.module("ezdialog", ["ngAnimate"])
	.directive("ezdialogStack", ["$animate", "$timeout", function($animate, $timeout){
		return {
			restrict: "A",
			templateUrl: "templates/ezdialogStack.html",
			scope: {},
			controller: ["$scope", "$document", "ezdialog", function($scope, $document, ezdialog){
				$scope.dialogs = [];
				
				$scope.default = ezdialog.conf;
				
				$scope.backdropToggle = function(dialog){
					if (dialog.toggleBackdrop) {
						dialog.cancel();
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
	.directive("ezdialogCopyScope", function(){
		return {
			restrict: "A",
			scope: true,
			link: function(scope){
				var dialog = scope.dialog, keys, i;
				
				if (!dialog.scope) {
					return;
				}
				
				keys = Object.keys(dialog.scope);
				for (i = 0; i < keys.length; i++) {
					scope[keys[i]] = dialog.scope[keys[i]];
				}
			}
		};
	})
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
					modal.cancel();
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
		
		scope.conf = {
			btn: {
				show: {
					yes: "OK"
				},
				confirm: {
					yes: "OK",
					no: "Cancel"
				},
				yesno: {
					yes: "Yes",
					no: "No"
				},
				error: {
					yes: "OK"
				}
			},
			title: {
				show: "Info",
				confirm: "Confirm",
				yesno: "Question",
				error: "Error"
			},
			msg: {
				show: "Hi!",
				confirm: "Are you sure?",
				yesno: "Yes or no?",
				error: "An error occurred!"
			},
			type: {
				show: "info",
				confirm: "primary",
				yesno: "warning",
				error: "danger"
			},
			size: "sm",
			toggleBackdrop: false
		};
		
		var init = scope.init = function(dialog) {		
			dialog.deferred = $q.defer();
			
			var promise = dialog.deferred.promise;
			
			promise.ok = function(func){
				dialog.onok = func;
				return this;
			};
			
			promise.cancel = function(func){
				dialog.oncancel = func;
				return this;
			};
			
			promise.close = function(func){
				dialog.onclose = func;
				return this;
			};
			
			promise.instance = dialog;
			
			dialog.close = function(value){
				if (!dialog.onclose || dialog.onclose(value) !== false) {
					dialog.realClose(value);
				}
			};
			
			dialog.ok = function() {
				if (dialog.onok) {
					dialog.onok(dialog.close);
				} else {
					dialog.close(true);
				}
			};
			
			dialog.cancel = function() {
				if (dialog.oncancel) {
					dialog.oncancel(dialog.close);
				} else {
					dialog.close(false);
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
				// dialogStack.remove(dialog);
				dialog.cancel();
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
				title: "@ezdialogTitle",
				type: "@",
				use: "@",
				onclose: "&",
				oncancel: "&",
				onok: "&",
				yes: "@",
				no: "@"
			},
			link: function(scope, element, attrs) {
				scope.default = ezdialog.conf;

				if (attrs.backdropToggle === undefined) {
					scope.backdropToggle = false;
				} else {
					scope.backdropToggle = true;
				}
				
				if (!attrs.onok) {
					scope.onok = null;
				} else {
					scope.onok = function(func){
						return function(){
							func({$dialog: scope});
						};
					}(scope.onok);
				}
				
				if (!attrs.oncancel) {
					scope.oncancel = null;
				} else {
					scope.oncancel = function(func){
						return function(){
							func({$dialog: scope});
						};
					}(scope.oncancel);
				}

				if (!attrs.onclose) {
					scope.onclose = null;
				} else {
					scope.onclose = function(func){
						return function(value){
							var prevented = false,
								event = {
									data: value,
									preventDefault: function(){
										prevented = true;
									}
								};
							func({$event: event, $dialog: scope});
							if (prevented) {
								return false;
							}
						};
					}(scope.onclose);
				}
				
				ezdialog.init(scope);
			
				scope.element = element;
				
				element.addClass("modal modal-" + (scope.type || scope.default.type[scope.use] || "default"));
				
				element.on("click", function(e){
					if (e.target == this && scope.backdropToggle) {
						scope.$apply(function(){
							scope.cancel();
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
    "<div class=\"modal-dialog\" ng-class=\"'modal-' + (size || default.size)\" tabindex=\"-1\" role=\"dialog\"><div class=\"modal-content\"><form role=\"form\" name=\"form\"><div class=\"modal-header\"><button class=\"close\" ng-click=\"cancel()\">&times; <span class=\"sr-only\">Close dialog</span></button><h4 class=\"modal-title\">{{title || default.title[use]}}</h4></div><div class=\"modal-body\" ng-transclude></div><div class=\"modal-footer\"><button class=\"btn\" ng-class=\"'btn-' + (type || default.type[use])\" ng-click=\"ok()\" type=\"submit\" ng-if=\"yes !== undefined || !!default.btn[use].yes\" ng-disabled=\"form.$invalid\">{{yes || default.btn[use].yes}}</button> <button class=\"btn btn-default\" ng-click=\"cancel()\" type=\"button\" ng-if=\"no !== undefined || !!default.btn[use].no\">{{no || default.btn[use].no}}</button></div></form></div></div>"
  );


  $templateCache.put('templates/ezdialogStack.html',
    "<div class=\"modal-backdrop in\" ng-style=\"{'z-index': getBackdropZ()}\" ng-if=\"dialogs.length\" ng-destroy=\"backdropCleanup()\"></div><div class=\"modal show\" ng-class=\"'modal-' + (dialog.type || default.type[dialog.use] || 'default')\" ng-repeat=\"dialog in dialogs | filter:{isDialog:true}\" ng-style=\"{'z-index': dialog.zIndex}\" ng-click=\"backdropToggle(dialog)\" ezdialog-bind-element=\"dialog\"><div class=\"modal-dialog\" ng-class=\"'modal-' + (dialog.size || default.size)\" tabindex=\"-1\" role=\"dialog\"><div class=\"modal-content\"><form role=\"form\" name=\"form\"><div class=\"modal-header\"><button class=\"close\" ng-click=\"dialog.cancel()\">&times; <span class=\"sr-only\">Close dialog</span></button><h4 class=\"modal-title\">{{dialog.title || default.title[dialog.use]}}</h4></div><div class=\"modal-body\"><span style=\"white-space: pre-wrap\" ng-if=\"!dialog.template && !dialog.loaded\">{{dialog.msg || default.msg[dialog.use]}}</span> <span style=\"white-space: pre-wrap\" ng-if=\"dialog.template && !dialog.loaded\">{{dialog.error || dialog.msg}}</span><div ezdialog-copy-scope ng-if=\"dialog.template\" ng-include=\"dialog.template\"></div></div><div class=\"modal-footer\"><button class=\"btn\" ng-class=\"'btn-' + (dialog.type || default.type[dialog.use] || 'default')\" ng-click=\"dialog.ok()\" ng-if=\"dialog.yes !== undefined || !!default.btn[dialog.use].yes\" ng-disabled=\"form.$invalid\">{{dialog.yes || default.btn[dialog.use].yes}}</button> <button class=\"btn btn-default\" ng-click=\"dialog.cancel()\" type=\"button\" ng-if=\"dialog.no !== undefined || !!default.btn[dialog.use].no\">{{dialog.no || default.btn[dialog.use].no}}</button></div></form></div></div></div>"
  );

}]);
