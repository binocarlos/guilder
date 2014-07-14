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
var cpFile = require('cp-file')

function Project(src, dest){
	if (!(this instanceof Project)) return new Project(src, dest)
	EventEmitter.call(this)
	this._src = src
	this._dest = dest
}

Project.series = async.series
Project.parallel = async.parallel

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

Project.prototype.ensureFolder = function(autoRemove){
	var self = this;
	return function(next){
		if(autoRemove){
			self.emit('log', 'remove folder: ' + self._dest)
			wrench.rmdirSyncRecursive(self._dest, true)
		}
		self.emit('log', 'create folder: ' + self._dest)
		wrench.mkdirSyncRecursive(self._dest, true)
		next()
	}
}

Project.prototype.write = function(target, data){
	var self = this;
	return function(next){
		self.emit('log', 'write data: ' + target)
		var targetPath = path.join(self._dest, target)
		wrench.mkdirSyncRecursive(path.dirname(targetPath), true)
		fs.writeFileSync(path.join(targetPath), data, 'utf8')
		next()
	}
}

Project.prototype.copy = function(src, processPath){
	var self = this;
	processPath = processPath || function(dest){
		return dest
	}
	return function(next){
		if(typeof(src)=='string'){
			src = [src]
		}
		globby(src, {
			cwd:self._src
		}, function(err, files){

			files = files.filter(function(f){
				return f.match(/\.\w+$/)
			})
			
			async.forEach(files, function(file, nextFile){

				self.emit('log', 'copy: ' + file)

				var fileSrc = path.join(self._src, file)
				var fileDest = path.join(self._dest, processPath(file))

				cpFile(fileSrc, fileDest, nextFile)

			}, next)

		})

	}
}

Project.prototype.resizeImages = function(src, size, processPath){
	var self = this;
	processPath = processPath || function(dest){
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
		globby(src, {
			cwd:self._src
		}, function(err, files){

			files = files.filter(function(f){
				return f.match(/\.\w+$/)
			})
			
			async.forEach(files, function(file, nextFile){

				self.emit('log', 'resize image: ' + file)

				var fileSrc = path.join(self._src, file)
				var fileDest = path.join(self._dest, processPath(file))
				var folder = path.dirname(fileDest)

				// this is bad and blocking - upgrade will be nice to have async folder creation
				// cli use means we can get away with it for now
				wrench.mkdirSyncRecursive(folder, true)

				resize.image(fileSrc, fileDest, size, nextFile)

			}, next)

		})
		
		
	}
}