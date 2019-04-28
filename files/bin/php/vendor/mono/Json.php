<?php
namespace mono;
class_alias('\mono\Json', 'Json',true);

 if(!function_exists('json_last_error_msg')) {
	function json_last_error_msg() {
		$ERRORS = [JSON_ERROR_NONE => 'No error',JSON_ERROR_DEPTH => 'Maximum stack depth exceeded',JSON_ERROR_STATE_MISMATCH => 'State mismatch (invalid or malformed JSON)',JSON_ERROR_CTRL_CHAR => 'Control character error, possibly incorrectly encoded',JSON_ERROR_SYNTAX => 'Syntax error',JSON_ERROR_UTF8 => 'Malformed UTF-8 characters, possibly incorrectly encoded'];
		$error = json_last_error();
		return isset($ERRORS[$error]) ? $ERRORS[$error] : 'Unknown error';
	}
}

class Json{
	 public static function encode($data, $options = JSON_UNESCAPED_UNICODE, $depth = 512){
		$data = self::removeNonUtf8($data);
		if(empty($data) && !is_numeric($data) && !is_bool($data)) $data = null;		
		$data = json_encode($data, $options);
		if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
			trigger_error(json_last_error_msg(),E_USER_WARNING);
		}	
		return $data;		
	}
	
	public static function decode($data, $assoc = false, $depth = 512, $options = 0){
		$data = json_decode($data, $assoc, $depth, $options);
		if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
			trigger_error(json_last_error_msg(),E_USER_WARNING);
		}
		return $data;
	}	
	public static function removeNonUtf8($mixed){
		$export = null;
		try{
			$export = var_export($mixed , true);
			$export = preg_replace('/[\\\a-zA-Z0-9_-]+::__set_state/', '', $export);
			$export = str_replace(':protected', '', $export);
			$export = str_replace(':private', '', $export);
			$export = iconv('UTF-8', 'UTF-8//IGNORE', $export);		
			eval('$export=' . $export . ';');					
		} 
		catch (\Throwable $t){ $export = null;return; trigger_error($t->getMessage(), E_USER_WARNING);} 
		catch (\Exception $e){ $export = null;return; trigger_error($e->getMessage(), E_USER_WARNING);}
		
		if($export)
			$mixed = $export;
		return $mixed;
	}
}