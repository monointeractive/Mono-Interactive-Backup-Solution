<?php
namespace mono;
class App{
	 public function __construct(){
		$this->errors = [];
		$this->startTime = microtime(true); 
		$this->totalBackupFileCount = 0;		
		
		$this->registerEvents();

		$configPath = getenv("configPath");
		
		if($this->call('is_readable',$configPath)) $config = \mono\Json::decode(file_get_contents($configPath)); else {
			$this->echo($configPath.' not found!');
			exit(1);
		}
		if(empty($config)){
			$this->echo($configPath.' is empty!');
			exit(1);
		}
		$this->config = $config;
		$this->config->userBackupDir = getenv("userBackupDir");
		$this->config->logFileDir = getenv("logFileDir");
		$this->config->logFileDir = !empty($this->config->logFileDir) ? $this->config->logFileDir : '';

		$this->config->maxBackupExecutionTime = !empty($this->config->maxBackupExecutionTime) ? $this->config->maxBackupExecutionTime : 0;
		
		if($this->config->maxBackupExecutionTime){
			$this->echo('Force stop copying on: '.date('Y-m-d H:i:s',strtotime('+ '.($this->config->maxBackupExecutionTime).' minutes')));
			set_time_limit(($this->config->maxBackupExecutionTime * 60) + 10);
			declare(ticks=5);		
			register_tick_function(function(){
				$diff = ((microtime(true) - $this->startTime) + 1) / 60;
				if($diff > $this->config->maxBackupExecutionTime){
					trigger_error('Timeout after: '.$this->config->maxBackupExecutionTime.' min.',E_USER_WARNING);
					exit();
				}
			});			
		}		
		
		$this->echo('The log files will be stored: '.$this->config->logFileDir);
		if(empty($this->config->userBackupDir) || empty(trim($this->config->userBackupDir))){
			trigger_error('Backup folder is not writable: '.$this->config->userBackupDir, E_USER_ERROR);
			exit(1);
		}
		
		if(file_exists($this->config->userBackupDir)) $this->config->userBackupDir = $this->realpath($this->config->userBackupDir);
		if(!file_exists($this->config->userBackupDir)){
			$this->call('mkdir',$this->config->userBackupDir,0777,true);			
		}
		
		if(!is_writable($this->config->userBackupDir)){
			trigger_error('Backup folder is not writable: '.$this->config->userBackupDir, E_USER_ERROR);
			exit(1);
		}			
		
		$this->config->backupDir = $this->config->userBackupDir . SLASH . date('Y') . SLASH . date('m');
		$this->config->deleteAfterDays = !empty($this->config->deleteAfterDays) ? (int)$this->config->deleteAfterDays : 0;
		if(!$this->config->deleteAfterDays) $this->config->deleteAfterDays = 60;
		if($this->config->deleteAfterDays < 0) $this->config->deleteAfterDays = 0;

		$this->cleanUp();
		$this->openMainLogFile();
		
		$this->config->projects = !empty($this->config->projects) ? $this->config->projects : [];
		foreach($this->config->projects as $idx => $project){
			if(empty($project->enabled)) continue;
			$project->backupFileCount = 0;
			$project->zipFileArray = [];
			$project->fullName = '['.$project->name.']';
			trigger_error('Backup start: '.$project->fullName ,E_USER_NOTICE);		
			$this->backupProject($project);			 
			trigger_error('Backup complete: '.$project->fullName.' | Copy '.(int)$project->backupFileCount." file(s) to ".count($project->zipFileArray)." zip(s).",E_USER_NOTICE);
			$project = null;
			$this->config->projects[$idx] = null;
		}
	}
	 public function __call($method, $args){
        if (!method_exists($this, '_'.$method)) {
            throw new \Exception("unknown method [$method]");
        }
		$id = [];
		if(!empty($args)){
			$startTime = microtime(true); 
			foreach($args as $idx=>$arg){
				if(is_scalar($arg) && !is_array($arg)) $id[] = $arg; 
				else if(is_object($arg) && !($arg instanceof \Closure)){
					if(!empty($arg->fullName)) {
						$id[] = $arg->fullName;
					} 
					if(!empty($arg->path)) {
						$id[] = $arg->path;
					}
					if(method_exists($arg,'getPathname')) $id[] = $arg->getPathname();
				}
			}			
			if(!empty($id)){				
				$id = $method.': '.implode(', ',$id);
				$id = str_replace($this->config->userBackupDir.SLASH,'',$id);
				
			}
		}
        $result = call_user_func_array(array($this, '_'.$method),$args);
		if(!empty($id)){
			$diff = microtime(true) - $startTime;
			$alertTime = !empty($this->config->maxBackupExecutionTime) ?  (($this->config->maxBackupExecutionTime * 60) / 3) : 600;
			if($alertTime > 600) $alertTime = 600;			
			if($diff > $alertTime){
				trigger_error('Time-consuming ('.gmdate('H:i:s', $diff).'s) '.$id,E_USER_WARNING);
			}			
		}
		return $result;
    }
	
	private function realpath($path){
		if(empty($path)) return $path;
		if(!file_exists($path)) return $path;
		if(realpath($path)) return realpath($path);
		return $path;
	}
	
	private function echo($str,$err=false){
		$diff = microtime(true) - $this->startTime;		
		$str = gmdate('H:i:s', $diff).' '.trim($str);
		if(!$err) {
			echo($str . PHP_EOL);
		} else {
			fwrite(STDERR, $str . PHP_EOL);
		}
		usleep(10);
	}

	
	private function call(){
		$args = func_get_args();		
		$name = array_shift($args);
		$result  = call_user_func_array($name,$args);
		if(!$result){
			trigger_error('Calling '.$name.' problem: '.$args[0], E_USER_WARNING);
		}
		return $result;
	}
	private function callWithoutWarning(){
		$args = func_get_args();		
		$name = array_shift($args);
		$result  = call_user_func_array($name,$args);
		return $result;
	}	
	
	function handle_error($type, $message, $file, $line, $context = null){
		$str = implode(' | ',[ucfirst(str_replace(['e_','_'],['',' '],strtolower($this->getErrorStr($type)))),$message]);
		$traces = trim((string)((new \Exception)->getTraceAsString()));
		if(stripos($traces,'callWithoutWarning') !== false) return;
		$traces =  preg_split('/\r\n|\r|\n/',$traces);
		foreach($traces as $idx => $_trace){
				$trace = (string)$traces[$idx];
				if(stripos($trace,'.php(') !== false) {
					$trace = explode('.php(',$trace)[1];
				}
				$trace = explode('(',$trace)[0];
				$trace = str_ireplace('): ',':',$trace);
				$trace = str_ireplace('mono\\app-','',$trace);
				if(stripos($trace,'__call') !== false) $trace = '';
				if(stripos($trace,'{main}') !== false) $trace = '';
				if(stripos($trace,'[internal function]') !== false) $trace = '';
				if(stripos($trace,'call_user_func') !== false) $trace = '';
				if(stripos($trace,'handle_error') !== false) $trace = '';
				if(stripos($trace,'trigger_error') !== false) $trace = '';
				if(stripos($trace,'_construct')!== false) $trace = '';				
				if(stripos($trace,'closure')!== false) $trace = '';				
				$trace = trim($trace);
				if(empty($trace)) $trace = null;
				$traces[$idx] = $trace;
		}
		$trace = implode(' | ',array_filter($traces));
		if(!empty($trace)) $str = $str .= ' | Trace: '.$trace;
		$this->appendToLog($str);
		if(stripos($str,'error') !== false || stripos($str,'warning') !==false ) $this->errors[] = $str; else $this->echo($str);
		error_clear_last();
	}
	
	function handle_exception($e){
		$type = 'Exception';
		$message = $e->getMessage();				
		$file = $e->getFile();
		$line = $e->getLine();
		$this->handle_error($type, $message, $file, $line);
	}
		
	function shutdown($signo=null){
		//$this->cleanUp();
		$lastError = error_get_last();
		if(!empty($lastError) && is_array($lastError)){
			$lastError = (object)$lastError;
			if(!empty($lastError->message))	$this->handle_error($lastError->type,$lastError->message,$lastError->file,$lastError->line);			
		}
		if(!empty($this->errors)) {
			if(count($this->errors) > 50) $this->errors = array_slice($this->errors, -50);
			$this->echo('A few recent problems while making a backup ('.count($this->errors).'):',true);
			foreach($this->errors as $error){
				$this->echo(explode('| Trace:',$error)[0],true);
			}
			if(!$this->totalBackupFileCount) exit(1);
		}
	}
	
	function registerEvents(){		
		@ini_set('display_errors', 0);
		$error_reporting = E_ALL;
		register_shutdown_function(array($this, 'shutdown'));
		set_error_handler(array($this,'handle_error'),$error_reporting);
		set_exception_handler(array($this,'handle_exception'));	
		error_reporting($error_reporting);		
	}
	
	private function openMainLogFile(){
		$this->logFilePath = (!empty($this->config->logFileDir) ? $this->config->logFileDir : $this->config->userBackupDir . SLASH . 'logs') . SLASH . 'backup-'.date('Ymd').'.log';
		if(!file_exists(dirname($this->logFilePath))){
			$this->call('mkdir',dirname($this->logFilePath),0777,true);			
		}		
		if(!$this->call('is_writable',dirname($this->logFilePath))){
			trigger_error('Logs folder is not writable: '.basename($this->logFilePath).'. Exit', E_USER_ERROR);
			exit(1);
		}

		$this->logFileHandle = $this->call('fopen',$this->logFilePath, "a+");
		if(!($this->logFileHandle && (get_resource_type($this->logFileHandle) === 'file' || get_resource_type($this->logFileHandle) === 'stream'))){
			trigger_error('Logs file is not writable: '.($this->logFilePath).'. Exit', E_USER_ERROR);
			exit(1);
		} 
		
		if (!flock($this->logFileHandle,LOCK_EX | LOCK_NB)){
			trigger_error('The log file can not be saved. Perhaps the process is busy doing backup: '.$this->logFilePath.'. Exit', E_USER_NOTICE);
			exit(1);
		}
  
		return $this->logFileHandle;
	}
	
	private function appendToLog($str){
		if($this->logFileHandle && (get_resource_type($this->logFileHandle) === 'file' || get_resource_type($this->logFileHandle) === 'stream')){
			fwrite($this->logFileHandle, date('Y-m-d H:i:s').' '.$str."\n");
		}
	}
	private function closeMainLog($str){
		if($this->logFileHandle && (get_resource_type($this->logFileHandle) === 'file' || get_resource_type($this->logFileHandle) === 'stream')){
			fclose($this->logFileHandle);
		}
	}
	private function openProjectControlList($project){
		$project->controlFilePath = $this->config->backupDir . SLASH . 'logs' . SLASH . $project->name . '.log';
		if(!file_exists(dirname($project->controlFilePath))){
			@$this->call('mkdir',dirname($project->controlFilePath),0777,true);
		}
		if($this->call('is_writable',dirname($project->controlFilePath))){
			$project->controlList = file_exists($project->controlFilePath) ? file_get_contents($project->controlFilePath) : '';
			preg_match_all('/_[a-z0-9]{5}_/im', $project->controlList, $crcs);
			$crcs  = count($crcs) == 1 ? $crcs[0] : [];
			$project->controlList = [];
			foreach($crcs as $crc){
				$project->controlList[$crc] = true;
			}
			
			$project->controlFileHandle = fopen($project->controlFilePath, "a+");
			return $project->controlFileHandle;
		}
	}
	
	private function closeProjectControlList($project){
		if($project->controlFileHandle && (get_resource_type($project->controlFileHandle) === 'file' || get_resource_type($project->controlFileHandle) === 'stream')){
			fclose($project->controlFileHandle);
			$project->controlFileHandle = null;
			$project->controlList = [];
		}
	}	
	
	private function _removeEmptyDir($path){
		 $empty=true;
		  foreach (@glob($path.DIRECTORY_SEPARATOR."*") as $file){
			 $empty &= is_dir($file) && @$this->removeEmptyDir($file);
		  }
		  return $empty && $this->callWithoutWarning('rmdir',$path);
	}
	
	private function _cleanUp(){
		$this->echo('Deleting copies older than: '.$this->config->deleteAfterDays.' days');
		if(is_readable($this->config->userBackupDir)){
			$rdItr = new \RecursiveDirectoryIterator($this->config->userBackupDir,\RecursiveDirectoryIterator::SKIP_DOTS | \RecursiveDirectoryIterator::FOLLOW_SYMLINKS);
			$dirItr  = new \RecursiveIteratorIterator($rdItr);
			foreach ($dirItr as $filePath => $fileInfo) {
				$path = $fileInfo->getPathname();
				 if(!$dirItr->isDir() && $this->call('is_readable',$path) && (strtotime('-'.$this->config->deleteAfterDays.' days') > filemtime($path) || stripos(basename($path),'.zip.')!==false)){
					if(stripos($path,'.zip') !==false) $this->echo('Remove old files from backup folder | '.str_replace($this->config->userBackupDir . SLASH, '', $path));
					$this->callWithoutWarning('unlink',$path);
				 }
			}			
			$this->removeEmptyDir($this->config->userBackupDir);
		}
	}
	
	private function entryCrc($entry){
		return '_'.substr(md5($entry['project'].$entry['path'].$entry['time']),0,5).'_';
	}
	
	private function entryToStr($entry){
		 return trim(preg_replace('/\s+/', ' ', \mono\Json::encode($entry)));
	}
	
	private function entryExistsInControlList($project,$entry){
		return isset($project->controlList[$this->entryCrc($entry)]);
	}
	
	private function addEntryToControlList($project,$_entry){
		$crc = $this->entryCrc($_entry);
		$_entry['crc'] = $crc;
		$entry = $this->entryToStr($_entry)."\n";
		if(fwrite($project->controlFileHandle, $entry)){
			$project->controlList[$crc] = true;			
			$this->echo('Added | '.$project->fullName.': '.trim(str_ireplace($project->path,'',$_entry['path']),SLASH).' to '.basename($_entry['zip'])."\n");
			return true;
		}
	}
	
	private function configureFilters($project){
		$filters = (object)[];
		$filters->accept = !empty($project->accept) ? $project->accept : '';
		$filters->accept = str_replace([' ',';',',','|'],';',$filters->accept);
		$filters->accept = explode(';',$filters->accept);
		foreach($filters->accept as $idx=>$filter){
			$filters->accept[$idx] = str_replace('/',SLASH,$filters->accept[$idx]);
			$filters->accept[$idx] = str_replace('*','_wildcard_',$filter);
			$filters->accept[$idx] = preg_quote($filters->accept[$idx]);
			$filters->accept[$idx] = str_replace('_wildcard_','(.*)',$filters->accept[$idx]);		
			$filters->accept[$idx] = trim($filters->accept[$idx]);
			if(empty($filters->accept[$idx])) $filters->accept[$idx] = null;
		}
		
		$filters->accept = array_filter($filters->accept);
		
		$filters->exclude = !empty($project->exclude) ? $project->exclude : '';
		$filters->exclude = str_replace([' ',';',',','|'],';',$filters->exclude);
		$filters->exclude = explode(';',$filters->exclude);
		$filters->exclude[] = '*~$*.*';
		//$filters->exclude[] = '*/windows/*';
		$filters->exclude[] = dirname(dirname(__dir__));
		$filters->exclude[] = '*/tmp/*';
		$filters->exclude[] = '*/logs/*';
		$filters->exclude[] = '*/temp/*';
		$filters->exclude[] = '*.svn/*';
		$filters->exclude[] = '*.tmp';
		$filters->exclude[] = '*.crdownload';
		foreach($filters->exclude as $idx=>$filter){
			$filters->exclude[$idx] = str_replace('/',SLASH,$filters->exclude[$idx]);
			$filters->exclude[$idx] = str_replace('*','_wildcard_',$filters->exclude[$idx]);
			$filters->exclude[$idx] = preg_quote($filters->exclude[$idx]);
			$filters->exclude[$idx] = str_replace('_wildcard_','(.*)',$filters->exclude[$idx]);		
			$filters->exclude[$idx] = trim($filters->exclude[$idx]);
			if(empty($filters->exclude[$idx])) $filters->exclude[$idx] = null;
		}
		$filters->exclude = array_filter($filters->exclude);
		return $filters;
	}
	
	private function backupProject($project){
		$project->path = str_replace('/',SLASH,$project->path);
		$project->path = $this->realpath($project->path);
		$project->name = \mono\Text::urlFriendlyName(\mono\Text::truncate(str_replace(['-','_'],' ',basename($project->name)),30));
		
		$project->maxFileSizeMb = !empty($project->maxFileSizeMb) ? (int)$project->maxFileSizeMb : 0;
		$project->maxFileSizeMb = empty($project->maxFileSizeMb) ? 50 : $project->maxFileSizeMb;
		
		$project->maxZipFileSizeMb = !empty($project->maxZipFileSizeMb) ? (int)$project->maxZipFileSizeMb : 0;
		$project->maxZipFileSizeMb = empty($project->maxZipFileSizeMb) ? 50 : $project->maxZipFileSizeMb;
		$project->filters = $this->configureFilters($project);
		//var_dump($project);exit();
		//var_dump($project);	 sleep(1);

		if($this->call('is_readable',$project->path)){
			if($this->openProjectControlList($project)){
				$this->scanProjectDir($project);
				$this->closeProjectControlList($project);
			}
		}
	}
	
	private function is_allow($project,$fileInfo){
		if($fileInfo->isDir()) {
			return true;
		}
		foreach($project->filters->accept as $filter){
			$result = preg_match('/^'.$filter.'$/i', $fileInfo->getPathname());
			if(!empty($result)) return true;
		}
	}
	
	private function is_exclude($project,$fileInfo){
		foreach($project->filters->exclude as $filter){
			$result = preg_match('/^'.$filter.'$/i', $fileInfo->getPathname());
			if(!empty($result)) return true;
		}
		if($fileInfo->isDir()) $this->echo('Scan | '.$project->fullName.': '.trim(str_ireplace($project->path,'',$fileInfo->getPathname()),SLASH)."\n");
	}
	
	private function _listDir($projectInfo,$path,$callback){
		$scope = $this;
		foreach (new \DirectoryIterator($path) as $fileInfo) {
			if($fileInfo->isDot()) continue;
			$realPath = $this->realpath($fileInfo->getPathname());
			$fileInfo = new \SplFileInfo($realPath);			
			if($callback($fileInfo) === false) continue;
			if($fileInfo->isDir()){			
				if($scope->call('is_readable',$realPath)) $scope->listDir($projectInfo,$realPath,$callback);
			}
		}
	}
	private function scanProjectDir($project){
		$excludeRepeatedPath = [];
		if($this->call('is_readable',$project->path)){
			$scope = $this;			
			$this->listDir((object)["fullName"=>$project->fullName],$project->path,function($fileInfo) use($scope,$project,&$excludeRepeatedPath){
				$path = $fileInfo->getPathname();
				if($scope->is_exclude($project,$fileInfo) || !$scope->is_allow($project,$fileInfo) || isset($excludeRepeatedPath[$path])) return false;
				$excludeRepeatedPath[$path] = true;											
				if(!$fileInfo->isDir()){
					$this->backupProjectFile($project,$fileInfo);
				}
			});
		}		
	}
    private function getExtension($path){
		$pathInfo = pathinfo($path);
		$pathInfo['extension'] = !empty($pathInfo['extension']) ? $pathInfo['extension'] : '';
		return strtolower($pathInfo['extension']);
	}
	private function _backupProjectFile($project,$fileInfo){
		$filePath = $fileInfo->getPathname();
		if($this->call('is_readable',$filePath) && ((int)(@filesize($filePath)) / 1048576) <= $project->maxFileSizeMb){
			$ext = $this->getExtension($filePath);
			$name = trim(str_replace($project->path,'',$filePath),SLASH);
			if(strpos($name,SLASH)===false) $name = basename(dirname($filePath));
			$name = explode(SLASH,$name)[0];
			$name = \mono\Text::truncate(pathinfo($name)['filename'],30);
			$name = \mono\Text::urlFriendlyName($name);
			if(empty($name)) $name = 'null';
			if(empty($ext)) $ext = 'null';
			$name = $name . SLASH . $ext.'s';
			$zipPath = $this->config->backupDir . SLASH . date('d') . SLASH . $project->name . SLASH .$name . '.zip';
			
			//$this->echo('Added | '.$zipPath);			
			$this->addToZip($project,$zipPath,$fileInfo);
		}
	}
	private function _zipPartName($project,$path){
		$dirName = dirname($path);
		$zipname = basename($path,'.zip');
		for ($i = 0; $i <= 100; $i++) {
			$checkName = $zipname;
			if($i) $checkName .= '.'.sprintf('%03d', $i);
			$checkName = $dirName . SLASH . $checkName.'.zip';			
			if(!file_exists($checkName)) return $checkName;
			if(is_writable($checkName) && (((int)(@filesize($checkName))) / 1048576) < $project->maxZipFileSizeMb) return $checkName;
		}
		return $path;
	}
	private function _addToZip($project,$zipPath,$fileInfo){		
		$errors = [];
		$complete = false;
		if($project->controlFileHandle && (get_resource_type($project->controlFileHandle) === 'file' || get_resource_type($project->controlFileHandle) === 'stream')){
			$filePath = $fileInfo->getPathname();
			$fileTime = date('Y-m-d H:i:s',$fileInfo->getMTime());
			$unixDirName = trim(str_replace(SLASH,'/',explode(':',dirname($filePath))[1]),'/');
			$ext = $this->getExtension($filePath);
			$entry = ["project"=>$project->name,"path"=>$filePath,"time"=>$fileTime,"zip"=>$zipPath];
			if(!$this->entryExistsInControlList($project,$entry)){			
				$zip = new \ZipArchive();
				if(!file_exists(dirname($zipPath))){
					$this->call('mkdir',dirname($zipPath),0777,true);
				}
				$zipPath = $this->zipPartName($project,$zipPath);
				$this->echo('Check | '.$project->fullName.': '.trim(str_ireplace($project->path,'',$filePath),SLASH).' to '.basename($zipPath)."\n");
				$entry['zip']=$zipPath;
				if(!$this->call('is_writable',dirname($zipPath))) {
					$errors[] = 'Folder is not writable: '.basename(dirname($zipPath));
				} else {
					if(file_exists($zipPath) && !$this->call('is_writable',$zipPath)) $errors[] = 'Writtable: '.basename($zipPath);
					 
					if (empty($errors) && $zip->open($zipPath, \ZIPARCHIVE::CREATE) === true) {
						$unixFilePath = $unixDirName.'/'.basename($filePath);
						if(!@$zip->addFile ($filePath,$unixFilePath)){
							$errors[] = 'Add file: '.basename($filePath);
						} else {
							$complete = true;
							if(in_array($ext,['pdf','jpg','jpeg','gif','zip','rar','arj','docx','pptx','xlsx','avi','mp4','mkv','flv','rmvb','ogg','mp3','exe','dll','jar','pak','cab','pac','dat','bin','fla']) || (strlen($ext) == 3 && $ext[2] == 'z' ) || (strlen($ext) == 4 && $ext[3] == 'z')){
								$zip->setCompressionName($unixFilePath, \ZipArchive::CM_STORE);
							}							
						}
						
						if(!@$zip->close()) $errors[] = 'Problem with writing file: '.($zipPath);
					}
				}
				if(empty($errors)) {
					if(!$this->addEntryToControlList($project,$entry)) $errors[] = 'Problem with adding a file to the checklist: '.trim(str_ireplace($project->path,'',$filePath),SLASH);
				}
			}
		} else {
			$errors[] = 'Handle not exist | '.$project->controlFilePath.' | '.get_resource_type($project->controlFileHandle);
		}
		if(!empty($errors)){
			foreach($errors as $error){
				trigger_error($error,E_USER_WARNING);
			}			
			$complete = false;
		} 
		if($complete){
			$project->backupFileCount = isset($project->backupFileCount) ? $project->backupFileCount + 1 : 1;			
			$project->zipFileArray[$zipPath] = true;
			$this->totalBackupFileCount++;
		}
	}
	
	private function getErrorStr($type){
		switch($type){
			case 'Exception': return 'Exception'; 
			case E_ERROR: return 'E_ERROR'; 
			case E_WARNING: return 'E_WARNING'; 
			case E_PARSE: return 'E_PARSE'; 
			case E_NOTICE: return 'E_NOTICE'; 
			case E_CORE_ERROR: return 'E_CORE_ERROR'; 
			case E_CORE_WARNING: return 'E_CORE_WARNING'; 
			case E_COMPILE_ERROR: return 'E_COMPILE_ERROR'; 
			case E_COMPILE_WARNING: return 'E_COMPILE_WARNING'; 
			case E_USER_ERROR: return 'E_ERROR'; 
			case E_USER_WARNING: return 'E_WARNING'; 
			case E_USER_NOTICE: return 'E_NOTICE'; 
			case E_STRICT: return 'E_STRICT'; 
			case E_RECOVERABLE_ERROR: return 'E_RECOVERABLE_ERROR'; 
			case E_DEPRECATED: return 'E_DEPRECATED'; 
			case E_USER_DEPRECATED: return 'E_DEPRECATED'; 
		}
		return 'UNKNOW_ERROR_'.$type; 
	}
	
	private function time_ago( $timestamp = 0, $now = 0 ) {
		$minute_in_seconds = 60;
		$hour_in_seconds   = $minute_in_seconds * 60;
		$day_in_seconds    = $hour_in_seconds * 24;
		$week_in_seconds   = $day_in_seconds * 7;
		$month_in_seconds  = $day_in_seconds * 30;
		$year_in_seconds   = $day_in_seconds * 365;
		if ( 0 === $now ) {
			$now = time();
		}

		if ( $timestamp > $now ) {
			throw new Exception( 'Timestamp is in the future' );
		}

		$time_difference = (int) abs( $now - $timestamp );
		if ( $time_difference < $hour_in_seconds ) {
			$difference_value = round( $time_difference / $minute_in_seconds );
			$difference_label = 'minute';
		} elseif ( $time_difference < $day_in_seconds ) {

			$difference_value = round( $time_difference / $hour_in_seconds );
			$difference_label = 'hour';
		} elseif ( $time_difference < $week_in_seconds ) {

			$difference_value = round( $time_difference / $day_in_seconds );
			$difference_label = 'day';
		} elseif ( $time_difference < $month_in_seconds ) {

			$difference_value = round( $time_difference / $week_in_seconds );
			$difference_label = 'minute';
		} elseif ( $time_difference < $year_in_seconds ) {

			$difference_value = round( $time_difference / $month_in_seconds );
			$difference_label = 'month';
		} else {
			$difference_value = round( $time_difference / $year_in_seconds );
			$difference_label = 'year';
		}

		if ( $difference_value <= 1 ) {
			$time_ago = sprintf( 'one %s ago',
				$difference_label
			);
		} else {
			$time_ago = sprintf( '%s %ss ago',
				$difference_value,
				$difference_label
			);
		}
		return $time_ago;
	}	
}