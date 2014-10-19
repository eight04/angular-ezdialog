/* global angular */
/* eslint eqeqeq: 0, quotes: 0, no-multi-str: 0 */

angular.module("ezdialog", ["ngAnimate"])
	.run(function($templateCache){
		$templateCache.put("ezdialog/modalTemplate.html", "\
			<div class=\"modal-backdrop in\" ng-style=\"{'z-index': 1400 + dialogs.length * 10 - 11}\" ng-if=\"dialogs.length\" ng-destroy=\"backdropCleanup()\"></div>\
			<div class=\"modal modal-{{dialog.type}}\" ng-repeat=\"dialog in dialogs\" ng-style=\"{'z-index': 1400 + $index * 10}\"><!--\
			 --><div class=\"modal-dialog modal-{{dialog.size}}\">\
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
			</div>"
		);
	})
	.factory("ezmodal", function($templateCache, $compile, $rootScope, $document, $timeout, $q){
		var modalCtrl, modalStack = $compile("<ezdialog-modal/>")($rootScope);
		$document.find("body").append(modalStack);
		
		// You can't access modalCtrl before DOM update.
		$timeout(function(){
			modalCtrl = modalStack.controller("ezdialogModal");
		});
		
		$document.bind("keydown", function(e){
			var modal;
			if (!modalCtrl || !(modal = modalCtrl.top())) {
				return;
			}
			
			if (e.keyCode == 27) {
				$rootScope.$apply(function(){
					modal.instance.close();
				});
				e.preventDefault();
			}
			
			if (e.keyCode == 13) {
				$rootScope.$apply(function(){
					modalCtrl.ok(modal);
				});
				e.preventDefault();
			}
		});
		
		return {
			open: function(dialog){
				var deferred = $q.defer();
				var instance = {
					close: function(ret){
						modalCtrl.remove(dialog);
						deferred.resolve(ret);
					},
					result: deferred.promise
				};
				
				dialog.instance = instance;
				
				modalCtrl.add(dialog);
				
				return instance;
			}
		}
	})
	.directive("ezdialogModal", function($animate){
		return {
			restrict: "E",
			templateUrl: "ezdialog/modalTemplate.html",
			scope: {},
			controller: function($scope, $element, $document){
				$scope.dialogs = [];

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
					var body = $document.find("body");
					if (!$scope.dialogs.length && !body[0].classList.contains("modal-open")) {
						var scrWidth = window.innerWidth - document.body.clientWidth;
						body.addClass("modal-open").css("padding-right", scrWidth + "px");
					}
					
					$scope.dialogs.push(dialog);
				};
				
				this.remove = function(dialog){
					var k = $scope.dialogs.indexOf(dialog);
					if (k < 0) {
						return;
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
			}
		};
	})
	.directive("ezdialogBody", function($http, $templateCache, $compile, $timeout){
		return {
			restrict: "C",
			scope: true,
			template: "\
				<span style=\"white-space: pre-wrap;\" ng-if=\"!dialog.template && !dialog.loaded\">{{dialog.msg}}</span>\
				<span style=\"white-space: pre-wrap;\" ng-if=\"dialog.template && !dialog.loaded\">{{dialog.error || dialog.msg}}</span>\
				<ng-include src=\"dialog.template\" onload=\"dialog.loaded=true\" ng-if=\"dialog.template\" />",
			link: function(scope, element, attrs){
				var dialog = scope.dialog, i, keys;
				
				if (!dialog.scope.param) {
					dialog.scope.param = dialog.param;
				}
				
				keys = Object.keys(dialog.scope);
				for (i = 0; i < keys.length; i++) {
					scope[keys[i]] = dialog.scope[keys[i]];
				}
				
				$timeout(function(){
					var eles = element.parent("form").find("input"), i;
					for (i = 0; i < eles.length; i++) {
						if (eles[i].autofocus) {
							eles[i].focus();
							return;
						}
					}
					var dialog = element.parent(".modal-dialog")[0];
					dialog.tabIndex = 0;
					dialog.style.outline = "none";
					dialog.focus();
				});
			}
		};
	})
	.factory("ezdialog", ["ezmodal", "$templateCache", function($modal){
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
			link: function(scope, element, attrs){
				element.on("$destroy", function(e){
					scope.ngDestroy();
				});
			}
		};
	})
	.directive("ezmodal", function(){
		return {
			restrict: "E",
			transclude: true,
			templateUrl: "ezdialog/modalContent"
		};
	});
