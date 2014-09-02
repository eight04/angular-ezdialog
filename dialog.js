angular.module("ezdialog", ["ui.bootstrap"])
	.factory("ezdialog", function($modal){
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
			size: 'sm',
			backdrop: 'static'
		};
	
		function dialog(opt){
			var onclose = null, callback = {}, instance;
			
			instance = $modal.open({
				templateUrl: opt.template || null,
				template: 
					opt.template ? null :
						'<div class="modal-header">\
							<h3 class="modal-title">{{title}}</h3>\
						</div>\
						<div class="modal-body">\
							<span style="white-space: pre-wrap;">{{body}}</span>\
						</div>\
						<div class="modal-footer">\
							<button class="btn btn-{{type}}" ng-click="ok()" type="button" ng-if="yes!==undefined">{{yes}}</button>\
							<button class="btn btn-default" ng-click="cancel()" type="button" ng-if="no!==undefined">{{no}}</button>\
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
				size: opt.size || conf.size,
				backdrop: opt.backdrop !== undefined ? opt.backdrop : conf.backdrop,
				windowClass: opt.type?"modal-" + opt.type:null
			});
			
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
	})
	.controller("dialog", function($scope, $modalInstance, $http, opt, callback){
		
		$scope.body = opt.msg;
		$scope.yes = opt.yes;
		$scope.no = opt.no;
		$scope.type = opt.type || "default";
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
