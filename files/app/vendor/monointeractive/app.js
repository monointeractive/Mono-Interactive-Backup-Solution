var app = new (function(){
	var scope = this;
	scope.init = function(){
		if(!nodeEnv) return;
		scope.startIdleTimer();
		scope.events = new EventEmitter();
		scope.title = win.title;
		
		scope.initAutoRestart = function(){
			if(!scope.startTime){
				scope.startTime =  new Date().getTime();
				scope.restartAfterTimeoutSec = 6  * 3600; // 1 hour
				if(config.data.inactivityDelay){
					var inactivityDelaySec = config.data.inactivityDelay;
					if(scope.restartAfterTimeoutSec < inactivityDelaySec * 2.5){
						scope.restartAfterTimeoutSec = inactivityDelaySec * 2.5;
					}
				}
				//scope.restartAfterTimeoutSec = 10;
				console.log('Auto-restart',moment(scope.startTime).add(scope.restartAfterTimeoutSec, 'seconds').format("YYYY-MM-DD HH:mm:ss"));				
				scope.autoExitInterval =  setInterval(function(){
					var sec = ((new Date().getTime()) - scope.startTime) / 1000;
					if(sec > scope.restartAfterTimeoutSec){
						clearInterval(scope.autoExitInterval);						
						process.args.push('--autorestart-mode=true');
						scope.restart();							
					}
				},1000);
			}
		}
		scope.events.on('inactivityTimeout',function(){
			if(scope.inactivityTimeoutLocked) return;
			scope.inactivityTimeoutLocked = true;
			scope.events.once('backToinactivity',function(){
					scope.inactivityTimeoutLocked = false;
					scope.restartIdleTimer();				
			});
			var backupProcess = backup.start();
			if(backupProcess && typeof backupProcess == 'object' && backupProcess.stop){				
				var backToinactivity = function(){
					backupProcess.stop();					
				};
				scope.events.once('backToinactivity',backToinactivity);
				backupProcess.once('reject',function(){
					scope.events.off('backToinactivity',backToinactivity);					
				});
			}			 
		});
		scope.events.on('user.idle',function(idleTime){
			win.setTitle();			
			if(idleTime){
				if(config.data.inactivityDelay && !backup.isRunning()){
					var diffSec = config.data.inactivityDelay - idleTime;
					var info = 'Time to start the backup: '+moment.utc(moment.duration(diffSec, 'seconds').as('milliseconds')).format('HH:mm:ss')	
					if(diffSec < 1){
						scope.events.emit('inactivityTimeout');
					} else {
						console.log({info,idleTime:idleTime,lastUserInactivityTime:scope.lastUserInactivityTime});
						win.setTitle(info);
					}
				}
			} else {
				scope.events.emit('backToinactivity');
			}
		});
		win.on('restore',function(){
			scope.restartIdleTimer();
		});
		scope.processStack = [];
		scope.backup = backup;
		scope.backup.init();
		
		scope.sync = sync;
		scope.sync.init();
		
		scope.update = update;
		scope.update.init();	
	}
	scope.runningTakss = new (function(_app){
		var app = _app;
		var scope = this;
		var tasks = [];
		scope.get = function(){return tasks;};
		scope.add = function(proces){
			var idx = tasks.push(proces);
			tray.updateIcon();
			return idx;
		}
		scope.refresh = function(){
			tasks = tasks.filter(function(child){
				return child && child.running;
			});
			tray.updateIcon();
		}
	})(scope);
	
	scope.exit = function(){
		try{ config.save();} catch(err){}
		try{ if(typeof tray =='object' && tray.remove) tray.remove();} catch(err){}
		try{ process.exit();} catch(err){}
	}
	scope.restart = function(){				
		var restartProcess = spawn(process.execPath, process.args, { env:extend(true,process.env,{wait:3}),detached: true, windowsHide:false,stdio: ['ignore'] }).unref();		
		try{ if(typeof tray =='object' && tray.remove) tray.remove();} catch(err){}
		try{scope.backup.stop('userexit');} catch(err){};
		try{scope.sync.stop('userexit');} catch(err){};		
		try{scope.update.stop('userexit');} catch(err){};					
		setTimeout(function(){try{process.kill(process.pid);} catch(err){};},1000);
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