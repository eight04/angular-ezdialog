angular.module("ezdialog", ["ui.bootstrap"])
	.factory("ezdialog", function($modal){
	
		function dialog(opt){
			var onclose = null, callback = {};
			
			$modal.open({
				templateUrl: opt.template || null,
				template: 
					opt.template ? null :
						'<div class="{{type}}">\
							<div class="modal-header">\
								<h3 class="modal-title">{{title}}</h3>\
							</div>\
							<div class="modal-body">\
								<span style="white-space: pre-wrap;">{{body}}</span>\
							</div>\
							<div class="modal-footer">\
								<button class="btn btn-primary" ng-click="ok()" type="button" ng-show="yes">{{yes}}</button>\
								<button class="btn btn-default" ng-click="cancel()" type="button" ng-show="no">{{no}}</button>\
							</div>\
						</div>',
				controller: "dialog",
				resolve: {
					opt: function(){
						return opt;
					},
					callback: function(){
						return callback;
					}
				},
				size: opt.size || "sm",
				backdrop: "static"
			}).result.then(function(value){
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
				callback: addCallback
			};
		}
		
		function error(msg){
			return dialog({
				title: "Error",
				msg: msg,
				yes: "確定",
				type: "error"
			});
		}
		
		function confirm(msg){
			return dialog({
				title: "Confirm",
				msg: msg,
				yes: "確定",
				no: "取消",
				type: "confirm"
			});
		}
			
		function yesno(msg){
			return dialog({
				title: "Confirm",
				msg: msg,
				yes: "是",
				no: "否",
				type: "confirm"
			});
		}
		
		function show(msg){
			return dialog({
				title: "Info",
				msg: msg,
				yes: "確定",
				type: "info"
			});
		}
		
		function create(opt){
			return dialog(opt);
		}
		
		return {
			error: error,
			confirm: confirm,
			yesno: yesno,
			show: show,
			create: create
		};
	})
	.controller("dialog", function($scope, $modalInstance, $http, opt, callback){
		
		$scope.body = opt.msg;
		$scope.yes = opt.yes;
		$scope.no = opt.no;
		$scope.type = opt.type;
		$scope.title = opt.title;
		$scope.param = opt.param;
		
		$scope.ok = function(){
			$modalInstance.close(true);
		};
		
		$scope.cancel = function(){
			$modalInstance.close(false);
		};		
		
		for (var i in callback) {
			if (typeof callback[i] == "function") {
				$scope[i] = callback[i].bind($modalInstance);
			}
		}
	});
