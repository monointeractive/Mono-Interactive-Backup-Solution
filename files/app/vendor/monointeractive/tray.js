var tray = new (function(){
	var scope = this;
	scope.iconSequence = [];
	scope.init = function(){
		if(!nodeEnv) return;
		scope.tray = new nw.Tray({title:win.title,tooltip:win.title});
		scope.tray.on('click',function(){
			if(win.minimized){
				win.restore();
				win.show();				
				win.minimized = false;
			} else {
				win.minimize();
			}
		});
		var menu = new nw.Menu();
		menu.append(new nw.MenuItem({ label: 'Show window',click:function(){win.minimized = true; scope.tray.emit('click');}}));
		menu.append(new nw.MenuItem({ label: 'Restart',click:function(){app.restart();}}));
		menu.append(new nw.MenuItem({ label: 'Close',click:function(){win.close();}}));
		scope.tray.menu = menu;
		
		win.on('minimize',function(){
			win.hide();
			win.minimized = true;
		});
		win.on('restore',function(){
			win.minimized = false;
		});		
		win.on('maximize',function(){
			win.minimized = false;
		});		
		win.on('unmaximize',function(){
			win.minimized = false;
		});
		
		scope.iconDir = 'app/icons';
		scope.iconName = 'default';
		scope.changeIcon('default');
	}
	scope.animationSets = {
		default:['default'],
		update:['update1','update2','update3','update1','update2','update3'],
		backup:['backup2','backup3','backup4','backup2','backup3','backup4'],		
		sync:['default','sync']
	}
	scope.updateIcon = function(){
		var set = app.runningTakss.get();
		set = (set[set.length - 1] || {}).configId;
		if(scope.animationSets[set]) set = scope.animationSets[set]; else set = ['default'];
		scope.changeIcon(set);
		
		//console.log(set);
	}
	scope.remove = function(){
		if(scope.tray && scope.tray.remove) scope.tray.remove();
	}
	scope.sequenceInterval = setInterval(function(){
		if(scope.iconSequence.length > 1){			
			scope.sequenceIdx = scope.sequenceIdx || 0;
			scope.sequenceIdx++;
			scope.sequenceIdx = scope.sequenceIdx < (scope.iconSequence.length) ? scope.sequenceIdx : 0;
		} else scope.sequenceIdx = 0;
		scope.setIcon(scope.iconSequence[scope.sequenceIdx]);
	},1000);
	scope.setIcon = function(name){
		if(!scope.tray) return;
		name = name || scope.iconName;
		var _path = path.join(scope.iconDir,name+'.png');
		if(_path !=scope.tray.icon) {
			console.log('setIcon',_path);
			scope.tray.icon = _path;
			scope.tray.icon = _path;
		}
	}	
	scope.changeIcon = function(sqguence){
		if(typeof sqguence =='string' && sqguence =='warning'){
			$('body').one('click',function(){
				scope.changeIcon(scope.iconName);
			});
		}
		sqguence = sqguence || [];
		if(typeof sqguence == 'string') sqguence = [sqguence];
		scope.iconSequence = sqguence.length ? sqguence : [scope.iconName];	
		console.log('changeIcon',scope.iconSequence);
	}
})();