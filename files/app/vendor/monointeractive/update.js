var update = new runAndLog({
	title:'Update progress',
	id:'update',
	exec:path.join(execDir,'mbs_updater.exe'),
	params:{
		env:{
			targetDir:path.join(execDir, (debugMode ? 'ignore\\updates' : 'updates'))
		}
	}
});
 
update.events.on('start',function(){
	tray.changeIcon('backup');	
});
update.events.on('reject',function(data){
	if(fs.existsSync(path.join(execDir,'updates','mbs.exe'))){
		try{
			fs.copyFileSync(path.join(execDir,'updates','mbs.exe'), path.join(execDir,'mbs.exe'));				
		} catch(err){console.error(err);}
	}
	tray.changeIcon(!data.reject.isError ? 'default' : 'warning');	
});