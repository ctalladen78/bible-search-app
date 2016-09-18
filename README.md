## Parking Lot Items

 * Notes section
 * Bookmark section that makes it easy for reader to jump to last verse/chapter being read.  
 * Bookmark section shows date of last activity
 * 
## How to use this template
*This is the contents of the www/ folder in Ionic 
*This template does not work on its own*. It is missing the Ionic library, and AngularJS.

To use this, either create a new ionic project using the ionic node.js utility, or copy and paste this into an existing Cordova project and download a release of Ionic separately.

### launch from cloud9
`ionic serve -p $PORT -nolivereload`


### With the Ionic tool:

Take the name after `ionic-starter-`, and that is the name of the template to be used when using the `ionic start` command below:

```bash
$ sudo npm install -g ionic cordova
$ ionic start myApp sidemenu
```

Then, to run it, cd into `myApp` and run:

```bash
$ ionic platform add ios
$ ionic build ios
$ ionic emulate ios
```

Substitute ios for android if not on a Mac, but if you can, the ios development toolchain is a lot easier to work with until you need to do anything custom to Android.

## Demo
http://plnkr.co/edit/0RXSDB?p=preview


