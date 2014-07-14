guilder
=======

A project builder for g's

## install

```
$ npm install guilder
```

## usage

guilder is a toolkit for scaffolding and building projects using source template folders.

It has tools for the following jobs:

 * folder copy/initialization
 * image resizing
 * writing data to template pages (using ejs)
 * installing/building components

You use it as a library in custom build scripts:

```
var Guilder = require('guilder')

// where does the app template live
var source = __dirname + '/gametemplate'

// where are we building the app
var dest = __dirname + '/dist/test'

// create a project from the source template and the destination folder
var build = Guilder(source)

// handle logging
build.on('log', function(st){
	console.log(st)
})

// run through build steps in series
Guilder.series([

	function(next){
		// do something custom
		next()
	},

	// install the component in the source folder with autoReset = true
	build.installComponent(true),

	// this will create the destination folder with autoRemove = true
	build.ensureFolder(dest, true),

	// copy files using globs
	build.mergeFolder('css', dest),

	// resize images
	build.resizeImages('img/*.png', '590x600', dest)

], function(error){
	if(error){
		console.error(error)
		process.exit(1)
	}
	else{
		process.exit()	
	}
})
```

## api

### `var project = Guilder(source)`

Create a new project from a source template

### `Guilder.parallel`

Proxy to [async.parallel](https://github.com/caolan/async#parallel)

### `Guilder.series`

Proxy to [async.series](https://github.com/caolan/async#seriestasks-callback)

### `project.installComponent(autoReset)`

Create the folder in the destination location - autoReset means delete if exists

### `project.ensureFolder(path, autoRemove)`

Ensure a folder exists - autoRemove will delete if it exists

### `project.copyFiles(srcGlob, destFolder)`

Copy each file matching the srcGlob into the dest folder

### `project.resizeImages(srcGlob, size, destFolder)`

Resize images matching the glob into the destination location

Size is an object with width and height properties or a string of the format '[width]x[height]'

## events

### `project.on('log', function(string){})`

The logs are emitted to be handled in a custom way

## licence
MIT

