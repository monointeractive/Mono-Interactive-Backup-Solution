jQuery.fn.reverse = [].reverse;

function nestStringProperties(obj) {
    if (!obj) {
        return {};
    }
    
    const isPlainObject = obj => !!obj && obj.constructor === {}.constructor;
    
    const getNestedObject = obj => Object.entries(obj).reduce((result, [prop, val]) => {
        prop.split('.').reduce((nestedResult, prop, propIndex, propArray) => {
            const lastProp = propIndex === propArray.length - 1;
            if (lastProp) {
                nestedResult[prop] = isPlainObject(val) ? getNestedObject(val) : val;
            } else {
                nestedResult[prop] = nestedResult[prop] || {};
            }
            return nestedResult[prop];
        }, result);
        return result;
    }, {});
    
    return getNestedObject(obj);
}


openFileDialog = function(config){
	if(!(typeof nodeEnv != 'undefined' && nodeEnv)) {
		alert('Node required');
		return;
	}
	config = config || {};
	
	$('<input style="display:none;" type="file" />').each(function(idx,input){
		$(this).val('');
		if(config.dir) $(input).attr('nwworkingdir',config.dir);
		if(config.isDir) {
			$(input).attr('nwdirectory',true);
			config.multiple = false;
			config.accept = false;
		}
		if(config.accept) $(input).attr('accept',config.accept);
		if(config.multiple) $(input).attr('multiple',true);
		$(input).click();
		$(this).change(function(evt) {
				var files = [].slice.call($(this)[0].files);
				if(files.length) {
					files.forEach(function(file,idx){
						try{							
							files[idx].isDirectory = fs.lstatSync(file.path).isDirectory();
						} catch(err){}
					});					
					config.callback(files);				
				}
			  $(this).val('');
		});		
	});
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

animateBootstrapProgressBar = function(bars){
	var delay = 300;
	$(bars).each(function(i,bar){
		$(this).delay( delay*i ).animate( { width: $(this).attr('aria-valuenow') + '%' }, delay );

		$(this).prop('Counter',0).animate({
			Counter: $(bar).attr('aria-valuenow')
		}, {
			duration: delay,
			easing: 'swing',
			step: function (now,obj) {
				$(bar).attr('aria-valuenow',Math.ceil(now));
			}
		});
	});		
}

ajaxProxy = function(config){
	$('body').attr('data-loading',true);
	if(typeof showIndicator != 'undefined') showIndicator(true);	
	var df = $.Deferred();
	config = $.extend({},config,{
		cache:false
	});
	var ajax = $.ajax(config);
	ajax.always(function(data){
		$('body').attr('data-loading',false);
		if(typeof showIndicator != 'undefined') showIndicator(false);
	}).done(function(data){
		df.resolve(data);
	}).fail(function(data){
		showNotify({type:'error',title:'Wystąpił problem podczas przetwarzania żądania.',message:'Odśwież stronę i spróbuj ponownie. Jeżeli problem będzie się powtarzał skontaktuj się z pomocą techniczną.'});		
		df.reject();
	});
	return df.promise();
}

var showIndicatorTimeout = false;
showIndicator = function(toShow,delay){	
	if(typeof delay == 'undefined') delay = 100;
	clearTimeout(showIndicatorTimeout);
	showIndicatorTimeout = setTimeout(function(){
		clearTimeout(showIndicatorTimeout);
		var method = 'fadeOut';
		if(toShow){
			method = 'fadeIn'
			if(!delay) method = 'show';
		}
			$('body > #indicator')[method](); 
	},delay);
}

$.fn.breakLongWords = function(config) {	
	config.maxLength = config.maxLength || 10;
	var arrayIniques = function(arr) {
		var a = [];
		for (var i=0, l=arr.length; i<l; i++)
			if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
				a.push(arr[i]);
		return a;
	};
	return this.each(function() {
	  if(!$('.softSpace',this).length)
		$(this).add('*',this).contents().filter(function() { return this.nodeType === 3;}).each(function(idx,el){
			var str = $(el).text();
			var processed = false;
			if(str.length > config.maxLength){
				var regex = /[^\w\s]/g;
				var matches = str.match(regex);
				if(matches){
					matches = arrayIniques(matches);
					matches.forEach(function(match){
						processed = true;
						str = str.split(match).join('<span class="softSpace">'+match+'</span>');					
					});			
				}
				$(el).replaceWith(str);
			}
			if(!$.softSpaceStyleExists && processed){
				$.softSpaceStyleExists = true;
				$('head').append('<style>.softSpace:before{content:"a";}</style>');
			}
		});
	});
}

$.fn.defaultDatePicker = function(config) {
	return this.each(function() {
		config = config || {};
		$(this).datepicker($.extend({
			format: "yyyy-mm-dd",
			language: "pl",
			keyboardNavigation: false,
			forceParse: true,
			daysOfWeekHighlighted: "1,2,3,4,5",
			autoclose:true
		},config)).on('hide', function(e) {
			e.stopPropagation();
		}).on('blur',function(){
			var _this = this;
			setTimeout(function(){
				$(_this).datepicker('hide');				
			},150);
		});
	});
};
$.fn.defaultTimePicker = function(config) {
	return this.each(function() {
		config = config || {};
		$(this).clockTimePicker($.extend({
				precision: 1,
				i18n: {
					cancelButton: 'Abbrechen'
				},
				onAdjust: function(newVal, oldVal) {
					
				}},config)).on('hide', function(e) {
			e.stopPropagation();
		});
	});
};



$.fn.humanDate = function(config) {
	return this.each(function(idx,el) {
		if($(el).is('[title]')){
			$(el).text($(el).attr('title'));
		}
		var date = $(el).text();
		var dateStr = date;
		var currentDate = new Date();
		if(date.isValidDateTime() || date.isValidDate()) dateStr = moment(date, "YYYY-MM-DD HH:mm:ss").fromNow();		
		$(el).text(dateStr);
		$(el).attr('title',date);
	});
}

$(window).on('beforeunload', function() {
	showIndicator(true,0);
}); 

showNotify = function(config){
		config.type = (typeof config.type=='string') ? config.type : 'info';
		if(typeof $.notify != 'function'){
			console.info(config.title,config.message);
			return;
		}
		$.notify({
			icon: 'fa fa-info-circle',
			title: config.title,
			message: config.message,
		},{
		element: 'body',
		delay: 5000,
		z_index: 1052,
		type: config.type,
		allow_dismiss: true,
		placement: {
			from: "top",
			align: "right"
		},
		animate: {
			enter: 'animated fadeInUp',
			exit: 'animated fadeOutDown'
		},
		icon_type: 'class',
		template: '<div data-notify="container" class="alert alert-{0}" role="alert">' +
					'<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
					(config.title ? ('<h4> ' +'<span data-notify="icon"></span>&nbsp;&nbsp;' + '<span data-notify="title">{1}</span>' +'</h4>') : '')+
					(config.message ? ('<span data-notify="message">{2}</span>') : '') +
				'</div>' 		
	});
}
autoColumn = function(selector){
	$(selector).each(function(idx, row){
		var cols = $('>[class*=col-]',row);
		if($(cols).filter('[class*=-auto]').length){
			var colClass = Math.round(12 / $(cols).length);
			if(colClass){
				$(cols).each(function(idx,col){
					$(col).attr('class',$(col).attr('class').split('-auto').join('-'+colClass));
				});
			}
		}
	});
}

	String.prototype.toPlainText = function(val){
		return $.trim($('<div>').append(this).text());
	}	
	
	
var generatePassword = function(config){
	var components = {};
	components.lower = 'abcdefghijklmnopqrstuvwxyz';
	components.upper = components.lower.toUpperCase();
	components.number = '0123456789';
	components.special = "$+,:;=?@#|'.^*()!-";
	config = config || {};
	config.lower = config.lower || 2;
	config.upper = config.upper || 2;
	config.number = config.number || 2;
	config.special = config.special || 2;
	var result = [];
	for(var idx in components){
		var component = components[idx];
		var length = config[idx];
		for(var i = 0; i < length; i++) {
			result.push(component[randRange(0,component.length-1)]);
		}		
	}		
	var shuffle = function(array) {
	  var currentIndex = array.length, temporaryValue, randomIndex;
	  while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	  }
	  return array;
	}				
	result = shuffle(result);
	return result.join('');
}

// validators

String.prototype.isValidWindowsDirname = function(config) {
	config = config || {};
	var dirname = String(this).split('/').join('\\');
	if((config.allowDrive && dirname.length < 3) || (!config.allowDrive && dirname.length < 4)) return false;
	if(dirname[0].search(/[A-Za-z]+/) == -1) return false;
	if(dirname[1] != ':') return false;
	if(dirname[2] != '\\') return false;
	if(typeof nodeEnv !='undefined' && nodeEnv){
		try{
			if(!(fs.existsSync(dirname) && !fs.lstatSync(dirname).isFile())) return false;
		} catch(err){
			console.error(err);
			return false;
		}
	}
	return true;
}

String.prototype.isFirstUpper = function() {
	var reslut = true;
	if(this[0] != this[0].toUpperCase()) reslut = false;
	if(!this.match(/[a-z]/)) reslut = false;
	return reslut;
}

String.prototype.isValidDate = function() {
  return moment(this, 'YYYY-MM-DD', true).isValid();
}
String.prototype.isValidTime = function() {
	if(this.length ==5 ) return moment(this, 'HH:mm', true).isValid(); else
						  return moment(this, 'HH:mm:ss', true).isValid();
}

String.prototype.isValidDateTime = function() {
	if(this.length ==16 ) return moment(this, 'YYYY-MM-DD HH:mm', true).isValid(); else
						  return moment(this, 'YYYY-MM-DD HH:mm:ss', true).isValid();
}

	String.prototype.isAlphanumeric = function(){
		var re = /^[a-z0-9-_\.]+$/i;
		return re.test(this);
	}
	
	String.prototype.isEmail = function(){
		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		return re.test(this);
	}
	
	String.prototype.isLength = function(min,max){
		if(!min) min = 1;
		if(!max) max = 255;
		return (this.length >=min && this.length <=max);
	}
	
	String.prototype.isValidPassword = function() {
		if (this.length < 8 || this.search(/[a-z]/i) < 0 || this.search(/[0-9]/) < 0 || this.search(/[$&+,:;=?@#|'<>.^*()%!-]/) < 0 || this.search(/ /i) > 0) return false;		
		return true;
	}

	String.prototype.isEmpty = function() {
		if($.trim(String(this)).length) return false;
		return true;
	}	

// end validatos
if(typeof String('').trunc == 'undefined'){
	String.prototype.trunc = function( n, useWordBoundary ){
         if (this.length <= n) { return this; }
         var subString = this.substr(0, n-1);
         return (useWordBoundary 
            ? subString.substr(0, subString.lastIndexOf(' ')) 
            : subString) + "&hellip;";
      };
}

randRange = function(minimum, maximum){
	return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function fireEvent(event){
    if (document.createEventObject){
        // dispatch for IE
        var evt = document.createEventObject();
        return this.fireEvent('on'+event,evt)
    } else {
        // dispatch for firefox + others
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true ); // event type,bubbling,cancelable
        return !this.dispatchEvent(evt);
    }
}

function clearSelection() {
    if ( document.selection ) {
        document.selection.empty();
    } else if ( window.getSelection ) {
        window.getSelection().removeAllRanges();
    }
}

function unique(){
	return String(Date.now() + Math.random()).replace('.','');	
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function qualifyURL(url) {
	url = String(url).split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
    var el = document.createElement('div');
    el.innerHTML= '<a href="'+url+'">x</a>';
    return el.firstChild.href;
}


function _parseInt (val){
	val = parseInt(val,10);
	val = val ? val : 0;
	return val;
}
 function _parseFloat(val) {
  	val = parseFloat(val);
	val = val ? val : 0;
  	return val;	  
}

computePercentFromNumbers = function(currentNumber,totalNumber){
  return _parseInt((_parseInt(currentNumber) / _parseInt(totalNumber)) * 100);
}
computeNumberFromPercent=function(number,percent) {
  	  	return _parseFloat((_parseFloat(number) / 100) * _parseFloat(percent));
}  

function numberFormatWithZero(num, size) {
    var s = _parseInt(num)+"";
    while (s.length < size) s = "0" + s;
    return s;
}

String.prototype.contains = function(str) {
    return (this.toLowerCase().indexOf(str.toLowerCase()) > -1);
};


function toRoman(num) {  
  var result = '';
  var decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  var roman = ["M", "CM","D","CD","C", "XC", "L", "XL", "X","IX","V","IV","I"];
  for (var i = 0;i<=decimal.length;i++) {
    while (num%decimal[i] < num) {     
      result += roman[i];
      num -= decimal[i];
    }
  }
  return result;
}

function datenum(v, date1904) {
	if(date1904) v+=1462;
	var epoch = Date.parse(v);
	return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}
 
function sheet_from_array_of_arrays(data, opts) {
	var ws = {};
	var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
	for(var R = 0; R != data.length; ++R) {
		for(var C = 0; C != data[R].length; ++C) {
			if(range.s.r > R) range.s.r = R;
			if(range.s.c > C) range.s.c = C;
			if(range.e.r < R) range.e.r = R;
			if(range.e.c < C) range.e.c = C;
			var cell = {v: data[R][C] };
			if(cell.v == null) continue;
			var cell_ref = XLSX.utils.encode_cell({c:C,r:R});
			
			if(typeof cell.v === 'number') cell.t = 'n';
			else if(typeof cell.v === 'boolean') cell.t = 'b';
			else if(cell.v instanceof Date) {
				cell.t = 'n'; cell.z = XLSX.SSF._table[14];
				cell.v = datenum(cell.v);
			}
			else cell.t = 's';
			
			ws[cell_ref] = cell;
		}
	}
	if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
	return ws;
}
 
  
function Workbook() {
	if(!(this instanceof Workbook)) return new Workbook();
	this.SheetNames = [];
	this.Sheets = {};
}
function s2ab(s) {
	var buf = new ArrayBuffer(s.length);
	var view = new Uint8Array(buf);
	for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
	return buf;
}

function camelize(str)
{
	str = str.split(' ');
	for (var i = 0, len = str.length; i < len; i++) {
		str[i] = toTitleCase(str[i]);
	}
	str = str.join('');
	str = clearLink(str);
	str = str.replace(/-{1,}/g, '');
	return str;
}

String.prototype.fixOrphan = function(){
	var str = String(this).split('  ').join(' ');
		str = str.split(' ');
		for (var i = 0; i < str.length; i++) {
			if(str[i].length < 4 && str.length > 1 && i < str.length - 1){
				if(['a','z','w','u','i','o','że','ze','za','wy','to','ta','tę','tą','do','od','na','co','ci','mi','me','po','są','bo','ma', 'np.','jak'].indexOf(str[i].toLowerCase()) > -1){
					str[i] +='&nbsp;';
				}
			}
		}
		str = str.join(' ');	
		
		//str = str.split('(').join('(&zwj;');
		//str = str.split(')').join('&zwj;)');
		str = str.split('&nbsp; ').join('&nbsp;');
	return str;
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function sleepFor( sleepDuration ){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */ } 
}

String.prototype.replaceAll = function(strReplace, strWith) {
    var reg = new RegExp(strReplace, 'ig');
    return this.replace(reg, strWith);
};


String.prototype.trimLeft = function(charlist) {
  if (charlist === undefined)
    charlist = "\s";

  return this.replace(new RegExp("^[" + charlist + "]+"), "");
};

String.prototype.trim = function(charlist) {
  return this.trimLeft(charlist).trimRight(charlist);
};

String.prototype.trimRight = function(charlist) {
  if (charlist === undefined)
    charlist = "\s";

  return this.replace(new RegExp("[" + charlist + "]+$"), "");
};


getUrlAttr = function(url){
	var link = document.createElement('a');
		link.setAttribute('href', url);
		link.hostname;  //  'example.com'
		link.port;      //  12345
		link.search;    //  '?startIndex=1&pageSize=10'
		link.pathname;  //  '/blog/foo/bar'
		link.protocol;  //  'http:'
	return {
		hostname: link.hostname,  //  'example.com'
		port: link.port,      //  12345
		search: link.search,    //  '?startIndex=1&pageSize=10'
		pathname: link.pathname,  //  '/blog/foo/bar'
		protocol: link.protocol  //  'http:'
	}
}


function recalculateSize(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {width: srcWidth * ratio, height: srcHeight * ratio};
}

String.prototype._replace = function(strReplace, strWith) {
    return this.split(strReplace).join(strWith);		
};

String.prototype.escapeDiacritics = function(){
    return this.replace(/ą/g, 'a').replace(/Ą/g, 'A')
        .replace(/ć/g, 'c').replace(/Ć/g, 'C')
        .replace(/ę/g, 'e').replace(/Ę/g, 'E')
        .replace(/ł/g, 'l').replace(/Ł/g, 'L')
        .replace(/ń/g, 'n').replace(/Ń/g, 'N')
        .replace(/ó/g, 'o').replace(/Ó/g, 'O')
        .replace(/ś/g, 's').replace(/Ś/g, 'S')
        .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
        .replace(/ź/g, 'z').replace(/Ź/g, 'Z');
}

clearLink = function(val){
	val = String(val);
	val = val.escapeDiacritics();
	val = String(val).replace(/\s{1,}/g, '-');	
	val = String(val).replace(/\W+/g, "-");
	val = String(val).replace(/-{1,}/g, '-');	
	val = val.trim('-');
	return val;
}

function getParameterByName(_url,name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(_url);
	var result = results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	if (typeof result =='string') {
		result = $.trim(result);
		if(result == '') result = undefined;
	}
    return result;
}

function getISODate() {
  var now = new Date();
  var year = "" + now.getFullYear();
  var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
  var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
  var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
  var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
  var second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
  return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}