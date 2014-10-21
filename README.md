angular-ezdialog
================
A simple AngularJS dialog service build with Bootstrap modal and ngAnimate, aiming to replace native `window.alert`.

Demo
----
Check the [demo page][1] for usage example.

[1]: https://rawgit.com/eight04/angular-ezdialog/master/example/example.html

Install
-------
Install with bower:
```sh
bower install angular-ezdialog --save
```
In html header:
```html
<script src="bower_components/angular-ezdialog/dist/dialog.min.js">
<link rel="stylesheet" href="bower_components/angular-ezdialog/dist/dialog.min.css">
```
The css file was built with official bootstrap v3.2.0. Create your own build for custom dialog color.

Ezdialog service
----------------
Injectable service `ezdialog`.

#### ezdialog.show(String message[, String title]) or ezdialog.show(Object options) -> Promise object

`ezdialog.show`, `ezdialog.error`, `ezdialog.confirm`, `ezdialog.yesno` all accept same arguments.

Display a simple dialog, containing title and message.

```javascript
// Default options object
options = {
	use: "show",	// Could be show|error|confirm|yesno. Ezdialog will apply some
    				// default options according its value.
	msg: "message",
    title: "title",

    // Button click handler. Check callback section for more information.
    onok: function(){},
    oncancel: function(){},

    // Text content on buttons
    yes: "OK",
    no: "Cancel",

    size: "sm",				// Could be sm|md|lg.
    toggleBackdrop: false	// Decided whether to close dialog when clicking
    						// on backdrop.
};
```

#### ezdialog.toggle(String id)
Show/hide a dialog which was created by ezdialogDirective.

#### ezdialog.conf
An object contains ezdialog's default value.

Dialog promise
--------------
A promise returned by ezdialog.show. (.error, .confirm, ...)

#### promise.then(Function callback(retValue))
Trigger when dialog is closed. By the default, ok button will set retValue to true, otherwise false.

#### promise.ok(Function callback(Function closeFunc)) -> self
Replace the default ng-click callback. To close the dialog, run `closeFunc()`. This has the same effect as `options.onok = callback`.

#### promise.cancel(Function callback(Function closeFunc)) -> self
Same as above.

#### promise.instance
Dialog instance object.

Dialog instance
---------------
You can get it from `promise.instance`.

#### dialog.ok()
By the default, this is same as `dialog.close(true)`. Otherwise it will call `onok` function.

#### dialog.cancel()
By the default, this is same as `dialog.close(false)`.

#### dialog.close(value)
Close the dialog and resolve the deferred with `value`.

Ezdialog directive
------------------
```html
<button ezdialog-toggle="my-modal">Open dialog</button>
<div
    ezdialog="my-modal"
    ezdialog-title="Title"
    size="sm"
    type="success"
    yes="OK"
    no="Cancel"
    onok="doSomething($dialog)"
    oncancel="doSomething($dialog)"
    backdrop-toggle>
	...
</div>
```

#### ezdialog-toggle = "id"
Dialog id which you want to toggle.

#### ezdialog = "id"
Create a dialog and set dialog id.

#### ezdialog-title = "title"
Set dialog title.

#### size, type, yes, no
Dialog options, same as options object above.

#### onok = Expression, oncancel = Expression
Replace default onok, oncancel callback. You can access dialog instance with `$dialog` to `$dialog.close()` manually.

#### backdrop-toggle
Provide backdrop-toggle attribute to close dialog when clicking on backdrop.


Todos
-----
* <del>Enhance enter key press behavior.</del> Done!
* <del>Remove ui.bootstrap dependency and use ngAnimate.</del> Done!
* <del>Add ezmodal service and directive.</del> Done!
* <del>Add onclose attribute to overide default ESC key behavior.</del> Changed. Now ESC key will trigger dialog.cancel().