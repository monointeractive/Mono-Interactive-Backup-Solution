var update = new runAndLog({
	title:'Update progress',
	id:'update',
	exec:path.join(execDir,'mbs_updater.exe'),
	params:{
		env:{targetDir:path.join(execDir,'updates')}
	}
});

update.events.on('start',function(){
	tray.changeIcon('backup');	
});

update.events.on('reject',function(data){
	tray.changeIcon(!data.reject.isError ? 'default' : 'warning');	
});