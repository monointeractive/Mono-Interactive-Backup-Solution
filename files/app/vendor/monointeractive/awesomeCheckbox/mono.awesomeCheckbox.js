(function( $ ){
	if(typeof $.fn.mono !='object' && typeof $.fn.mono !='function'){		
		$.mono = {};
		$.fn.mono = function(method) {
			if ($.mono[method]) return $.mono[ method ].apply( this, Array.prototype.slice.call( arguments, 1 )); else $.error( 'Plugin mono.' +  method + ' does not exist.' );
		};
	}
	
	$.mono.awesomeCheckbox = function(){
		this.filter('input[type=checkbox],input[type=radio]').not('.mono-ac-input').each(function(idx,input){
			$(input).addClass('mono-ac-input');
			var label = false;
			if($(this).parents('label').length) label = $(this).parents('label');
			if(!label && $(this).next().is('label')) label = $(this).next();
			if(!label && $(this).prev().is('label')) label = $(this).prev();
			if($(input).parents('label')) $(input).insertBefore($(input).parents('label'));
			$('<div class="mono-ac-checkbox">').each(function(idx,checkbox){
				$(checkbox).attr('data-type',$(input).attr('type'));
				$(checkbox).on('click',function(e){
					$('label',checkbox).trigger('click');
					e.preventDefault();
					e.stopPropagation();
				});
				$('<div class="mono-ac-wrapper">').each(function(idx,wrapper){
						$('<div class="mono-ac-row">').each(function(idx,row){							
							$('<div class="mono-ac-col-icon">').each(function(idx,col){								
								$('<div class="mono-ac-col-symbol">').appendTo(col);
							}).appendTo(row);
							if($(label).length){
								$('<div class="mono-ac-col-label">').each(function(idx,col){								
									$(this).html($(label).clone().each(function(){$(this).find('input').remove();}).html());
									$(label).remove();
								}).appendTo(row);
							}
						}).appendTo(wrapper);
				}).appendTo(checkbox);
				
			}).insertBefore(input).each(function(idx,checkbox){
				$('<label>').each(function(){$(this).append($(input))}).on('click',function(e){
					e.stopPropagation();
				}).appendTo($('.mono-ac-col-icon',checkbox));
				var setState = function(input){
					var checkbox = $(input).parents('.mono-ac-checkbox').first();
					$(checkbox).attr('data-checked',$(input).is(':checked'));
					$(checkbox).attr('data-disabled',$(input).attr('disabled'));	
				}
				$(input).on('change',function(e,notRecursive){
					setState(input);
					$('input[type=radio][name="'+String($(input).attr('name'))+'"]').not(this).each(function(idx,input){
						setState(input);
					});
				});
				setState(input);
				//$(input).trigger('change');
			});
			
			
			//checked 
		});
		return this;
	}
})( jQuery );