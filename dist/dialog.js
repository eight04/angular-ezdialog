(function(){

"use strict";

function getParentByClass(element, cls){
	while (element[0].parentNode) {
		element = element.parent();
		if (element.hasClass(cls)) {
			return element;
		}
	}
	return null;
}

angular.module("ezdialog", ["ngAnimate"])
	.factory("ezmodal", ["$compile", "$rootScope", "$document", "$timeout", "$q",
			function($compile, $rootScope, $document, $timeout, $q){
		var modalCtrl, modalStack = $compile("<ezdialog-modal/>")($rootScope), modals = {};
		$document.find("body").append(modalStack);
		
		// You can't access modalCtrl before DOM update.
		$timeout(function(){
			modalCtrl = modalStack.controller("ezdialogModal");
		});
		
		$document.on("keydown", function(e){
			var modal, inputs, dirty, next, i;
			if (!modalCtrl || !(modal = modalCtrl.top()) || e.ctrlKey || e.altKey) {
				return;
			}
			
			if (e.keyCode == 27 && !e.shiftKey) {
				$rootScope.$apply(function(){
					modal.instance.close();
				});
				e.preventDefault();
			}
			
			if (e.keyCode == 13 && !modal.fake && !e.shiftKey) {
				$rootScope.$apply(function(){
					modalCtrl.ok(modal);
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
		
		function init(dialog) {
			var deferred = $q.defer();
			var instance = {
				close: function(ret){
					modalCtrl.remove(dialog);
					deferred.resolve(ret);
				},
				result: deferred.promise
			};
			
			if (!dialog.callback) {
				dialog.callback = {};
			}
			
			dialog.instance = instance;
		}
		
		return {
			open: function(dialog){
				init(dialog);
				
				modalCtrl.add(dialog);
				return dialog.instance;
			},
			register: function(dialog){
				modals[dialog.id] = dialog;
			},
			toggle: function(arg){
				var dialog;
				if (angular.isString(arg)) {
					dialog = modals[arg];
				} else if (angular.isObject(arg)) {
					dialog = arg;
				}
				
				init(dialog);
				
				if (dialog.isOpened) {
					modalCtrl.remove(dialog);
				} else {
					modalCtrl.add(dialog);
				}
			}
		};
	}])
	.directive("ezdialogModal", ["$animate", "$timeout", function($animate, $timeout){
		return {
			restrict: "E",
			template: 
				"<div class=\"modal-backdrop in\" ng-style=\"{'z-index': getBackdropZ()}\" ng-if=\"dialogs.length\" ng-destroy=\"backdropCleanup()\"></div>\
				<div class=\"modal modal-{{dialog.type}}\" ng-repeat=\"dialog in dialogs | filter:isDialog\" ng-style=\"{'z-index': dialog.zIndex}\"><!--\
					--><div class=\"modal-dialog modal-{{dialog.size}}\" tabindex=\"-1\" role=\"dialog\">\
						<div class=\"modal-content\">\
							<form role=\"form\" name=\"form\">\
								<div class=\"modal-header\">\
									<h3 class=\"modal-title\">{{dialog.title}}</h3>\
								</div>\
								<div class=\"modal-body ezdialog-body\"></div>\
								<div class=\"modal-footer\">\
									<button class=\"btn btn-{{dialog.type}}\" ng-click=\"ok(dialog)\" type=\"submit\" ng-if=\"dialog.yes!==undefined\" ng-disabled=\"form.$invalid\">{{dialog.yes}}</button>\
									<button class=\"btn btn-default\" ng-click=\"cancel(dialog)\" type=\"button\" ng-if=\"dialog.no!==undefined\">{{dialog.no}}</button>\
								</div>\
							</form>\
						</div>\
					</div>\
				</div>",
			scope: {},
			controller: ["$scope", "$document", function($scope, $document){
				$scope.dialogs = [];
				
				$scope.getBackdropZ = function(){
					var last = $scope.dialogs.length - 1;
					if (last >= 0) {
						return $scope.dialogs[last].zIndex - 1;
					}
					return 1399;
				};
				
				$scope.isDialog = function(dialog){
					return !dialog.fake;
				};

				$scope.backdropCleanup = function(){
					$document.find("body")
						.removeClass("modal-open")
						.css("padding-right", "");
				};
				
				this.ok = $scope.ok = function(dialog){
					if (dialog.callback.ok) {
						dialog.callback.ok.call(dialog.instance);
					} else {
						dialog.instance.close(true);
					}
				};
				
				this.cancel = $scope.cancel = function(dialog){
					if (dialog.callback.cancel) {
						dialog.callback.cancel.call(dialog.instance);
					} else {
						dialog.instance.close(false);
					}
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
					
					if (dialog.fake) {
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
					
					if (dialog.fake) {
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
			}]
		};
	}])
	.directive("ezdialogBody", function(){
		return {
			restrict: "C",
			scope: true,
			template: "\
				<span style=\"white-space: pre-wrap;\" ng-if=\"!dialog.template && !dialog.loaded\">{{dialog.msg}}</span>\
				<span style=\"white-space: pre-wrap;\" ng-if=\"dialog.template && !dialog.loaded\">{{dialog.error || dialog.msg}}</span>\
				<ng-include src=\"dialog.template\" onload=\"dialog.loaded=true\" ng-if=\"dialog.template\" />",
			link: function(scope, element){
				var dialog = scope.dialog, i, keys;
				
				if (!dialog.element) {
					dialog.element = getParentByClass(element, "modal");
				}
				
				if (!dialog.scope.param) {
					dialog.scope.param = dialog.param;
				}
				
				keys = Object.keys(dialog.scope);
				for (i = 0; i < keys.length; i++) {
					scope[keys[i]] = dialog.scope[keys[i]];
				}
			}
		};
	})
	.factory("ezdialog", ["ezmodal", function($modal){
		var conf = {
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
			backdrop: "static"
		};
	
		function dialog(opt){
			var onclose = null, callback = {}, instance;
			
			opt.size = opt.size || conf.size;
			opt.callback = callback;
			opt.scope = opt.scope || {};
			instance = $modal.open(opt);
			
			instance.result.then(function(value){
				if (onclose) {
					onclose(value);
				}
			});
			
			function close(func){
				onclose = func;
				
				return this;
			}
			
			function ok(func){
				callback.ok = func;
				return this;
			}
			
			function cancel(func){
				callback.cancel = func;
				return this;
			}
			
			function addCallback(o){
				angular.extend(callback, o);
				return this;
			}
			
			return {
				close: close,
				ok: ok,
				cencel: cancel,
				callback: addCallback,
				instance: instance
			};
		}
		
		function error(msg, title){
			var opt = {
				title: title || conf.title.error,
				msg: msg || conf.msg.error,
				yes: conf.btn.ok,
				type: "danger"
			};
			if (typeof msg == "object") {
				opt.msg = conf.msg.error;
				angular.extend(opt, msg);
			}
			return dialog(opt);
		}
		
		function confirm(msg, title){
			var opt = {
				title: title || conf.title.confirm,
				msg: msg || conf.msg.confirm,
				yes: conf.btn.ok,
				no: conf.btn.cancel,
				type: "primary"
			};
			if (typeof msg == "object") {
				opt.msg = conf.msg.confirm;
				angular.extend(opt, msg);
			}
			return dialog(opt);
		}
			
		function yesno(msg, title){
			var opt = {
				title: title || conf.title.yesno,
				msg: msg || conf.msg.yesno,
				yes: conf.btn.yes,
				no: conf.btn.no,
				type: "primary"
			};
			if (typeof msg == "object") {
				opt.msg = conf.msg.yesno;
				angular.extend(opt, msg);
			}
			return dialog(opt);
		}
		
		function show(msg, title){
			var opt = {
				title: title || conf.title.show,
				msg: msg || conf.msg.show,
				yes: conf.btn.ok,
				type: "primary"
			};
			if (typeof msg == "object") {
				opt.msg = conf.msg.show;
				angular.extend(opt, msg);
			}
			return dialog(opt);
		}
		
		function create(opt){
			// raw dialog
			return dialog(opt);
		}
		
		function setConf(opt){
			angular.extend(conf, opt);
			return this;
		}
		
		return {
			error: error,
			confirm: confirm,
			yesno: yesno,
			show: show,
			create: create,
			conf: setConf
		};
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
	.directive("ezmodal", ["ezmodal", function(ezmodal){
		return {
			restrict: "E",
			transclude: true,
			template: 
				'<div class="modal-dialog" tabindex="-1" role="dialog">\
					<div class="modal-content" ng-transclude></div>\
				</div>',
			scope: {
				id: "@",
				size: "@",
				backdropToggle: "@"
			},
			link: function(scope, element, attrs){
				var fakeDialog = {
					fake: true,
					size: attrs.size,
					id: attrs.id,
					element: element
				};
				element.addClass("modal");
				if (attrs.size) {
					angular.element(element[0].querySelector(".modal-dialog")).addClass("modal-" + attrs.size);
				}
				if (attrs.backdropToggle !== undefined) {
					element.on("click", function(e){
						if (e.target == this) {
							scope.$apply(function(){
								ezmodal.toggle(fakeDialog);
							});
						}
					});
				}
				ezmodal.register(fakeDialog);
			}
		};
	}])
	.directive("ezmodalToggle", ["ezmodal", function(ezmodal){
		return {
			restrict: "A",
			link: function(scope, element, attrs){
				element.on("click", function(){
					scope.$apply(function(){
						var id = attrs.ezmodalToggle;
						ezmodal.toggle(id);
					});
				});
			}
		};
	}]);

})();
