var backup = new runAndLog({
	title:'Backup progress',
	id:'backup',
	exec:path.join(binDir,'php','php.exe'),
	args:['-f',path.join(binDir,'php','start.php'),'-c',path.join(binDir,'php','php.ini')],//,'-d','extension_dir='+path.join(binDir,'php','ext')],	
	onBeforeStart: function(){
		var env = $.extend({},process.env);		
		env.userBackupDir = this.getUserBackupDir();
		env.logFileDir = this.getLogFileDir();
		env.configPath = config.path;
		this.config.params = {cwd:path.join(binDir,'php'),env:env,stdio: ['pipe']};
	},
	onBeforeAddEntry: function(entryEl){
		$(entryEl).each(function(){
			var text = ($(this).attr('title') || '').toLowerCase();
			if(text.indexOf('check |') > -1) {
				$(this).attr('data-group','adding');
			} else 
			if(text.indexOf('added |') > -1) {
				$(this).attr('data-group','added');
			} else 
			if(text.indexOf('scan |') > -1) {
				$(this).attr('data-group','scan');
			} else 
			if(text.indexOf('remove old files from backup folder') > -1) {
				$(this).attr('data-group','remove');
			}
		});
	}
});
backup.getLogFileDir = function(){
	return path.join(this.getUserBackupDir(),'logs');
}
backup.getUserBackupDir = function(){
	return path.join(
				config.data.rootBackupDir,
				clearLink(typeof config.data.userdomain =='string' && config.data.userdomain.length ? config.data.userdomain : 'computer'),
				clearLink(typeof config.data.username =='string' && config.data.username.length ? config.data.username : 'user')
			);
}
backup.events.on('start',function(){
	console.log('start');
	$('.monobox').triggerHandler('hide');
	tray.changeIcon('backup');	
});

backup.events.on('reject',function(data){
	tray.changeIcon(!data.reject.isError ? 'default' : 'warning');	
	if(data.reject.code !='userexit' && !win.closeCount) app.sync.start({backupRejectData:data.reject});
});