var tape = require('tape')
var Guilder = require('./')

tape('scaffold a new project', function(t){

	var projectSource = __dirname + '/test/project'
	var buildTarget = __dirname + '/test/output'

	var project = Guilder(projectSource)

	project.on('log', console.log)

	Guilder.run([

		project.installComponent(true),
		project.ensureFolder(buildTarget, true),
		project.copyFiles('css/*', buildTarget)

	], function(err){
		if(err){
			t.fail(err, 'run')
			t.end()
			return
		}
		else{
			t.end()
		}
	})
})