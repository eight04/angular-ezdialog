angular-ezdialog
================

An simple AngularJS dialog service based on $modal of UI Bootstrap

Demo
----
You can check the demo [here](https://rawgit.com/eight04/angular-ezdialog/dev/example.html).

Usage
-----
```JavaScript
// Pop a simple error
ezdialog.error("error");

// With title
ezdialog.error("error", "Something went wrong");

// Do something after dialog close
ezdialog.error("error").close(function(ret){
	// ok -> true, cencel -> false
	ezdialog.show("dialog closed! returned value: " + ret);
});

// Replace default button click callback
ezdialog.confirm()
	.ok(function(){
		ezdialog.show("OK");
		this.close();
	})
	.cancel(function(){
		ezdialog.show("press Yes to close dialog");
	});

// Make dialog always return true
ezdialog.yesno()
	.cancel(function(
		this.close(true);
	))
	.close(function(ret){
		ezdialog.show("ret: " + ret);
	});

// Change default settings. It will affect all dialog globally.
ezdialog.conf({
	size: "lg",
	title: {
		show: "show time!"
	}
}).show();

// Call method with options.
ezdialog.show({
	title: "my title",
	msg: "my message",
	size: "md",
	yes: "this is yes button text",
	no: "and this is no button text"
});

// Use a custom template.
var param = ["wat?", "param", "will be", "assign on", "$scope"];
ezdialog.show({
	template: "my-dialog.html",
	param: param
}).ok(function(){
	param[0] = "whaaaaaaaaaaat!";
}).cancel(function(){
	this.close();
});

// template
<script type="text/ng-template" id="my-dialog.html">
	<div class="modal-{{type}}">
		<div class="modal-header">
			<h3 class="modal-title">{{param[0]}}</h3>
		</div>
		<div class="modal-body">
			<p ng-repeat="p in param">{{p}}</p>
		</div>
		<div class="modal-footer">
			<button class="btn btn-{{type}}" ng-click="ok()" type="button">Do something</button>
			<button class="btn btn-default" ng-click="cancel()" type="button">Cancel</button>
		</div>
	</div>
</script>
```

