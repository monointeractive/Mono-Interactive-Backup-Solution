var config = new (function(){
	var scope = this;
	scope.init = function(){
		if(nodeEnv)	{
			scope.path = path.join(userDir,'config.json');
		} else {
			scope.data = {"deleteAfterDays":60,"projects":[{"enabled":false,"name":"Neta","path":"E:/dokumenty/neta","accept":"*.docx"},{"enabled":false,"name":"Neta2","path":"E:/downloads","accept":"*.*","maxFileSizeMb":900},{"enabled":true,"name":"Etc","path":"C:/Windows/System32/drivers/etc","accept":"*","maxFileSizeMb":900},{"enabled":false,"name":"Narzedzia","path":"E:/narzedzia","accept":"*.js;*.json","exclude":"*/node_modules/*;*/locales/*;*/node/*;*.h","maxFileSizeMb":100}],"lastRun":"2019-04-17 22:12:03","firstRun":"2019-04-17 09:00:49","lastClose":"2019-04-17 22:11:59"};			
		}	
		scope.data = scope.data || {
			inactivityDelay:(60 * 10),
			deleteAfterDays:90,
			rootBackupDir:path.join(userDir,'backups'),
			maxBackupExecutionTime:180,
			userdomain:process.env.userdomain || '',
			username:process.env.username || '',
			server:{
				type:'',
				port:'',
				remoteDir:'',
				user:'',
				password:''
			}
		};
		var loadFromFile = false;
		if(scope.path && fs.existsSync(scope.path)) {
			var data = {};
			try{
				var data = fs.readFileSync(scope.path, 'utf8');
				data = JSON.parse(data);
			} catch(err){console.error(err)};
			if(data && typeof data =='object') {
				loadFromFile = true;
				scope.data = $.extend(true,{},scope.data,data);
			}
		}
		scope.data = typeof scope.data == 'object' ? scope.data : {};
		var currentDate = moment().format("YYYY-MM-DD HH:mm:ss");
		if(!scope.data.firstRun) scope.data.firstRun = currentDate;
		scope.data.lastRun = currentDate;
		console.log('config','load',scope.path,scope.data);
		if(!loadFromFile) scope.save();
	}
	scope.save = function(){		
		if(scope.path) {
			var json = JSON.stringify($.extend(true,{},(scope.data || {})),null,3);
			console.log('config','save',JSON.parse(json));
			fs.writeFileSync(scope.path, json ,'utf8');
		}
	}
});