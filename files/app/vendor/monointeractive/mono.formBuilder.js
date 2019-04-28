(function($){
	if(typeof $.fn.mono !='object' && typeof $.fn.mono !='function'){		
		$.mono = {};
		$.fn.mono = function(method) {
			if ($.mono[method]) return $.mono[ method ].apply( this, Array.prototype.slice.call( arguments, 1 )); else $.error( 'Plugin mono.' +  method + ' does not exist.' );
		};
	}
	var multiline=function(r){var n=r.toString().match(/\/\*(\*(?!\/)|[^*])*\*\//gim);return n=(n=n||[]).join("\n").split("/*").join("").split("*/").join("").replace(/^\s\s*/,"").replace(/\s\s*$/,"")},evalMultiline=function(r,n){return evalTags(multiline(r),n)},evalTags=function(val,bind){try{if("object"==typeof bind)for(var i in bind){var bindVal=function(r){return bind[r]};eval("var "+i+'=bindVal("'+i+'")')}}catch(r){console.error("multilineParseBind",r)}var str=String(val);return str=String(str).replace(/{{([\s\S]*?)}}/gm,function(str,p1,p2){var result=null;try{result=eval(p1)}catch(r){console.error("multilineParse",r)}return result||""}),str};
	var unique = function(){
		return String(Date.now() + Math.random()).replace('.','');	
	}	
	var templates = {
		text: multiline(function(){/*
			<div class="form-group">
				<label for=""></label>
				<input data-type="auto" type="text" class="form-control" id="" placeholder="">
				<span class="form-control-feedback">
					<span class="fa fa-pencil"></span>
				</span>
			</div>			
		*/}),
		color: multiline(function(){/*
			<div class="form-group">
				<label for=""></label>
				<input data-type="auto" type="text" class="form-control" id="">
			</div>			
		*/}),		
		select: multiline(function(){/*
			<div class="form-group">
				<label for=""></label>
				<select data-type="auto" class="form-control"></select>
			</div>			
		*/}),
		checkbox: multiline(function(){/*
			<div class="form-group">
				<div class="checkbox">
					<label for=""></label>
					<input data-type="auto" class="form-control" type="checkbox">&nbsp;
				</div>
			</div>			
		*/})		
	};
	
	$.mono.formBuilder = function(config) {
		config = $.extend({},config || {});
		config.action = config.action || 'create';		
		if(config.action == 'create'){
			config.type = config.type || 'text';
			config.value = typeof config.value == 'undefined' ? '' : config.value;
			var tmplName = config.type;
			return $(templates[tmplName]).each(function(idx,el){
				config.name = config.name || config.type + unique();
				config.label = config.label || config.name;
				config.id = config.id || config.name;
				config.placeholder = config.placeholder || config.label;
				var input = $('[data-type]',el).first();
				$(input).attr('data-type',config.type)
				$('label',el).attr('for',config.name).append(config.label);
				$(input).attr('name',config.name);
				$(input).attr('id',config.id);
				$(input).filter('[placeholder]').attr('placeholder',config.placeholder);
				
				if(config.type == 'select'){
					config.values = config.values || [];
					config.values.forEach(function(item){
						item.name = item.name || item.value;
						$('<option>').attr('value',item.value).prop('selected',String(item.value) == String(config.value)).text(item.name).appendTo(input);
					});
					$(input).selectpicker({container: 'body'});
				}
				if(config.type == 'checkbox'){
					if(config.value && String(config.value) !='') $(input).attr('checked',true);
					$(input).mono('awesomeCheckbox');					
				}
				if(config.type == 'color'){
					var colorPickerPalette = [];	
					config.allowedColors.colors.forEach(function(item){colorPickerPalette.push('#'+item.value)});
					$(input).val(config.value).spectrum({
						showPalette:true,
						showAlpha: true,
						hideAfterPaletteSelect:true,
						clickoutFiresChange: true,
						chooseText: "Wybierz",
						cancelText: "Anuluj",
						togglePaletteMoreText: 'Więcej',
						togglePaletteLessText: 'Mniej',
						preferredFormat: "rgb",
						allowEmpty:true,
						palette: colorPickerPalette
					});		
				}				
				$(input).val(config.value);
			});
		}
	}; 

}(jQuery));
/*
$(document).ready(function(){
	var fb = $.mono.formBuilder;
	$('<div>').each(function(idx,message){
		fb({type:'text',label:'Motyw kolorystyczny',value:'Ala ma kota'}).appendTo(message);
		fb({type:'checkbox',label:'Opcja do zaznaczenia',value:true}).appendTo(message);
		fb({type:'checkbox',label:'Opcja do zaznaczenia',value:true}).appendTo(message);
		fb({type:'checkbox',label:'Opcja do zaznaczenia',value:true}).appendTo(message);
		fb({type:'select',label:'Motyw kolorystyczny',value:2,values:[
			{name:'Test 1',value:1},
			{name:'Test 2',value:2}
		]}).appendTo(message);
		
		$('.form-control-feedback',message).parents('.form-group').first().addClass('has-feedback');
		$.mono.box({title:'test',message:message});
	});
});
*/