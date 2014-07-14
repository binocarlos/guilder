var tape = require('tape')
var Guilder = require('./')
var path = require('path')
var fs = require('fs')
var wrench = require('wrench')

var projectSource = path.normalize(__dirname + '/test/project')
var buildTarget = path.normalize(__dirname + '/test/output')

tape('reset and clear folder', function(t){
	var project = Guilder(projectSource)


	Guilder.series([

		project.ensureFolder(buildTarget, true)

	], function(err){

		if(err){
			t.fail(err, 'run')
			t.end()
			return
		}
		else{

			t.ok(fs.existsSync(buildTarget), 'src components')

			fs.writeFileSync(path.join(buildTarget, 'test.txt'), 'hello', 'utf8')

			var files = fs.readdirSync(buildTarget)

			t.equal(files.length, 1, 'length 1')
			t.equal(files[0], 'test.txt', 'file is test.txt')
			
			t.end()
		}
	})

})

tape('scaffold a new project', function(t){

	var project = Guilder(projectSource)

	project.on('log', console.log)

	Guilder.series([

		project.installComponent(true),
		project.buildComponent(true),
		project.ensureFolder(buildTarget, true),
		project.mergeFolder('css', buildTarget),
		project.mergeFolder('build', buildTarget)

	], function(err){

		if(err){
			t.fail(err, 'run')
			t.end()
			return
		}
		else{

			t.ok(fs.existsSync(path.join(projectSource, 'components')), 'src components')
			t.ok(fs.existsSync(path.join(projectSource, 'build')), 'src build')
			t.ok(fs.existsSync(path.join(buildTarget, 'css')), 'target css')
			t.ok(fs.existsSync(path.join(buildTarget, 'build')), 'target build')
			t.end()
		}
	})
})

tape('resize some images', function(t){

	var project = Guilder(projectSource)

	project.on('log', console.log)

	Guilder.series([

		project.ensureFolder(buildTarget, true),
		project.resizeImages('img/**', buildTarget)

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