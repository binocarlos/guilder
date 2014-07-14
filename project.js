var EventEmitter = require('events').EventEmitter
var util = require('util')
var path = require('path')
var mergedirs = require('merge-dirs')
var cp = require('child_process')
var wrench = require('wrench')
var through = require('through2')
var split = require('split')
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
		if(autoRemove){
			self.emit('log', 'remove folder: ' + self._src + '/components')
			wrench.rmdirSyncRecursive(self._src + '/components', true)
		}

		self.emit('log', 'install component: ' + self._src)
		var install = cp.spawn('node', [
			path.resolve(__dirname + '/node_modules/component/bin/component-install'),
			'-v'
		], {
			stdio:'pipe',
			cwd:self._src
		})

		install.stdout
			.pipe(split())
			.pipe(through(function(chunk, env, cnext){
				self.emit('log', chunk.toString())
				cnext()
			}))

		install.on('error', next)
		install.on('close', next)
	}
}

Project.prototype.buildComponent = function(autoRemove){
	var self = this;
	return function(next){
		if(autoRemove){
			self.emit('log', 'remove folder: ' + self._src + '/build')
			wrench.rmdirSyncRecursive(self._src + '/build', true)
		}

		self.emit('log', 'build component: ' + self._src)
		var build = cp.spawn('node', [
			path.resolve(__dirname + '/node_modules/component/bin/component-build'),
			'-v'
		], {
			stdio:'pipe',
			cwd:self._src
		})

		build.stderr.pipe(process.stderr)
		build.stdout
			.pipe(split())
			.pipe(through(function(chunk, env, cnext){
				self.emit('log', chunk.toString())
				cnext()
			}))

		build.on('error', next)
		build.on('close', next)
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