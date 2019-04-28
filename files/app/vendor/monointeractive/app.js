var app = new (function(){
	var scope = this;
	scope.init = function(){
		if(!nodeEnv) return;
		scope.startIdleTimer();
		scope.events = new EventEmitter();
		scope.events.on('user.idle',function(idleTime){
			if(idleTime){
				console.log('user.idle',idleTime);				
			} else {
				console.log('user.active');
			}
		});
		win.on('restore',function(){
			scope.restartIdleTimer();
		});
		scope.backup = backup;
		scope.backup.init();
		
		scope.sync = sync;
		scope.sync.init();		
	}
	scope.exit = function(){
		try{ config.save();} catch(err){}
		try{ process.exit();} catch(err){}
	}
	scope.restart = function(){		
		var restartProcess = spawn(process.execPath, { detached: true, stdio: ['ignore'] });
		restartProcess.unref();
		scope.exit();
	}	
	scope.restartIdleTimer = function(){
		var child = scope.idleTimeProcess;
		if(child.running){
			child.idleTime = 0;
			scope.events.emit('user.idle',child.idleTime);
		}
	}
	scope.startIdleTimer = function(){
			scope.idleTimeProcess = spawn(path.join(binDir,'idleTime','idleTime.exe'), [], {stdio: ['pipe', 'pipe', 'pipe', 'ipc']});
			var child = scope.idleTimeProcess;
			child.running = true;
			if(child.stdout) child.stdout.on ('data',function(data){console.log('idleTimeProcess','stdout',Buffer.from(data, 'utf-8').toString());}); 		 
			if(child.stderr) child.stderr.on ('data',function(data){console.log('idleTimeProcess','stderr',Buffer.from(data, 'utf-8').toString());});	
			
			child.once('processInit',function(){
				child.intervalDelay = 10;				
				child.on('desktopIdle.getIdleTime',function(time){
					child.idleTime = child.idleTime || 0;
					if(time > 10 && time > child.intervalDelay) child.idleTime = child.idleTime + child.intervalDelay; else child.idleTime = 0;					
					scope.events.emit('user.idle',child.idleTime);
				});	
				child.setTimeout = function(){
					clearTimeout(child.intervalDelay);
					child.send({call:'desktopIdle.getIdleTime'});
					child.timeout = setTimeout(function(){child.setTimeout();},child.intervalDelay * 1000);					
				}
				child.setTimeout();
			})
			
			child.on('message',function(message){
				//	console.log('idleTimeProcess','message',message);
				if(typeof message == 'object' && message.eventName) {
					child.emit(message.eventName,message.data);
				}
			});
			child.send({call:'init'});
			
			child.once('reject',function(){
				child.running = false;
				child.killed = true;
				child.pid = null;
				clearTimeout(child.intervalDelay);
				child.kill();
				console.log(child);
			});
			
			['error','close','exit','disconnect'].forEach(function(eventName){
				child.on(eventName,function(data){
					var result = {
						type:eventName,
						code:0					
					}
					if(eventName == 'close' || eventName == 'exit') result.code = data;
					if(eventName == 'error') {
						result.code = 1;
						result.messsage = (typeof data == 'object' && data.message ? data.message : String(data))
					}
					child.emit('reject',result);
				});
			});
						
	}
	
})();