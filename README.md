guilder
=======

A project builder for g's

## install

```
$ npm install guilder
```

For the image resizing you need [ImageMagick](http://www.imagemagick.org/) on your system
## usage

guilder is a toolkit for scaffolding and building projects using source template folders.

It has tools for the following jobs:

 * folder copy/initialization
 * image resizing
 * writing data to template pages (using ejs)
 * installing/building components

You use it as a library in custom build scripts:

```js
var Guilder = require('guilder')

// where does the app template live
var source = __dirname + '/gametemplate'

// where are we building the app
var dest = __dirname + '/dist/test'

// create a project from the source template and the destination folder
// everything from here becomes relative
var project = Guilder(source, dest)

// handle logging
project.on('log', function(st){
	console.log(st)
})

// run through build steps in series
Guilder.series([

	function(next){
		// do something custom
		next()
	},

	// install the component in the source folder with autoReset = true
	project.installComponent(true),

	// install the component in the source folder with autoReset = true
	project.buildComponent(true),

	// this will create the destination folder with autoRemove = true
	project.ensureFolder(true),

	// copy files using globs
	project.copy('css/**', function(path){
		// you can alter the copy path here
		return path
	}),

	// resize images
	project.resizeImages('img/*.png', '590x600', function(path){
		// you can alter the copy path here
		return path
	}),

	// write data - this can be .html pages or any other text file
	project.write('config.json', JSON.stringify({}))

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

#### `var project = Guilder(source)`

Create a new project from a source template

#### `Guilder.parallel`

Proxy to [async.parallel](https://github.com/caolan/async#parallel)

#### `Guilder.series`

Proxy to [async.series](https://github.com/caolan/async#seriestasks-callback)


#### `project.ensureFolder(path, autoRemove)`

Ensure a folder exists - autoRemove will delete if it exists

#### `project.installComponent(autoReset)`

Create the folder in the destination location - autoReset means delete if exists

#### `project.buildComponent(autoReset)`

Create the folder in the destination location - autoReset means delete if exists

#### `project.copy(srcGlob, [processPath])`

Copy each file matching the srcGlob into the dest folder

processPath is a map function that lets you change the target location of each file

#### `project.resizeImages(srcGlob, size, [processPath])`

Resize images matching the glob into the destination location

Size is an object with `width` and `height` properties or a string of the format `[width]x[height]`

processPath is an optional function that can remap the destination path for the image

```js
project.resizeImages('img/**', '100x100', function(path){
	if(path.match(/car/)){
		return 'otherfolder/car.jpg'
	}
	else{
		return path
	}
})
```

#### `project.load(path)`

Load a 'utf8' encoded text file to the file at source/[path]

This is useful for loading templates and other text data from the source template

#### `project.write(path, data)`

Write a 'utf8' encoded text file to the file at dest/[path]

This is useful for writing templates and other data

## events

#### `project.on('log', function(string){})`

The logs are emitted to be handled in a custom way

## licence
MIT

