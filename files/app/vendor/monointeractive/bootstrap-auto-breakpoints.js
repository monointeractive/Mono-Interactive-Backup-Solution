$(function(){
	var bsVer = false;
	try{
		bsVer = parseInt(String($.fn.modal.Constructor.VERSION).split('.')[0],10);
		bsVer = bsVer ? bsVer : 0;
	} catch(err) {};
	if(!bsVer) bsVer = 3;
	$('body').each(function(idx,body){
		var bsConfig = {
			3:{
				breakPoints : [
					{'name':'sm', 'cls':'visible-sm visible-md visible-lg'},
					{'name':'md', 'cls':'visible-md visible-lg'},
					{'name':'lg', 'cls':'visible-lg'},
				]
			},
			4:{
				breakPoints : [
					{'name':'sm', 'cls':'d-none d-sm-block'},
					{'name':'md', 'cls':'d-none d-md-block'},
					{'name':'lg', 'cls':'d-none d-lg-block'},
					{'name':'xl', 'cls':'d-none d-xl-block'}
				]
			}
		}
		bsConfig = bsConfig[bsVer] || false;
		if(!bsConfig) {
			console.warn('Auto Break-Points: Bootstrap version "'+bsVer+'" is not supported');
			return;
		}
		$('<div id="check-brekpoints">').each(function(idx,div){
			bsConfig.breakPoints.forEach(function(bp){
				$('<div>').addClass(bp.cls).attr('id','breakpoint-'+bp.name).appendTo(div);					
			});			
		}).appendTo('body');
		var onResizeTimeout = false;
		var delay = 0;
		var onResize = function(){
			delay = 30;
			bsConfig.breakPoints.forEach(function(bp){
				$('body').attr('data-is-'+bp.name,$('body > #check-brekpoints > #breakpoint-'+bp.name).is(':visible'));
			});
		}
		
		$(window).resize(function(){
			clearTimeout(onResizeTimeout);
			onResizeTimeout = setTimeout(function(){onResize();},delay);
		}).trigger('resize');
	});    
});