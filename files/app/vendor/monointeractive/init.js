var nodeEnv = typeof require == 'function' && typeof require('nw.gui') !='undefined';
if(nodeEnv){	
	var fs = require('fs');
	process.execPath = typeof process.env.execPath == 'string' && process.env.execPath.length && fs.existsSync(process.env.execPath) ? process.env.execPath : process.execPath;
	process.execPath = typeof process.env.launcherPath == 'string' && process.env.launcherPath.length && fs.existsSync(process.env.launcherPath) ? process.env.launcherPath : process.execPath;
	process.argv[0] = process.execPath;
	console.log('process',process);
	var util = require('util');
	var path = require('path');
	var gui = require('nw.gui');
	var win = gui.Window.get();
	var guiApp = gui.App;
	var debugMode = process.execPath.toLowerCase().indexOf('localbackup') > -1 || process.execPath.toLowerCase().indexOf('narzedzia') > -1 || process.execPath.toLowerCase().indexOf('repo') > -1;
	var devToolWindowRef = false;
	
	win.orgShow = win.show;
	win.show = function(){
		if(main && main.splashWnd) main.splashWnd.close(true);
		this.orgShow();
	}
	
	win.orgHide = win.hide;
	win.hide = function(){
		win.minimize();
		this.orgHide();
	}
	
	var winNotify = function(config){
		config = config || {};
		config.icon = 'icons/default_32x32.png';
		config.body = typeof config.body =='string' ? config.body : util.format(config.body);
		config.body = String(config.body);
		config.body = config.body.split(path.dirname(location.href)).join('').split('.js').join('');
		guiApp.notificatios = guiApp.notificatios || [];
		if(guiApp.notificatios.indexOf(config.body) == -1){			
			guiApp.notificatios.push(config.body);
			var notification = new Notification(win && typeof win == 'object' && win.title ? win.title : guiApp.manifest.name,config);
			if(config.onClose) notification.onclose = config.onClose;
		}
	}
	
	process.on("uncaughtException", function (err) {		
		console.error('uncaughtException', err);
		//if(typeof err == 'object') err = [err.name, err.message,err.stack];
		
		if(debugMode && typeof win == 'object' && win.showDevTools && ((win.isDevToolsOpen && !win.isDevToolsOpen()) || !win.isDevToolsOpen)){
			win.showDevTools();			
		}
		winNotify({body:err,onClose:function(){close();}});
		setTimeout(function(){close();},30000);
		process.isExit = true;
	});  
	var child_process = require('child_process');
	var spawn = child_process.spawn;
	var exec = child_process.exec;
	var execSync = child_process.execSync;
	var currentDir = process.cwd();
	var clipboard = gui.Clipboard.get();
	var __dirname = path.resolve();	
	var execDir = path.dirname(process.execPath);	
	var cwd = process.cwd();
	var binDir = path.join(execDir,'bin');
	var EventEmitter = require('events');
	var userDir = guiApp.dataPath;
	if(path.basename(userDir).toLowerCase()=='default') userDir = path.dirname(userDir);
	if(path.basename(userDir).toLowerCase()=='user data') userDir = path.dirname(userDir);
	
	guiApp.on("open", function(args){
	
	});

	window.addEventListener('error', function(e) { 
		process.emit('uncaughtException',e.error);
	});

	win.on('error', function(e) {
		process.emit('uncaughtException',e.error);
	});
	win.on('close', function() {
		if(main && main.splashWnd) main.splashWnd.close(true);		
		if(win && !win.minimized){
			win.minimize();
			return false;
		}
		config.data.lastClose = moment().format("YYYY-MM-DD HH:mm:ss");
		config.save();		
		if(typeof tray =='object' && tray.remove) tray.remove();
		win.close(true);
		setTimeout(function(){process.exit();},500);
	});
}