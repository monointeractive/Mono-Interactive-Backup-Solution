(function($){
	if(typeof $.fn.mono !='object' && typeof $.fn.mono !='function'){		
		$.mono = {};
		$.fn.mono = function(method) {
			if ($.mono[method]) return $.mono[ method ].apply( this, Array.prototype.slice.call( arguments, 1 )); else $.error( 'Plugin mono.' +  method + ' does not exist.' );
		};
	}
	$.mono.responsiveTable = function(config){
		config = config ? $.extend([],config) : {};
		if(typeof config.expandRemoveEmptyColumn == 'undefined') config.expandRemoveEmptyColumn = true;
		if(!$('body > #responsiveTableStyles').length){			
		$('<style>').each(function(idx,style){
				$(style).append('table[data-responsive-table] td[data-show-expand=icon]{text-align:center;}');
				$(style).append('table[data-responsive-table] td[data-show-expand=icon] > *{cursor:pointer;}');
			}).appendTo($('<div id="responsiveTableStyles">').appendTo('body'));			
		};
		var selectColumn = function(table,colIdx){
			return $('td:nth-child('+(colIdx+1)+'),th:nth-child('+(colIdx+1)+')',table);
		}
		var insertExpandButtons = function(table,atIdx,expandButton){
			var cellsLength  = $('tr',table).first().find('td,th').length;
			var method = 'before';
			if(atIdx > cellsLength) {
				atIdx = cellsLength;
				method = 'after';				
			}
			$('tr',table).each(function(idx,tr){
				var isHeaderCell = ($(tr).parents('thead').length || $(this).find('th').length);
				var currentCell = $('td,th',tr).eq((atIdx -1)).first();
				var type = $(currentCell).prop('nodeName').toLowerCase();
				$('<'+type+'>').each(function(cellIdx,cell){					
					$(cell).attr('data-show-expand', isHeaderCell ? 'header' : 'icon');
					$(cell).append(isHeaderCell ? '&nbsp;' : expandButton);			
					currentCell[method](cell);
				});					
			});				
		}
		
        this.filter('table').each(function(idx,table){
			if($(table).attr('data-responsive-table')) return;
			var tableId = 'table'+(String(Math.random())).replace('.','');
			var columnToHide = [];
			$('<div id="'+tableId+'">').appendTo('body > div#responsiveTableStyles');
			$(table).attr('data-responsive-table',tableId);
			var hideOrderColumns = $(table).find('td,th').filter('[data-hide-order]');
			hideOrderColumns.sort(function(a,b){
				var orderA = parseInt($(a).attr('data-hide-order'),10) || 0 ;
				var orderB = parseInt($(b).attr('data-hide-order'),10) || 0;
				if (orderA < orderB) return - 1;
				if (orderA > orderB) return 1;
				return 0;
			});
			
			if(config.expandColumnIndex == 'first') config.expandColumnIndex = 1;
			if(config.expandColumnIndex == 'last') config.expandColumnIndex = $('tr',table).first().find('td,th').length +1;
			if(typeof config.expandColumnIndex == 'number' || config.expandButton){
				config.expandColumnIndex = config.expandColumnIndex || 1;
				config.expandButton = config.expandButton || '<span class="fa fa-bars"></span>';
				insertExpandButtons(table,config.expandColumnIndex,config.expandButton);
			}
			
			$('td[data-show-expand=icon] > *',table).click(function(e){
				e.stopPropagation();
				e.preventDefault();
				var tr = $(this).parents('tr').first();
				var trHead = $(this).parents('table').find('thead tr').first();
				var data = [];
				$('td',tr).filter(function(){
					return columnToHide.indexOf($(this).index()) > -1
				}).not('[data-show-expand]').each(function(idx,td){
					var header = null;
					$('td:nth-child('+($(td).index()+1)+'),th:nth-child('+($(td).index()+1)+')',trHead).each(function(idx,td){
						header = $(td).clone(true,true);
					});
					data.push({header:$(header).clone(true,true),content:$(td).clone(true,true).contents()});
				});
				if(data.length && config.onExpand) {
					 $('<table>').each(function(idx,table){
						$('<tbody>').each(function(idx,tbody){
							 data.forEach(function(item){
								 $('<tr>').each(function(idx,tr){
										$('<th>').append(item.header).appendTo(tr);
										$('<td>').append(item.content).appendTo(tr);
								 }).appendTo(tbody);
							 });
						 }).appendTo(table);
						 
						 $('td,th',table).removeAttr('data-hide-order');
						 if(config.expandRemoveEmptyColumn){							 
							if(!$.trim($('th',table).text()).length) $('th',table).remove();
							if(!$.trim($('td',table).text()).length) $('td',table).remove();
						 }
						 config.onExpand(table);
					 });
				}
			});
			
			var resizeTimeout = 0;
			var whileResize = false;
			var checkTableWidth = function(){
				whileResize = true;
				clearTimeout(resizeTimeout);
				$('body > div#responsiveTableStyles > div#'+tableId).empty();
				var orgStyle = $(table).attr('style') || '';
				var tableHeight = $(table)[0].offsetHeight;
				$(table).hide();
				var parentWidth = 0
				$('<div style="height:'+tableHeight+'px">').appendTo($(table).parent()).each(function(){parentWidth = $(this).width();$(this).remove()});
				$(table).attr('style',orgStyle);
				var tableWidth = $(table)[0].offsetWidth;
				var currentTableWidth = tableWidth;				
				var styles = '';
				columnToHide = [];
				if(tableWidth > parentWidth){
					$(hideOrderColumns).each(function(idx,td){
						var colIdx = $(td).index();
						if(currentTableWidth > parentWidth){
							currentTableWidth -= $(td)[0].offsetWidth;
							styles +='table[data-responsive-table="'+tableId+'"] td:nth-child('+(colIdx +1)+'),table[data-responsive-table="'+tableId+'"] th:nth-child('+(colIdx +1)+') {display:none;}\n';
							columnToHide.push(colIdx);
						}
					});										
				}
				if(!columnToHide.length) styles +='table[data-responsive-table="'+tableId+'"] td[data-show-expand],table[data-responsive-table="'+tableId+'"] th[data-show-expand]{display:none;}\n';
				$('body > div#responsiveTableStyles > div#'+tableId).each(function(idx,stylesDiv){
					$(stylesDiv).append('<style>'+styles+'</style>');
				});					
				whileResize = false;
			}
			$(window).resize(function(){
				clearTimeout(resizeTimeout);
				if(!whileResize) checkTableWidth(); else {
					resizeTimeout = setTimeout(function(){checkTableWidth()},300);		
				}
			});
			if(!$('tbody > tr',table).length && typeof config.onEmpty == 'function') config.onEmpty(table);
			checkTableWidth();
        });
        return this;
    }; 
}( jQuery ));