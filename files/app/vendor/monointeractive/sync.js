var sync = new runAndLog({
	title:'Sync progress',
	id:'sync',
	exec:path.join(binDir,'mbs_sync.exe'),
	onBeforeStart:function(){
		var serverConfig = extend(true,{},(config.data.server || {}));
		this.config.userBackupDir = backup.getUserBackupDir();
		this.config.syncBackupDir = path.dirname(this.config.userBackupDir);
		var logDir = path.join(backup.getLogFileDir());
		if(!(serverConfig.type =='string' && serverConfig.type.length)){
			showNotify({title:'Synchronization',message:'Synchronization is disabled'});
			return false;
		}
		if(!fs.existsSync(logDir)) {
			showNotify({title:'No backup found in path ',message:this.config.userBackupDir});
			return false;
		}
		if(typeof serverConfig.user =='string' && serverConfig.user.length && typeof serverConfig.host =='string' && serverConfig.host.length){
			this.config.params = {cwd:path.dirname(config.path),stdio: ['pipe']};			
			var env = $.extend({},process.env);
			env.logPath = path.join(logDir,'transfer-'+moment().format("YYYYMMDD")+'.log');
			env.backupDir = this.config.syncBackupDir;
			serverConfig.user = $.trim(serverConfig.user);
			serverConfig.pass = $.trim(serverConfig.pass);
			serverConfig.port = _parseInt(serverConfig.port);
			serverConfig.remoteDir = $.trim(serverConfig.remoteDir);
			serverConfig.remoteDir = serverConfig.remoteDir.length ? serverConfig.remoteDir : '/';
			serverConfig.remoteDir = serverConfig.remoteDir[0] !='/' ? '/'+serverConfig.remoteDir : serverConfig.remoteDir;

			env.serverUrl = []
			env.serverUrl.push(serverConfig.type + '://');
			if(serverConfig.pass.length) env.serverUrl.push(encodeURIComponent(serverConfig.pass)+':');
			env.serverUrl.push(encodeURIComponent(serverConfig.user)+'@');
			env.serverUrl.push(serverConfig.host);
			if(serverConfig.port) env.serverUrl.push(':'+serverConfig.port);	
			env.serverUrl.push(serverConfig.remoteDir);
			env.serverUrl[env.serverUrl.length -1] = encodeURIComponent(env.serverUrl[env.serverUrl.length -1]).split('%2F').join('/');
			env.serverUrl = env.serverUrl.join('');
			env.remoteDir = serverConfig.remoteDir;
			this.config.params.env = env;
		} else {
			showNotify({title:'Synchronization',message:'Remote server connection in not configured'});
			return false; 
		}	
	},
	onBeforeAddEntry: function(entryEl){
		var scope = this;
		$(entryEl).each(function(){
			var title = ($(entryEl).attr('title') || '');
			var group;
			title = title.replace(scope.config.userBackupDir,'');
			var text = title.toLowerCase();			
			if(text.indexOf('.zip') > -1  && text.indexOf('%') > -1) {
				group = 'transfer';
				title = 'Transfering: '+title;
			}
			if(group) $(entryEl).attr('data-group',group);
			$(entryEl).attr('title',title);
		});
	}	
});
sync.events.on('start',function(){	
	//$('.monobox').triggerHandler('hide');
	//tray.changeIcon('backup');	
});
sync.events.on('reject',function(data){
	//tray.changeIcon(!((data.config || {}).backupRejectData || {}).isError && !data.reject.isError ? 'default' : 'warning');	
});