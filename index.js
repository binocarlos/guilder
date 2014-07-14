var async = require('async')
var Project = require('./project')

function Guilder(src){
	return Project(src)
}

Guilder.series = async.series
Guilder.parallel = async.parallel

module.exports = Guilder