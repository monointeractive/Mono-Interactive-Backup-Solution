<?php
if(!defined('SLASH')) define('SLASH', DIRECTORY_SEPARATOR);
spl_autoload_register(function ($class) { 
	$filePath = trim($class,'\\');
	$filePath = str_replace('\\', SLASH,dirname(__DIR__) . SLASH . trim($filePath,SLASH) .'.php');
	if(!file_exists($filePath)) {
		$filePath = __DIR__ . SLASH . basename($filePath);
		if(file_exists($filePath)) {
			class_alias('mono\\'.basename($filePath,'.php'), $class);
		} else {
			return false;
		}
	}
	require_once($filePath);
},true);
?>