var EventEmitter = require('events').EventEmitter
var util = require('util')
var path = require('path')
var async = require('async')
var wrench = require('wrench')
var mergedirs = require('merge-dirs')
var Componenter = require('componenter')
var globby = require('globby')
var fs = require('fs')
var resize = require('imagemagickresizer')()

function Project(src){
	if (!(this instanceof Project)) return new Project(src)
	EventEmitter.call(this)
	this._src = src
}

util.inherits(Project, EventEmitter)

module.exports = Project

Project.prototype.installComponent = function(autoRemove){
	var self = this;
	return function(next){
		var project = Componenter(self._src)

		project.install(autoRemove, next)
	}
}

Project.prototype.buildComponent = function(autoRemove){
	var self = this;
	return function(next){
		var project = Componenter(self._src)

		project.install(autoRemove, next)
	}
}

Project.prototype.ensureFolder = function(dest, autoRemove){
	var self = this;
	return function(next){
		if(autoRemove){
			self.emit('log', 'remove folder: ' + dest)
			wrench.rmdirSyncRecursive(dest, true)
		}
		self.emit('log', 'create folder: ' + dest)
		wrench.mkdirSyncRecursive(dest, true)
		next()
	}
}

Project.prototype.mergeFolder = function(folder, dest){
	var self = this;
	return function(next){

		self.emit('log', 'merge folder: ' + folder)
		mergedirs(path.join(self._src, folder), path.join(dest, folder))
		next()

	}
}

Project.prototype.resizeImages = function(src, size, getDestination){
	var self = this;
	getDestination = getDestination || function(dest){
		return dest
	}
	return function(next){
		if(typeof(src)=='string'){
			src = [src]
		}
		if(typeof(size)=='string'){
			var sizes = size.split('x')
			size = {
				width:parseInt(sizes[0]),
				height:parseInt(sizes[1])
			}
		}
		globby(src, function(err, files){

			async.forEach(files, function(file, nextFile){

				self.emit('log', 'resize image: ' + file)

				var fileSrc = path.join(self._src, file)
				var fileDest = path.join(dest, getDestination(file))
				var folder = path.dirname(fileDest)

				// this is bad and blocking - upgrade will be nice to have async folder creation
				// cli use means we can get away with it for now
				wrench.mkdirSyncRecursive(folder, true)

				resize.image(fileSrc, fileDest, size, nextFile)

			}, next)

		})
		
		
	}
}