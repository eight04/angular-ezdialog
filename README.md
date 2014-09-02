angular-ezdialog
================

An simple AngularJS dialog service based on $modal of UI Bootstrap

Demo
----
You can check the demo [here](https://rawgit.com/eight04/angular-ezdialog/dev/example.html).

Usage
-----
### ezdialog Service
```JavaScript
ezdialog.show( msg [, title ] )
```
or
```JavaScript
ezdialog.show( options )
```
`options` - plain object. keys:

*msg* - Dialog message.
*title* - Dialog title.
*template* - template url for custom modal body.
**Message will be replace by template if the template is successfully loaded.**
*size* - modal size. could be `"sm"`/`"md"`/`"lg"`.
*backdrop* - modal backdrop. could be `true`/`false`/`"static"`.
*yes* - text on yes button.
*no* - text on no button.
**Button will be hide if it doesn't have content.**
