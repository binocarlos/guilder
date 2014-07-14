var async = require('async')
var Project = require('./project')

function run(fns, done){
	async.series(fns, done)
}

function Guilder(src){
	return Project(src)
}

Guilder.run = run

module.exports = Guilder