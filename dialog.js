/* global angular */
/* eslint eqeqeq: 0, quotes: 0, no-multi-str: 0 */

angular.module("ezdialog", ["ngAnimate"])
	.run(function($templateCache){
		$templateCache.put("ezdialog/modalTemplate.html", "\
			<div class=\"ezdialog-modal\">\
				<div class=\"modal-backdrop in\" ng-style=\"{'z-index': 1400 + dialogs.length * 10 - 1\" ng-show=\"dialogs.length\"></div>\
				<div class=\"modal modal-{{dialog.type}}\" ng-repeat=\"dialog in dialogs\" ng-style=\"{'z-index': 1400 + $index * 10}\">\
					<div class=\"modal-dialog modal-{{dialog.size}}\">\
						<div class=\"modal-content\">\
							<form role=\"form\" name=\"form\">\
								<div class=\"modal-header\">\
									<h3 class=\"modal-title\">{{dialog.title}}</h3>\
								</div>\
								<div class=\"modal-body\" dialog=\"dialog\">\
									<span style=\"white-space: pre-wrap;\" ng-if=\"!dialog.template\">{{dialog.msg}}</span>\
									<div modal-custom-body=\"dialog\" ng-if=\"dialog.template\"></div>\
								</div>\
								<div class=\"modal-footer\">\
									<button class=\"btn btn-{{dialog.type}}\" ng-click=\"ok(dialog)\" type=\"submit\" ng-if=\"dialog.yes!==undefined\" ng-disabled=\"form.$invalid\">{{dialog.yes}}</button>\
									<button class=\"btn btn-default\" ng-click=\"cancel(dialog)\" type=\"button\" ng-if=\"dialog.no!==undefined\">{{dialog.no}}</button>\
								</div>\
							</form>\
						</div>\
					</div>\
				</div>\
			</div>"
		);
	})
	.factory("ezmodal", function(){
		var modalCtrl;
		
		return {
			open: function(dialog){
				var instance = {
					close: function(ret){
						modalCtrl.remove(dialog);
						dialog.onclose(ret);
					}
				};
				
				dialog.instance = instance;
				
				if (!modalCtrl) {
					var modal = $compile($templateCache.get("ezdialog/modalTemplate.html"))($rootScope);
					$document.find("body").append(element);
					
					$timeout(function(){
						modalCtrl = modal.controller("ezdialogModal");
						modalCtrl.add(dialog);
					});
				} else {
					modalCtrl.add(dialog);
				}
				
				var promise = {
					close: function(func){
						dialog.onclose = func.bind(instance);
					},
					ok: function(func){
						dialog.callback.ok = func.bind(instance);
					},
					cancel: function(func) {
						dialog.callback.cancel = func.bind(instance);
					},
					instance: instance
				};
				
				return promise;
			}
		}
	})
	.directive("ezdialogModal", function(){
		return {
			restrict: "C",
			scope: {},
			controller: function($scope, $document){
				$scope.dialogs = [];
				
				$scope.ok = function(dialog){
					if (dialog.callback.ok) {
						dialog.callback.ok();
					} else {
						dialog.instance.close(true);
					}
				};
				
				$scope.cancel = function(dialog){
					if (dialog.callback.cancel) {
						dialog.callback.cancel();
					} else {
						dialog.instance.close(false);
					}
				};
				
				this.add = function(dialog){
					$document.find("body").addClass("modal-open");
					$scope.dialogs.push(dialog);
				};
				
				this.remove = function(dialog){
					var k = $scope.dialogs.indexOf(dialog);
					if (k < 0) {
						return;
					}
					$scope.dialogs.splice(k, 1);
					
					if (!scope.dialogs.length) {
						$document.find("body").removeClass("modal-open");
					}
				};
			}
		};
	})
	.directive("modal")
	.directive("modalCustomBody", function(){
		return {
			scope: {
				dialog: "=dialog"
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
