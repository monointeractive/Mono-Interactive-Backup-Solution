var EventEmitter = require('events');
var util = require('util');
var extend = require('extend');
var path = require('path');
module.exports = function(){
	var scope = this;	
	scope.events = new EventEmitter();
		
	scope.isRunning = function(){
		return ((scope.process && typeof scope.process.kill == 'function' && scope.process.pid) && scope.process.running);
	}	
	scope.stop = function(type){
		if(scope.isRunning()){			
			var code = parseInt(type || scope.process.stopCode,10);
			if(code) console.error('exit',code);
			scope.process.kill();
			scope.process.unref();
		}
		if(scope.process){
			scope.process.stopCode = code;
			scope.process.running = false;
			scope.process.killed = true;
			scope.process.pid = null;						
		}		
	}	
	scope.spawn = function(executable,args,_config){
		args = args || [];
		config = typeof _config == 'object' ? extend(true,{},_config) : {};
		config.env = extend(true,{}, JSON.parse(JSON.stringify(process.env || {})),(config.env || {}));
		Object.defineProperty(config.env, 'PKG_EXECPATH', { set: function(val) { } });
		console.debug('Exec',{executable:executable,args:args,config:config});
		var ext = path.extname(executable).toLowerCase().split('.').join('');
		if(ext == 'com' || ext == 'bat' || ext == 'cmd' || config.shell) config.windowsHide = true;
		scope.process = require('child_process').spawn(executable, args, config);
		if(scope.process.pid && process.pids.indexOf(scope.process.pid) == -1) process.pids.push(scope.process.pid);
		var child = scope.process;
		child.running = true;
		if(child.stdout) {
			child.stdout.setEncoding('utf8');
			child.stdout.on ('data',function(data){
				var data = Buffer.from(data, 'utf-8').toString().trim();
				child.emit('stdout',data);
			}); 
		}
	 
		if(child.stderr) {
			child.stderr.setEncoding('utf8');
			child.stderr.on ('data',function(data){
				var data = Buffer.from(data, 'utf-8').toString().trim();
				child.emit('stderr',data);
			});	
		}
		
		child.once('reject',function(code){
			scope.stop(code);
		});
		
		Promise.all([
			new Promise(function(resolve, reject){
				child.once('exit',function(code){
					clearTimeout(child.exitTimeout);
					child.exitTimeout = setTimeout(function(){child.emit('close',code)},300);
					resolve(code);
				});   
			}),
			new Promise(function(resolve, reject){
				child.once('close',function(code){
					clearTimeout(child.exitTimeout);
					child.exitTimeout = setTimeout(function(){child.emit('exit',code)},300);
					resolve(code);
				});
			})			
		]).then(function(exitCodes){
			var exitCode = parseInt((exitCodes[0] || exitCodes[1] || 0),10);
			child.emit('reject',exitCode);
		});

		child.once('error',function(data){
			console.error(util.format(data));
			child.emit('exit',1);
			setTimeout(function(){child.emit('reject',1);},100);
		});
		
		return child;
	}
	

};