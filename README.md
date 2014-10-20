angular-ezdialog
================
A simple AngularJS dialog service build with Bootstrap modal and ngAnimate. This service was aimed to replace native `window.alert`.

Demo
----
You can check the demo [here][1].

[1]: https://rawgit.com/eight04/angular-ezdialog/master/example/example.html

Install
-------
Install with bower:
```sh
bower install angular-ezdialog --save
```
Put them in your html head:
```html
<script src="bower_components/angular-ezdialog/dist/dialog.min.js">
<link rel="stylesheet" href="bower_components/angular-ezdialog/dist/dialog.min.css">
```
The css file was built with official bootstrap v3.2.0. Create your own build for custom dialog color.

Usage
-----
Use ezdialog service:
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

// Replace default button click handler
ezdialog.confirm()
    .ok(function(){
        ezdialog.show("OK");
        this.close();
    })
    .cancel(function(){
        ezdialog.show("press Yes to close dialog");
    });

// Change default setting, which will affect all dialog globally.
ezdialog.conf({
    size: "lg",
    title: {
        show: "show time!"
    }
}).show();

// Call method with option object.
ezdialog.show({
    title: "my title",
    msg: "my message",
    size: "md",
    yes: "yes button text",
    no: "no button text"
});

// Use a custom template. Template will be included in dialog body.
ezdialog.show({
	title: "use template",
	template: "my-dialog.html"
});
```
After version 2.0, ezdialog has its own modal service `ezmodal`:
```javascript
ezmodal.toggle("my-modal");
```
And directive:
```html
<button ezmodal-toggle="my-modal">Open modal</button>

<ezmodal id="my-modal" size="sm" backdrop-toggle>
	<div class="modal-header">
    	...
    </div>
    <div class="modal-body">
    	...
    </div>
</ezmodal>
```
Check the demo page for more examples.

Service Methods
---------------
```JavaScript
// There are 5 methods to display dialog
ezdialog.error()
ezdialog.show()
ezdialog.confirm()
ezdialog.yesno()	// same as confirm, but button text setted as Yes/No instead of OK/Cancel.

// These methods will return a dialog instance. You can provide some callbacks.
// You have to call this.close() in ok/cancel callback to close dialog.
dialogInstance.confirm()
	.ok(func)		// call when click on ok button
	.cancel(func)	// call when click on cancel button
	.close(func)	// after dialog close.

// Use ezmodal service to toggle modal.
ezmodal.toggle(id)
```

Options
-------
```JavaScript
// Default config. Define default button text, title, message...
// Change it with dialog.conf()
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
	size: 'sm'
};

// The option object you can pass to ezdialog's methods
var opt = {
	title: "title",
	msg: "message",

	// button text
	yes: "OK",
	no: "Cancel",

	// dialog type. primary|success|info|warning|danger
	type: "primary",

	// dialog size. sm|md|lg
	size: "sm"

	// Use custom template in dialog body
	template: "template.html",
    // Show if failed to load template
    error: "error message",
    // Variables to bind to isolate dialog scope
    scope: {
    	number: 999
    }
};
```
ezmodal direcive:
```html
<button ezmodal-toggle="my-modal">Toggle modal</button>
<!--
	ezmodal-toggle: String. Modal's id.
-->

<ezmodal id="my-modal" size="md" backdrop-toggle></ezmodal>
<!--
	size: Value could be sm|md|lg. Set modal's size.
    backdrop-toggle: Optional. If given, modal will be closed when clicking on the backdrop.
-->
```

Todos
-----
* <del>Enhance enter key press behavior.</del> Done!
* <del>Remove ui.bootstrap dependency and use ngAnimate.</del> Done!
* <del>Add ezmodal service and directive.</del> Done!
* Add onclose attribute to overide default ESC key behavior.