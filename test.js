var tape = require('tape')
var Guilder = require('./')
var path = require('path')
var fs = require('fs')

tape('scaffold a new project', function(t){

	var projectSource = path.normalize(__dirname + '/test/project')
	var buildTarget = path.normalize(__dirname + '/test/output')

	var project = Guilder(projectSource)

	project.on('log', console.log)

	Guilder.run([

		project.installComponent(true),
		project.buildComponent(true),
		project.ensureFolder(buildTarget, true),
		project.copyFiles(['css/*', 'build/*'], buildTarget)

	], function(err){
		if(err){
			t.fail(err, 'run')
			t.end()
			return
		}
		else{

			t.ok(fs.existsSync(path.join(projectSource, 'components')), 'src components')
			t.ok(fs.existsSync(path.join(projectSource, 'build')), 'src build')
			t.ok(fs.existsSync(path.join(buildTarget, 'build')), 'target build')
			t.end()
		}
	})
})