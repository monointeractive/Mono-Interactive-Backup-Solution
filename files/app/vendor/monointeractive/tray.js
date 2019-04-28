var tray = new (function(){
	var scope = this;
	scope.iconSequence = [];
	scope.init = function(){
		if(nodeEnv) scope.tray = new nw.Tray({title:win.title});
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
		if(_path !=scope.tray.icon) scope.tray.icon = _path;
	}	
	scope.changeIcon = function(sqguence){
		if(typeof sqguence =='string' && sqguence =='warning'){
			$('body').one('click',function(){
				scope.changeIcon(scope.iconName);
			});
		}
		sqguence = sqguence || [];
		if(typeof sqguence == 'string') sqguence = [sqguence];
		scope.iconSequence = sqguence;
		if(scope.iconSequence.indexOf(scope.iconName) == -1) scope.iconSequence.push(scope.iconName);		
	}
})();