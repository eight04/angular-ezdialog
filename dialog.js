/* global angular */
/* eslint eqeqeq: 0, quotes: 0, no-multi-str: 0 */

angular.module("ezdialog", [])
	.directive("ezdialogStack", function($modal, $sce, $document){
		return {
			restrict: "C",
			template: "\
				<div class=\"modal-backdrop in\" ng-style=\"{'z-index': dialogs[dialogs.length - 1].zIndex - 1}\" ng-show=\"dialogs.length\"></div>\
				<div class=\"modal modal-{{dialog.type}}\" ng-repeat=\"dialog in dialogs\" ng-style=\"{'z-index': dialog.zIndex}\">\
					<div class=\"modal-dialog modal-{{dialog.size}}\">\
						<div class=\"modal-content\">\
							<form role=\"form\" name=\"form\">\
								<div class=\"modal-header\">\
									<h3 class=\"modal-title\">{{dialog.title}}</h3>\
								</div>\
								<div class=\"modal-body\" ng-controller=\"ezdialog\">\
									<span style=\"white-space: pre-wrap;\" ng-if=\"!dialog.templateLoaded\">{{dialog.msg}}</span>\
									<ng-include src=\"dialog.template\" onload=\"dialog.templateLoaded=true\"></ng-include>\
								</div>\
								<div class=\"modal-footer\">\
									<button class=\"btn btn-{{dialog.type}}\" ng-click=\"dialog.callback.ok()\" type=\"submit\" ng-if=\"dialog.yes!==undefined\" ng-disabled=\"form.$invalid\">{{dialog.yes}}</button>\
									<button class=\"btn btn-default\" ng-click=\"dialog.callback.cancel()\" type=\"button\" ng-if=\"dialog.no!==undefined\">{{dialog.no}}</button>\
								</div>\
							</form>\
						</div>\
					</div>\
				</div>",
			scope: {},
			link: function(scope, element, attrs){
				scope.dialogs = [];
				scope.add = function(opt){
					opt.zIndex = 40;
					scope.dialogs.push(opt);
					$document.find("body").addClass("modal-open");
				};
				scope.remove = function(dialog){
					var i;
					for (i = 0; i < scope.dialogs.length; i++) {
						if (scope.dialogs[i] == dialog) {
							scope.dialogs.splice(i, 1);
							break;
						}
					}
				};
				
				$modal.holder = scope;
			}
		};
	})
	.factory("$modal", function($document, $rootScope, $compile, $timeout){
		var element, ctrl;
		
		var init = {
			open: function(opt){
				if (!element) {
					element = $compile("<div class=\"ezdialog-stack\"/>")($rootScope);
					$document.find("body").append(element);
					$timeout(function(){
						init.open(opt);
					});
					return;
				}
				init.holder.add(opt);
			},
			holder: null
		};
		
		return init;
	})
	.factory("ezdialog", ["$modal", "$templateCache", function($modal, $templateCache){
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
			instance = $modal.open(opt);
			
			// instance.result.then(function(value){
				// if (onclose) {
					// onclose(value);
				// }
			// });
			
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
	.controller("ezdialog", function($scope, $modal){
		var dialog = $scope.dialog;
		
		dialog.callback.ok = function(){
			$modal.holder.remove(dialog);
		};
		// dialog.param = 
	});
