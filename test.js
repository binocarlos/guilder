var tape = require('tape')
var Guilder = require('./')
var path = require('path')
var fs = require('fs')
var wrench = require('wrench')
var sizeOf = require('image-size')

var projectSource = path.normalize(__dirname + '/test/project')
var buildTarget = path.normalize(__dirname + '/test/output')

tape('reset and clear folder', function(t){
	var project = Guilder(projectSource, buildTarget)


	Guilder.series([

		project.ensureFolder(true)

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

			wrench.rmdirSyncRecursive(buildTarget)
			
			t.end()
		}
	})

})


tape('resize some images', function(t){

	var project = Guilder(projectSource, buildTarget)

	project.on('log', console.log)

	Guilder.series([

		project.ensureFolder(true),
		project.resizeImages('img/**', '100x100', function(path){
			if(path.match(/car/)){
				return 'otherfolder/car.jpg'
			}
			else{
				return path
			}
		})

	], function(err){

		if(err){
			t.fail(err, 'run')
			t.end()
			return
		}
		else{

			var balloons = path.join(buildTarget, 'img/subfolder/balloons.jpg')
			var car = path.join(buildTarget, 'otherfolder/car.jpg')
			var dimensions = sizeOf(balloons)

			t.ok(fs.existsSync(balloons), 'balloons exists')
			t.ok(fs.existsSync(car), 'car exists')
			t.equal(dimensions.width, 100, '100 width')
			t.equal(dimensions.height, 100, '100 height')

			wrench.rmdirSyncRecursive(buildTarget)

			t.end()
		}
	})

})


tape('write some data', function(t){

	var project = Guilder(projectSource, buildTarget)

	project.on('log', console.log)

	Guilder.series([

		project.ensureFolder(true),
		project.write('data/2/hello.txt', 'world')

	], function(err){

		if(err){
			t.fail(err, 'run')
			t.end()
			return
		}
		else{

			var data = path.join(buildTarget, 'data/2/hello.txt')
			
			t.ok(fs.existsSync(data), 'data exists')

			var content = fs.readFileSync(data, 'utf8')

			t.equal(content, 'world', 'content equals')
			wrench.rmdirSyncRecursive(buildTarget)
			
			t.end()
		}
	})

})

tape('scaffold a new project', function(t){

	var project = Guilder(projectSource, buildTarget)

	project.on('log', console.log)

	Guilder.series([

		project.installComponent(true),
		project.buildComponent(true),
		project.ensureFolder(true),
		project.copy(['css/**', 'build/**'])

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
			wrench.rmdirSyncRecursive(buildTarget)
			t.end()
		}
	})
})

/*

tape('write a template', function(t){

	var project = Guilder(projectSource, buildTarget)

	project.on('log', console.log)

	Guilder.series([

		project.installComponent(true),
		project.buildComponent(true),
		project.ensureFolder(true),
		project.copy(['css/**', 'build/**'])

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

*/