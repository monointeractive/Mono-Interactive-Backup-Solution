(function($){
	if(typeof $.fn.mono !='object' && typeof $.fn.mono !='function'){		
		$.mono = {};
		$.fn.mono = function(method) {
			if ($.mono[method]) return $.mono[ method ].apply( this, Array.prototype.slice.call( arguments, 1 )); else $.error( 'Plugin mono.' +  method + ' does not exist.' );
		};
	}
	
	var ajaxData = {
		cache:[]
	};
	
	$.mono.get = function(){
		var args = [];
		for (var i = 0; i < arguments.length; i++) { 
			args.push(arguments[i]);
		}		
		return this.getORPost.call(this,{type:'GET',arguments:args});
	}
	
	$.mono.post = function(){		
		var args = [];
		for (var i = 0; i < arguments.length; i++) { 
			args.push(arguments[i]);
		}
		return this.getORPost.call(this,{type:'POST',arguments:args});
	}
	
	$.mono.getORPost = function(settings){
		settings = settings || {};
		settings.type = settings.type || 'GET';
		settings.arguments = settings.arguments || [{}];
		var config = {};
		if(settings.arguments.length == 1 && typeof settings.arguments[0] == 'object') {
			config = settings.arguments[0];
			config.type = settings.type;
		} else {			
			if(typeof settings.arguments[1] == 'function'){
				settings.arguments.splice( 1, 0, null );
			}
			config = {
				type : settings.type,
				url : settings.arguments[0],
				data : settings.arguments[1],
				success : settings.arguments[2],
				dataType : settings.arguments[3]
			};
		}
		for(var i in config){
			if(typeof config[i] == 'undefined') delete config[i];
		}	
		return this.ajax.call(this,config);
	}
	
	$.mono.ajax = function(){
		if(arguments[0] == 'clearCache') {
			if(typeof arguments[1] !='string') {
				ajaxData.cache = [];
				return;
			}
			var cacheId = arguments[1];
			delete ajaxData.cache[cacheId];
			return;
		}
		var ajaxSetupConfig = $.ajaxSetup();
		ajaxSetupConfig = ajaxSetupConfig && typeof ajaxSetupConfig == 'object' ? ajaxSetupConfig : {};
		var config = (typeof arguments[0] == 'string' && arguments[1] == 'object') ? arguments[1] : arguments[0];
		config = config && typeof config == 'object' ? config : {};		
		
		config = $.extend(true,{},ajaxSetupConfig,config);
		delete config.state;
		config.url = typeof arguments[0] == 'string' ? arguments[0] : config.url;
		config.retry = typeof config.retry == 'number' ? config.retry : 0;
		config.retryTimeout = typeof config.retryTimeout == 'number' ? config.retryTimeout : 3000;
		config.retrySupport = true;		
		
		if(config.cacheId && ajaxData.cache[config.cacheId]){
			var ajax = ajaxData.cache[config.cacheId];			
			ajax.fromCache = true;
			if(typeof config.success == 'function') {
				ajax.done(function(){
					if(!config.state) config.success.apply(this,arguments);					
					config.state = 'resolve';
				});
			}					
			if(typeof config.error == 'function') {
				ajax.fail(function(){
					if(!config.state) config.error.apply(this,arguments);					
					config.state = 'failed';
				});
			}							
			return ajax;
		};
		
		var stack = null;
		if(typeof Error == 'function'){
			stack = (new Error()).stack;													
		}
		if(typeof stack != 'string' || !stack || stack == ''){													
			try{
				fakeError();
			} catch(err){
				if(typeof err == 'object' && err && typeof err.stack == 'string'){
					stack = err.stack;														
				}
			}
		}
		
		var ajaxPromise = function(_config){
			var dfd = jQuery.Deferred();			
			var request = function(config){
				var config = _config;
				var ajaxConfig = $.extend({},_config);
				delete ajaxConfig.error;
				delete ajaxConfig.success;
				
				var ajax = jQuery.ajax(ajaxConfig);
				if(stack) ajax.stack = stack;
				ajax.config = config;
				
				ajax.done(function(){
					if(typeof config.success == 'function' && !config.state) {
						config.success.apply(this,arguments);
						config.state = 'resolve';
					}					
					dfd.resolve.apply(null,arguments);
				}).fail(function(){					
					if(typeof arguments[0] == 'object' && typeof arguments[0].config == 'object' && typeof arguments[0].config.retry =='number' && arguments[0].config.retry > 0){
						config.retry --;
						setTimeout(function(){
							request(config);							
						},config.retryTimeout);
					} else {
						if(typeof config.error == 'function' && !config.state) {
							config.state = 'failed';
							config.error.apply(this,arguments);
						}
						dfd.reject.apply(null,arguments);
					}
				});
			}
			request(config);
			return dfd.promise();
		}
		var promise = ajaxPromise(config);
		promise.fromCache = false;				
		promise.config = config;				
		if(config.cacheId) ajaxData.cache[config.cacheId] = promise;
		return promise;
	}
})( jQuery );