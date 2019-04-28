(function($){
	if(typeof $.fn.mono !='object' && typeof $.fn.mono !='function'){		
		$.mono = {};
		$.fn.mono = function(method) {
			if ($.mono[method]) return $.mono[ method ].apply( this, Array.prototype.slice.call( arguments, 1 )); else $.error( 'Plugin mono.' +  method + ' does not exist.' );
		};
	}
	if(typeof $.mono.setup != 'object') $.mono.setup = new (function(){this.scope = this;})();
	$.mono.setup.formValidator = function(config){
		this.scope.formValidatorConfig = config;
	};
	
	
	$.mono.formValidator = function(config){
		$.mono.setup.formValidatorConfig = $.mono.setup.formValidatorConfig || {};
		config = $.extend({},($.mono.setup.formValidatorConfig || {}),config || {});
		this.filter('form').each(function(idx,form){
			var items = [];
			var result = true;
			$('input, select,textarea',form).filter('[data-onvalidate]').each(function(idx,input){
				var validator = $(input).attr('data-onvalidate') ? $(input).attr('data-onvalidate') : null;
				var validatorError = $(input).attr('data-onvalidate') ? $(input).attr('data-onvalidateError') : null;
				try{
					var msg = (new Function( "with(this) {" + validator + "}")).call($(input)[0]);
				} catch(err){
					var msg = null;
					console.error(err);
				}
				if(msg) result = false;
				items.push({isValid:msg ? false : true, input:$(input),msg:msg});
			});
			if($.mono.setup.formValidatorConfig.callback) {
				$.mono.setup.formValidatorConfig.callback({result:result,items:items});
			}			
			if(config.callback) {
				config.callback({result:result,items:items});
			}
		});
		return this;    
	}
})( jQuery );