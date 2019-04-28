jQuery.fn.sortDivs = function sortDivs(type,attr) {
	attr = attr || sort;
	var desc_sort = function (a, b){ return ($(b).data(attr)) > ($(a).data(attr)) ? 1 : -1; }
	var asc_sort = function (a, b){ return ($(b).data(attr)) < ($(a).data(attr)) ? 1 : -1; 	}
	var sortFunc = asc_sort;
	if (type == 'desc') sortFunc = desc_sort;	
    $(">", this[0]).sort(sortFunc).appendTo(this[0]);    
}