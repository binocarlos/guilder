var EventEmitter = require('events').EventEmitter
var util = require('util')
var path = require('path')
var async = require('async')
var wrench = require('wrench')
var ejs = require('ejs')
var mergedirs = require('merge-dirs')
var Componenter = require('componenter')
var globby = require('globby')
var fs = require('fs')
var resize = require('imagemagickresizer')()
var cpFile = require('cp-file')

function runCopy(srcFolder, glob, destFolder, emitter, processPath, done){
	if(typeof(glob)=='string'){
		glob = [glob]
	}
	processPath = processPath || function(path){
		return path
	}
	globby(glob, {
		cwd:srcFolder
	}, function(err, files){

		files = files.filter(function(f){
			return f.match(/\.\w+$/)
		})
		
		async.forEach(files, function(file, nextFile){

			emitter('copy: ' + file)

			var fileSrc = path.join(srcFolder, file)
			var fileDest = path.join(destFolder, processPath(file))

			if(this._sync){
				cpFile.sync(fileSrc, fileDest);
				nextFile();
			}else{
				cpFile.sync(fileSrc, fileDest, nextFile);
			}

		}, done)

	})
}
		

function Project(src, dest, sync){
	if (!(this instanceof Project)) return new Project(src, dest, sync), 
	EventEmitter.call(this)
	this._src = src
	this._dest = dest
	this._sync = sync
}

Project.series = async.series
Project.parallel = async.parallel
Project.copy = function(src, glob, dest){
	return function(next){
		runCopy(src, glob, dest, function(log){}, null, next)
	}
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
		project.build(autoRemove, next)
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


Project.prototype.template = function(src, target, data){
	var self = this;
	return function(next){
		self.emit('log', 'write data: ' + target)
		var targetPath = path.join(self._dest, target)
		wrench.mkdirSyncRecursive(path.dirname(targetPath), true)
		fs.writeFileSync(path.join(targetPath), data, 'utf8')
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

Project.prototype.template = function(src, target, data){
	var self = this;
	return function(next){
		self.emit('log', 'render template: ' + src)

		var srcPath = path.join(self._src, src)
		var targetPath = path.join(self._dest, target)

		var content = fs.readFileSync(srcPath, 'utf8')
		var output = ejs.render(content, data || {})

		self.emit('log', 'write data: ' + target)
		wrench.mkdirSyncRecursive(path.dirname(targetPath), true)
		fs.writeFileSync(path.join(targetPath), output, 'utf8')

		next()
	}
}

Project.prototype.copy = function(glob, processPath){
	var self = this;
	processPath = processPath || function(dest){
		return dest
	}
	return function(next){
		runCopy(self._src, glob, self._dest, function(log){
			self.emit('log', log)
		}, processPath, next)
	}
}

Project.prototype.manualCopy = function(srcFolder, glob, destFolder, processPath){
	var self = this;
	processPath = processPath || function(dest){
		return dest
	}
	return function(next){
		runCopy(srcFolder, glob, destFolder, function(log){
			self.emit('log', log)
		}, processPath, next)
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
