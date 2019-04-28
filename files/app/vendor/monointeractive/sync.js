var sync = new runAndLog({
	title:'Sync progress',
	id:'sync',
	exec:path.join(binDir,'winscp','winscp.com'),
	onBeforeStart:function(){
		this.config.userBackupDir = backup.getUserBackupDir();
		this.config.syncBackupDir = path.dirname(this.config.userBackupDir);
		var logDir = path.join(backup.getLogFileDir());
		if(!fs.existsSync(logDir)) return showNotify({title:'No backup found in path ',message:this.config.userBackupDir});
		var serverConfig = $.extend({},(config.data.server || {}));
		if(typeof serverConfig.type =='string' && serverConfig.type.length && typeof serverConfig.user =='string' && serverConfig.user.length && typeof serverConfig.host =='string' && serverConfig.host.length){
			this.config.args = [
				'/log='+path.join(logDir,'transfer-'+moment().format("YYYYMMDD")+'.log'),
				'/ini=nul',
				'/script='+path.join(binDir,'winscp','sync.txt')+''
			],	
			this.config.params = {cwd:path.dirname(config.path),stdio: ['pipe']};			
			var env = $.extend({},process.env);
			env.backupDir = this.config.syncBackupDir;
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
	tray.changeIcon('backup');	
});
sync.events.on('reject',function(data){
	tray.changeIcon(!((data.config || {}).backupRejectData || {}).isError && !data.reject.isError ? 'default' : 'warning');	
});