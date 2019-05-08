(function($){
	if(typeof $.fn.mono !='object' && typeof $.fn.mono !='function'){		
		$.mono = {};
		$.fn.mono = function(method) {
			if ($.mono[method]) return $.mono[ method ].apply( this, Array.prototype.slice.call( arguments, 1 )); else $.error( 'Plugin mono.' +  method + ' does not exist.' );
		};
	}
	if(typeof $.mono.setup != 'object') $.mono.setup = new (function(){this.scope = this;})();
	$.mono.setup.box = function(config){
		this.scope.boxConfig = config;
	};
	var language = String((window.navigator.userLanguage || window.navigator.language)).split('_')[0].split('-')[0].toLowerCase();
	var monoboxTemplate = ['<div class="monobox">',
							'	<div class="monobox-container">',
							'		<div class="monobox-hbox">',
							'			<div class="monobox-vbox">',
							'				<div class="monobox-dialog">',
							'					<div class="monobox-content">',
							'							<div class="monobox-header">',
							'								<div class="monobox-title"></div>',
							'								<div class="monobox-close"><a href="#">×</a></div>',
							'							</div>',
							'							<div class="monobox-body"></div>',
							'							<div class="monobox-footer">',
							'								<div class="monobox-description"></div>',
							'								<div class="monobox-buttons"></div>',
							'							</div>',
							'					</div>',
							'				</div>',
							'			</div>',
							'		</div>',
							'	</div>',
							'</div>'].join('');

 $.mono.box = function(config) {
		$.mono.setup.boxConfig = $.mono.setup.boxConfig || {};
		config = $.extend({},($.mono.setup.boxConfig || {}),config || {});
		config.showAnimationClass = config.showAnimationClass || 'animated fadeInDown';
		config.hideAnimationClass = config.hideAnimationClass || 'animated fadeOutUp';
		config.closeButton = (typeof config.closeButton == 'undefined') ? true : config.closeButton;
		config.autoblur = (typeof config.autoblur == 'undefined') ? true : config.autoblur;
		config.autofocus = (typeof config.autofocus == 'undefined') ? true : config.autofocus;
		config.buttons = (typeof config.buttons == 'undefined') ? [
			{
				label: (language == 'pl') ? 'Zamknij' : 'Close',
				className:'btn btn-primary',
				callback:function(){}
			}
		] : (config.buttons || [])
		var modal = $(monoboxTemplate).each(function(idx,monobox){
			if(!config.closeButton) $('.monobox-close',monobox).empty();
			$('.monobox-content',monobox).each(function(){
				if(config.fitToMaxWidth || config.width){
					$(this).append(
					$('<div class="monobox-width-helper" style="overflow: hidden;height: 1px;opacity: 0;">').each(function(){
						 if(config.width) $(this).css({'max-width':config.width});
						 $(this).append((new Array(1000).join('&npbs; ')));
					}))
				}
				if(config.maxWidth) $(this).css({'max-width':config.maxWidth+'px'});
				$(this).addClass(config.showAnimationClass);				
			});
			$('.monobox-title',monobox).append(config.title);
			$('.monobox-body',monobox).append(config.message);
			$('.monobox-description',monobox).append(config.description);
			$('.monobox-close > a',monobox).click(function(e){
				$(monobox).triggerHandler('hide');
				e.preventDefault();
			});
			
			for (var idx in config.buttons) {
				if (!config.buttons.hasOwnProperty(idx)) continue;
				$('<button>').each(function(idx2,button){
					var btn = config.buttons[idx];
					for(attr in btn){
						if(typeof attr =='string' && ['string','number','boolean'].indexOf(typeof(btn[attr])) >-1) $(button).attr('data-'+attr, btn[attr]);
					}
					btn.className = btn.className || 'btn btn-primary';
					$(button).attr('type','button');
					$(button).addClass(btn.className);
					if(btn.className.indexOf('btn-') > -1) $(button).addClass('btn');
					$(button).append(btn.label);
					$(button).on('click',function(e){						
						var result = true;
						if(typeof btn.callback == 'function') result = btn.callback.call(button,monobox);
						if(String(result) !='false') $(monobox).triggerHandler('hide');
						e.preventDefault();
						e.stopPropagation();
					});
				}).appendTo($('.monobox-buttons',monobox));
			}
			
			$(monobox).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(e) {
				e.stopPropagation();
				$(monobox).removeClass(config.bgShowAnimationClass);
			});
			$('.monobox-content',monobox).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(e) {				
				$('.monobox-content',monobox).removeClass(config.showAnimationClass);				
				e.stopPropagation();
				$(monobox).triggerHandler('shown');
			});
			$(monobox).one('hide',function(e){
				e.stopPropagation();
				$('.monobox-content',monobox).removeClass(config.showAnimationClass).addClass(config.hideAnimationClass);
				$('.monobox-content',monobox).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {					
					$('.monobox-content',monobox).hide();
					$(monobox).triggerHandler('hidden');
				});
			});
		 $('body > .monobox').removeAttr('data-ontop');
		 $(monobox).attr('data-ontop',true);
		}).appendTo('body');
		if(config.autoblur){
			try{
				if (document.activeElement != document.body && document.activeElement) document.activeElement.blur();			
			} catch(err){console.log(err);};
		}
		if(config.autofocus){
			$('input,button,textarea,select,.btn',modal).not('[disabled],[readonly],.disabled').first().focus();
			$(modal).scrollTop(0);
		}
		if(!$('head > style#monobox-scrollfix').length){
			$('<style id="monobox-scrollfix">').each(function(idx,style){
				$(style).append('body[data-monobox-open=true]{max-width:'+$('body')[0].clientWidth+'px!important;width:'+$('body')[0].clientWidth+'px!important; overflow:hidden!important;}');
			}).prependTo('head');
		};
		
		setTimeout(function(){
			$(modal).triggerHandler('load');
			$('body').attr('data-monobox-open',true);
		},1);		
		$(modal).one('hidden',function(e){
			e.stopPropagation();
			$(modal).fadeOut(100,function(){
				if(typeof config.onClose == 'function'){
					config.onClose(modal)
				}
				$('body > .monobox').not(modal).removeAttr('data-ontop').last().attr('data-ontop',true);
				if(!$('body > .monobox').not(modal).length) {
					$('body').removeAttr('data-monobox-open');
					$('head > style#monobox-scrollfix').remove();
					$(window).resize();
				}
				$(modal).triggerHandler('unload');
				$(modal).remove();
			});			
		});
		return modal;
    }; 

}(jQuery));