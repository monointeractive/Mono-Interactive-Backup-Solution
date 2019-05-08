var runAndLog = function(initConfig){
	var scope = this;
	scope.config = initConfig;
	scope.events = new EventEmitter();
	scope.init = function(){
		if(scope.config.onInit) scope.config.onInit.call(scope);
		console.log('name',this.constructor.name);
		scope.log = new (function(){})();
		scope.log.append = function(log){
			var _this = this;
			var messages = $.trim(String(log.message));
			messages = messages.split(/\r?\n/);
			messages.forEach(function(message){
				message = message.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
				message = $.trim(message);
				if(message.length) _this.appendLine($.extend({},log,{message:message}));
			});
		}
		scope.log.appendLine = function(log){			
			log.message = log.message.split(path.join(path.dirname(config.path),'backups')).join('');
			if(log.message.toLowerCase().indexOf('error') > -1 || log.message.toLowerCase().indexOf('warning') > -1) log.error = true;
			scope.events.emit('log',log);
		}
	}
	scope.processWindow = new (function(parent){
		var scope = this;
		scope.parent = parent;
		scope.show = function(){
			$(`<div class="logs"></div>`).each(function(idx,logsDiv){
				scope.wnd = $.mono.box({
					title:scope.parent.config.title,
					message:logsDiv,
					autofocus:false, 
					fitToMaxWidth:true,
					maxWidth:800,
					buttons:[
						{
							label: 'Stop',
							className: 'btn primary',
							id:'stop',
							callback: function(modal){															
								scope.parent.stop('userexit');
								return false;
							}
						}
					]
				}).attr('data-window-id',scope.parent.config.id);
				$('[data-id=close]',scope.wnd).hide();
				var logEvent = function(log){
					$('<div class="entry">').each(function(idx,entry){
						var message = String(log.message).split('<').join('').split('>').join('').split('"').join("'").split('Notice | ').join('');
						$(entry).attr('title',message);
						if(log.error) $(entry).addClass('error');
						if(typeof scope.parent.config.onBeforeAddEntry == 'function') scope.parent.config.onBeforeAddEntry.apply(scope.parent,[entry]);
						var group = $(entry).attr('data-group');
						if(group){
							var count = _parseInt($(logsDiv).data(group+'_count'));
							var title = $(entry).attr('title') || '';
							if(count) title = '[+'+count+'] ' + title;
							$(logsDiv).data(group+'_count',count+1);
							$(entry).attr('title', title);
							$('.entry[data-group="'+group+'"]',logsDiv).remove();
						}
						$(logsDiv).append(entry);					
					}).appendTo(logsDiv);
					$(logsDiv).scrollTop($(logsDiv)[0].scrollHeight);
				}
				parent.events.on('log',logEvent);
				parent.events.once('reject',function(data){
					$(scope.wnd).attr('data-status','reject');
					$('[data-id=stop]',scope.wnd).addClass('disabled').prop('disabled',true);
				});
				$(scope.wnd).one('hide.'+scope.parent.config.id+' unload.'+scope.parent.config.id,function(e){
					$(scope.wnd).off('hide.'+scope.parent.config.id+' unload.'+scope.parent.config.id);
					parent.events.off('log',logEvent);
					parent.events.off('reject',logEvent);					
					scope.parent.stop('userexit');
				});
			});
			
			return scope.wnd;
		}
	})(scope);
	scope.isRunning = function(){
		return ((scope.process && typeof scope.process.kill == 'function' && scope.process.pid) && scope.process.running);
	}
	scope.stop = function(type){
		if(scope.isRunning()){
			console.log('killing',scope.config.id,scope.process);
			scope.process.kill();
			scope.process.unref();
		}
		if(scope.process){
			scope.process.rejectCode = type;
			scope.process.running = false;
			scope.process.killed = true;
			scope.process.pid = null;						
		}		
	}
	scope.write = function(value){
		
		var child = scope.process;
		if(child && typeof child == 'object' && child.running && typeof child.stdin == 'object' && child.stdin.writable){
			try{
				child.stdin.write(value);
				child.stdin.write("\n");
			} catch(err){
				console.log(err,child);
			}
		} else {
			console.log('STDIN is close');
		}
	}	
	
	scope.sendCtrlC = function(){
		scope.write("\x03");
	}
	scope.start = function(config){
		config = typeof config == 'object' ? config : {};
		if(scope.isRunning()) {
			showNotify({title:scope.config.title,message:'Process is already running!'});
			return;
		}		

		if(typeof scope.config.onBeforeStart == 'function'){
			if(scope.config.onBeforeStart.call(scope) === false) return;
		}		
		$('.monobox[data-window-id="'+scope.config.id+'"]').trigger('hide');		
		scope.events.emit('start');
		scope.processWindow.show().one('shown',function(){
			scope.spawnAfterShow(config);
		});
	};
	scope.spawnAfterShow = function(config){
		scope.log.append({message: [moment().format("YYYY-MM-DD HH:mm:ss"),'Start'].join(' | ')});
		scope.process = (new processManager()).spawn(scope.config.exec, scope.config.args, scope.config.params);			
		var child = scope.process;
		console.log('child pid',child ? child.pid : null);
		if(!child.pid){
			showNotify({title:scope.config.title,message:'Process creation error'});
			return;
		}
		child.on('stdout',function(message){
			scope.log.append({message:message});
		});
		child.on('stderr',function(message){
			scope.log.append({error:true, message:message});
		});		
		
		child.once('exited',function(data){
			data.code = parseInt(data.code,10) || 0;
			if(child.rejectCode) data.code = child.rejectCode;
			scope.stop(child.rejectCode);
			
			data.info = data.code,
			data.isError = !(typeof data.code =='string' || !data.code);
			
			if(!data.info) data.info = 'Normal'; else
			if(data.isError) data.info = 'Error '+data.info; else
			if(data.info == 'userexit') data.info = 'Abort by user';
			if(data.info == 'backToinactivity') data.info = 'Abort by user activity';
			if(data.messsage) data.info = data.messsage;
			scope.log.append({error: data.isError ,message: [moment().format("YYYY-MM-DD HH:mm:ss"),'The process was closed',data.info].join(' | ')});
			scope.events.emit('reject',{reject:data,config:config});
			console.log('exited',data,child,config);
		});
		child.once('reject',function(code){
			child.emit('exited',{type:'exit',code:code});
		});
		['error','disconnect'].forEach(function(eventName){
			child.on(eventName,function(data){
				var result = {
					type:eventName,
					code:0					
				}
				if(eventName == 'error') {
					result.code = 1;
					result.messsage = data.message ? util.format(data.message) : false
				}
				child.emit('exited',result);
			});
		});		
	}
	
};