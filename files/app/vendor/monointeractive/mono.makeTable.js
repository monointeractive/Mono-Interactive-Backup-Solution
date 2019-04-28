(function($){
	if(typeof $.fn.mono !='object' && typeof $.fn.mono !='function'){		
		$.mono = {};
		$.fn.mono = function(method) {
			if ($.mono[method]) return $.mono[ method ].apply( this, Array.prototype.slice.call( arguments, 1 )); else $.error( 'Plugin mono.' +  method + ' does not exist.' );
		};
	}
	$.mono.makeTable = function(config){
		config = config ? $.extend([],config) : {};
		config.rows = config.rows || [];
		var columns = [];
		var table = $('<table>').each(function(idx,table){
			$('<thead>').each(function(idx,head){
				$('<tr>').each(function(idx,tr){
					config.rows.slice(0,1).forEach(function(row){
						columns = Object.getOwnPropertyNames(row);
						columns.forEach(function(columnName){
							var el = $('<th>').append(columnName).attr('data-name',columnName).appendTo(tr);
							if(typeof config.onInsertCell == 'function') config.onInsertCell({isHeader:true,name:columnName,el:el,row:row});
						});
					});
				}).appendTo(head);
			}).appendTo(table);
			$('<tbody>').each(function(idx,tbody){
				config.rows.forEach(function(row,index){
					$('<tr>').each(function(idx,tr){
						columns.forEach(function(columnName){
							var value = row[columnName] || '';
							var el = $('<td>').append(value).attr('data-name',columnName).appendTo(tr);
							row.idx = index;
							if(typeof config.onInsertCell == 'function') config.onInsertCell({isHeader:false,name:columnName,el:el,row:row,value:value});
						});
					}).appendTo(tbody);
				});
			}).appendTo(table);
		});
		
        return table;
    }; 
}( jQuery ));