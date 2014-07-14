var tape = require('tape')
var Guilder = require('./')
var path = require('path')
var fs = require('fs')
var wrench = require('wrench')
var sizeOf = require('image-size')

var projectSource = path.normalize(__dirname + '/test/project')
var buildTarget = path.normalize(__dirname + '/test/output')

/*
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

*/
tape('resize some images', function(t){

	var project = Guilder(projectSource)

	project.on('log', console.log)

	Guilder.series([

		project.ensureFolder(buildTarget, true),
		project.resizeImages('img/**', '100x100', buildTarget, function(path){
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

			t.end()
		}
	})

})