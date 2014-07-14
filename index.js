var async = require('async')

function run(fns, done){
	async.series(fns, done)
}

function Guilder(src){

}

module.exports = function(){
	return {
		run:run,

	}	
}