var EventEmitter = require('events').EventEmitter
var util = require('util')
var path = require('path')
var wrench = require('wrench')
var mergedirs = require('merge-dirs')
var Componenter = require('componenter')
var fs = require('fs')

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

Project.prototype.resizeImages = function(src, size, dest){
	var self = this;
	return function(next){
		self.emit('log', 'resize images: ' + src + ' ' + size)
		next()	
	}
}