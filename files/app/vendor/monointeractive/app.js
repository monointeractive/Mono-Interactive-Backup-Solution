var app = new (function(){
	var scope = this;
	scope.init = function(){
		if(!nodeEnv) return;
		scope.startIdleTimer();
		scope.events = new EventEmitter();
		scope.title = win.title;
		scope.exitAfterTimeout = 3600; // 1 hour
		scope.initAutoExit = function(){
			if(!scope.startTime){
				scope.startTime =  new Date().getTime();
				scope.autoExitInterval =  setInterval(function(){
					var sec = ((new Date().getTime()) - scope.startTime) / 1000;
					if(sec > scope.exitAfterTimeout){
						clearInterval(scope.autoExitInterval);
						scope.backup.stop('userexit');		
						scope.sync.stop('userexit');		
						scope.update.stop('userexit');					
						setTimeout(function(){
							scope.restart();							
						},5000);
					}
				},1000);
			}
		}
		var backToinactivity = function(){
			console.log('backToinactivity');
			scope.lastUserInactivityTime = 0;
			backup.stop('backToinactivity');
		}

		scope.events.on('inactivityTimeout',function(){
			console.log('inactivityTimeout');
			scope.events.off('backToinactivity',backToinactivity);
			scope.events.once('backToinactivity',backToinactivity);
			backup.start();
		});
		scope.events.on('user.idle',function(idleTime){
			win.setTitle();			
			if(idleTime){
				if(config.data.inactivityDelay && !backup.isRunning()){
					var diffSec = config.data.inactivityDelay - idleTime;
					var info = 'Time to start the backup: '+moment.utc(moment.duration(diffSec, 'seconds').as('milliseconds')).format('HH:mm:ss')	
					if(diffSec <=1 && (idleTime < scope.lastUserInactivityTime || !scope.lastUserInactivityTime)){
						scope.lastUserInactivityTime = idleTime;
						scope.events.emit('inactivityTimeout');
						return;
					} else {
						if(diffSec >=0){
							console.log({diffSec:diffSec,idleTime:idleTime,lastUserInactivityTime:scope.lastUserInactivityTime});
							win.setTitle(info);							
						}
					}
				}
			} else {
				scope.events.emit('backToinactivity');
			}
		});
		win.on('restore',function(){
			scope.restartIdleTimer();
		});
		scope.backup = backup;
		scope.backup.init();
		
		scope.sync = sync;
		scope.sync.init();
		
		scope.update = update;
		scope.update.init();	
	}
	scope.exit = function(){
		try{ config.save();} catch(err){}
		try{ if(typeof tray =='object' && tray.remove) tray.remove();} catch(err){}
		try{ process.exit();} catch(err){}
	}
	scope.restart = function(){		
		var restartProcess = spawn(process.execPath, { env:$.extend(true,process.env,{wait:3}),detached: true, windowsHide:false,stdio: ['ignore'] }).unref();		
		try{ if(typeof tray =='object' && tray.remove) tray.remove();} catch(err){}
		try{process.kill(process.pid);} catch(err){};
		try{scope.exit();} catch(err){};
	}	
	scope.restartIdleTimer = function(){
		var child = scope.idleTimeProcess;
		if(child.running){
			child.idleTime = 0;
			scope.events.emit('user.idle',child.idleTime);
		}
	}
	scope.startIdleTimer = function(){
			scope.idleTimeProcess = (new processManager()).spawn(path.join(binDir,'idleTime','idleTime.exe'), [], {stdio: ['pipe', 'pipe', 'pipe', 'ipc']});
			if(!scope.idleTimeProcess.pid) {
				scope.idleTimeProcess = null;
				return;
			}
			var child = scope.idleTimeProcess;
			
			child.on('stdout',function(data){console.log('idleTimeProcess','stdout',data);});
			child.on('stderr',function(data){console.log('idleTimeProcess','stderr',data);});
			
			child.once('processInit',function(){
				child.intervalDelay = 5;				
				child.on('desktopIdle.getIdleTime',function(time){
					child.idleTime = child.idleTime || 0;
					if(time > 10 && time > child.intervalDelay) child.idleTime = child.idleTime + child.intervalDelay; else child.idleTime = 0;					
					scope.events.emit('user.idle',child.idleTime);
				});	
				child.initTimeout = function(){
					clearTimeout(child.intervalDelay);
					child.send({call:'desktopIdle.getIdleTime'});
					child.timeout = setTimeout(function(){child.initTimeout();},child.intervalDelay * 1000);					
				}
				child.initTimeout();
			})
			
			child.on('message',function(message){
				//	console.log('idleTimeProcess','message',message);
				if(typeof message == 'object' && message.eventName) {
					child.emit(message.eventName,message.data);
				}
			});
			child.send({call:'init'});
			
			child.once('reject',function(){
				win.setTitle();
				console.log('reject',child);
				clearTimeout(child.timeout);
				clearTimeout(child.intervalDelay);
			});	
	}
	
})();