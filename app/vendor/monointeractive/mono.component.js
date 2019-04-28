(function($){		
	$.fn.component = function(method){
		if($(this).length > 1) {
			console.error('Multiple calls not allowed',Array.prototype.slice.call(arguments),this);
			return this;
		}
		
		if(!$(this).length) {
			console.error('Component not exists',Array.prototype.slice.call(arguments),this);
			return this;
		}
		if ($.fn.component[method]) return $.fn.component[method].apply( this, Array.prototype.slice.call( arguments, 1 )); else $.error( 'Plugin mono.' +  method + ' does not exist.' );
	};
	
	(function(){
		"use strict";(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++){o(t[i])}return o}return r})()({1:[function(require,module,exports){(function(global){"use strict";var pathObj=global.Path=function(){return require("path")}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{path:2}],2:[function(require,module,exports){(function(process){function normalizeArray(parts,allowAboveRoot){var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1)}else if(last===".."){parts.splice(i,1);up++}else if(up){parts.splice(i,1);up--}}if(allowAboveRoot){for(;up--;up){parts.unshift("..")}}return parts}exports.resolve=function(){var resolvedPath="",resolvedAbsolute=false;for(var i=arguments.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?arguments[i]:process.cwd();if(typeof path!=="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!path){continue}resolvedPath=path+"/"+resolvedPath;resolvedAbsolute=path.charAt(0)==="/"}resolvedPath=normalizeArray(filter(resolvedPath.split("/"),function(p){return!!p}),!resolvedAbsolute).join("/");return(resolvedAbsolute?"/":"")+resolvedPath||"."};exports.normalize=function(path){var isAbsolute=exports.isAbsolute(path),trailingSlash=substr(path,-1)==="/";path=normalizeArray(filter(path.split("/"),function(p){return!!p}),!isAbsolute).join("/");if(!path&&!isAbsolute){path="."}if(path&&trailingSlash){path+="/"}return(isAbsolute?"/":"")+path};exports.isAbsolute=function(path){return path.charAt(0)==="/"};exports.join=function(){var paths=Array.prototype.slice.call(arguments,0);return exports.normalize(filter(paths,function(p,index){if(typeof p!=="string"){throw new TypeError("Arguments to path.join must be strings")}return p}).join("/"))};exports.relative=function(from,to){from=exports.resolve(from).substr(1);to=exports.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=="")break}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=="")break}if(start>end)return[];return arr.slice(start,end-start+1)}var fromParts=trim(from.split("/"));var toParts=trim(to.split("/"));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push("..")}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join("/")};exports.sep="/";exports.delimiter=":";exports.dirname=function(path){if(typeof path!=="string")path=path+"";if(path.length===0)return".";var code=path.charCodeAt(0);var hasRoot=code===47;var end=-1;var matchedSlash=true;for(var i=path.length-1;i>=1;--i){code=path.charCodeAt(i);if(code===47){if(!matchedSlash){end=i;break}}else{matchedSlash=false}}if(end===-1)return hasRoot?"/":".";if(hasRoot&&end===1){return"/"}return path.slice(0,end)};function basename(path){if(typeof path!=="string")path=path+"";var start=0;var end=-1;var matchedSlash=true;var i;for(i=path.length-1;i>=0;--i){if(path.charCodeAt(i)===47){if(!matchedSlash){start=i+1;break}}else if(end===-1){matchedSlash=false;end=i+1}}if(end===-1)return"";return path.slice(start,end)}exports.basename=function(path,ext){var f=basename(path);if(ext&&f.substr(-1*ext.length)===ext){f=f.substr(0,f.length-ext.length)}return f};exports.extname=function(path){if(typeof path!=="string")path=path+"";var startDot=-1;var startPart=0;var end=-1;var matchedSlash=true;var preDotState=0;for(var i=path.length-1;i>=0;--i){var code=path.charCodeAt(i);if(code===47){if(!matchedSlash){startPart=i+1;break}continue}if(end===-1){matchedSlash=false;end=i+1}if(code===46){if(startDot===-1)startDot=i;else if(preDotState!==1)preDotState=1}else if(startDot!==-1){preDotState=-1}}if(startDot===-1||end===-1||preDotState===0||preDotState===1&&startDot===end-1&&startDot===startPart+1){return""}return path.slice(startDot,end)};function filter(xs,f){if(xs.filter)return xs.filter(f);var res=[];for(var i=0;i<xs.length;i++){if(f(xs[i],i,xs))res.push(xs[i])}return res}var substr="ab".substr(-1)==="b"?function(str,start,len){return str.substr(start,len)}:function(str,start,len){if(start<0)start=str.length+start;return str.substr(start,len)}}).call(this,require("_process"))},{_process:3}],3:[function(require,module,exports){var process=module.exports={};var cachedSetTimeout;var cachedClearTimeout;function defaultSetTimout(){throw new Error("setTimeout has not been defined")}function defaultClearTimeout(){throw new Error("clearTimeout has not been defined")}(function(){try{if(typeof setTimeout==="function"){cachedSetTimeout=setTimeout}else{cachedSetTimeout=defaultSetTimout}}catch(e){cachedSetTimeout=defaultSetTimout}try{if(typeof clearTimeout==="function"){cachedClearTimeout=clearTimeout}else{cachedClearTimeout=defaultClearTimeout}}catch(e){cachedClearTimeout=defaultClearTimeout}})();function runTimeout(fun){if(cachedSetTimeout===setTimeout){return setTimeout(fun,0)}if((cachedSetTimeout===defaultSetTimout||!cachedSetTimeout)&&setTimeout){cachedSetTimeout=setTimeout;return setTimeout(fun,0)}try{return cachedSetTimeout(fun,0)}catch(e){try{return cachedSetTimeout.call(null,fun,0)}catch(e){return cachedSetTimeout.call(this,fun,0)}}}function runClearTimeout(marker){if(cachedClearTimeout===clearTimeout){return clearTimeout(marker)}if((cachedClearTimeout===defaultClearTimeout||!cachedClearTimeout)&&clearTimeout){cachedClearTimeout=clearTimeout;return clearTimeout(marker)}try{return cachedClearTimeout(marker)}catch(e){try{return cachedClearTimeout.call(null,marker)}catch(e){return cachedClearTimeout.call(this,marker)}}}var queue=[];var draining=false;var currentQueue;var queueIndex=-1;function cleanUpNextTick(){if(!draining||!currentQueue){return}draining=false;if(currentQueue.length){queue=currentQueue.concat(queue)}else{queueIndex=-1}if(queue.length){drainQueue()}}function drainQueue(){if(draining){return}var timeout=runTimeout(cleanUpNextTick);draining=true;var len=queue.length;while(len){currentQueue=queue;queue=[];while(++queueIndex<len){if(currentQueue){currentQueue[queueIndex].run()}}queueIndex=-1;len=queue.length}currentQueue=null;draining=false;runClearTimeout(timeout)}process.nextTick=function(fun){var args=new Array(arguments.length-1);if(arguments.length>1){for(var i=1;i<arguments.length;i++){args[i-1]=arguments[i]}}queue.push(new Item(fun,args));if(queue.length===1&&!draining){runTimeout(drainQueue)}};function Item(fun,array){this.fun=fun;this.array=array}Item.prototype.run=function(){this.fun.apply(null,this.array)};process.title="browser";process.browser=true;process.env={};process.argv=[];process.version="";process.versions={};function noop(){}process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.prependListener=noop;process.prependOnceListener=noop;process.listeners=function(name){return[]};process.binding=function(name){throw new Error("process.binding is not supported")};process.cwd=function(){return"/"};process.chdir=function(dir){throw new Error("process.chdir is not supported")};process.umask=function(){return 0}},{}]},{},[1]);
	})();	
	
	Array.prototype.find||Object.defineProperty(Array.prototype,"find",{value:function(r){if(null==this)throw new TypeError('"this" is null or not defined');var e=Object(this),t=e.length>>>0;if("function"!=typeof r)throw new TypeError("predicate must be a function");for(var n=arguments[1],i=0;i<t;){var o=e[i];if(r.call(n,o,i,e))return o;i++}},configurable:!0,writable:!0});
	
	var components = new (function(){
		var scope = this;
		var collection = [];
		scope.all = function(){
			return collection;
		}
		scope.get = function(id){
			return (collection[id] || null);
		}
		scope.add = function(cmp){
			$(cmp.selector).each(function(idx,selector){
				$(selector).data('selector',$(selector));
				$(selector).attr('component-id',cmp.id);
				$(selector).attr('component-state','pending');				
				collection[cmp.id] = $(selector);
			});
		}
		scope.unbind = function(id){
			$(scope.get(id)).each(function(idx,selector){
				$(selector).removeData();
				$(selector).off();
				collection[id] = null;
				delete collection[id];
			});
		}
	})();
	
	var trim = function(str,chars){
		if(chars) chars = chars.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); else chars = '\\s';
		var regEx = new RegExp("^[" + chars + "]+|[" + chars + "]+$", "gmi");
		return String(str).replace(regEx, "");
	}
	
	var onChangeUri = function(){
		for(var id in components.all()){
			$(components.get(id)).triggerHandler('router.changeUri');
		};
	}
	var ajax = function(config){
		return $.mono.ajax(config).fail(function(xhr, status, error){console.error('Ajax error',config.url, status, error)});
	}
	
	var unique = function(){
	  var s4 = function() {
		return Math.floor((1 + Math.random()) * 0x10000)
		  .toString(16)
		  .substring(1);
	  }
	  return 'u'+s4() + '-' + s4();
	}
	
	
	var Promise = function(closure){
		var dfd = new $.Deferred();
		var _this = this;
		var promise = dfd.promise();
		promise.id = dfd.id = unique();
		var reject = dfd.reject;
		var resolve = dfd.resolve;
		dfd.reject = function(){
			reject.apply(_this,arguments);
		}
		dfd.resolve = function(){
			resolve.apply(_this,arguments);
		}
		closure.call(_this,dfd);
		return promise;
	}
	
	var path = new Path();
	
	var Router = function(){
		var routerScope = this;
		routerScope.cache = {};

		Object.defineProperty(routerScope, 'uri', { get: function() {			
			var uri = newUri = $.trim(trim(window.location.hash,'#'));
			var query = '';
			if(newUri.indexOf('?') > -1){
				newUri = newUri.split('?');
				query = '?'+newUri[1];
				newUri = newUri[0];
			}
			newUri = (('/'+trim(newUri,'/')+'/').replace(/[\/]+/g,'/'))+query;
			if(uri != newUri || window.location.href.indexOf('#') == -1){
				if(routerScope.reloading) return newUri;
				routerScope.redirect({reload:true,history:false});
				return newUri;
			}
			return newUri;
		} });
		
		routerScope.preventChange = function(isPrevent){
			routerScope.preventUrl = isPrevent ? window.location.href : null;
		}
		
		routerScope.redirect = function(){
			var args = Array.prototype.slice.call(arguments);
			var config = args.length && typeof args[args.length -1] == 'object' ? args.pop() : {};
			if(routerScope.reloading) return;
			if(config.reload) {
				routerScope.reloading = true;
				$(window).off('hashchange');
			}
			var uri = routerScope.uri;
			args = args.join('|arg|').replace('#','').split('|arg|');
			if(args.length){
				if(trim(args.join(''))[0] != '/') args.unshift(uri);
			}
			var query = '';
			args.forEach(function(node,idx){
				args[idx] = trim(args[idx]);
				if(args[idx] !=''){
					if(node.indexOf('?') > -1) {
						node = node.split('?');
						query = '?'+node[1];
						args[idx] = node[0]+'/';
					 } else {
						 args[idx] = args[idx]+'/';
						 query = ''; 
					 }
				}
			});
			if(trim(args.join('')) == '') args = [uri];
			
			uri = '#'+path.join.apply(this,args)+query;
			if(config.history === false){
				window.location.replace(uri);
			} else {
				window.location.href = uri;				
			}
			if(config.reload) {
				window.location.reload(false);
			}			
		}
		routerScope.getPatternData = function(pattern){
			if(routerScope.cache[pattern]) {
				return routerScope.cache[pattern];
			}
			//pattern = pattern.split('\/')split('/').join('\/');
			var re = pattern;
			var groups = {};
			re = String(re).replace(/(:[a-z0-9\$_\-]+)/gmi, function (str, p1, p2) {
				var name = str.replace(':','');
				groups[name] = {name:name};
				return '('+str+')';
			});		

			var idx = 0;			
			re = String(re).replace(/\(([\s\S]*?)\)/gm, function (str, p1, p2) {
				var group = groups[p1.replace(':','')];
				if(group){
					groups[idx] = group;
					str = '([^\x00-\x1F\x80-\x9F\/]+)';
					delete groups[p1.replace(':','')];
				} else{
					groups[idx] = false;
				}
				idx++;
				return str;
			});						
			routerScope.cache[pattern] = {re:re,pattern:pattern,groups:groups};
			return routerScope.cache[pattern];
		}
		routerScope.get = function(pattern,callback){
			var _callback = function(result){
				var result = $.extend(true,{},result);
				if(typeof callback == 'function'){
					var callbackResult = callback.call(this,result);
					if(typeof callbackResult !== 'undefined') result = callbackResult;					
				}
				return result;
			}
			var patternData = routerScope.getPatternData(pattern);
			var uri = routerScope.uri;
			var cacheKey = uri+patternData.pattern;
			if(routerScope.cache[cacheKey]) {
				var result = routerScope.cache[cacheKey];
				return _callback.call(this,result);
			}
			var urlData = uri.split('?');
			urlData = {
				uri:urlData[0],
				query: urlData.length > 1 ? '?'+urlData[1] : ''
			};
			var match = (urlData.uri+urlData.query).match((new RegExp(patternData.re, "i")));
			match = (match && match.length > 1) ? match : false;
			if(match){
				var result = {
					match:[],
					uri:urlData,
					pattern:patternData.pattern
				};
				match.forEach(function(value,idx){
					result.match.push(value);
					var group = patternData.groups[idx -1];
					if(group && group.name && group.name.length){
						result[group.name] = decodeURIComponent($('<div>').attr('data-value',value).data('value'));
					}
				});
				routerScope.cache[cacheKey] = result;
				return _callback.call(this,result);
			}
			return null;
		}
		$( window ).on('hashchange',function(e){
			if(routerScope.preventUrl){
				window.location.replace(routerScope.preventUrl);
			} else {
				$(document).focus();
				onChangeUri();				
			}
			 e.preventDefault();
		});
	}
	var _router = new Router();
	
	
	var initController = function(loadConfig){
		var component = $(this).data('component');
		component.loadConfig  = loadConfig;
		var waitFor =  $.proxy( Promise, $(selector)); 	
		var code = '';
		var initPromise;
		var initDfd = waitFor(function(promise){
			initPromise = promise;
		});
		var selector = $(this);
		var self = selector;
		var router = {
			get: $.proxy(_router.get, $(selector)),
			redirect:_router.redirect,
			preventChange:_router.preventChange
		}
		
		Object.defineProperty(router, 'uri', { get: function() {			
			return _router.uri;
		} });				
		
		var url = (function(){
			var Url = function(){
				var urlScope = this;
				urlScope.uri = loadConfig.url;
				urlScope.join = function(){
					var args = Array.prototype.slice.call(arguments);
					args.unshift(urlScope.uri);
					return path.join.apply(this,args);
				}
			};
			Url.prototype.toString = function(){
				return this.uri;
			}
			return new Url();
		})()
		var scoped = function(callback){
			return $.proxy(callback, $(selector));
		}
		var loadCss = $.proxy( function(config){
			config = $.extend({once:true,cacheId:config.url,dataType:'text'},config);
			return waitFor(function(promise){
				ajax(config).done(function(){promise.resolve.apply(this,arguments)}).
							 fail(function(){promise.reject.apply(this,arguments)})
			}).done(function(data){
				if($('head > link[href="'+config.url+'"]').length) return;
				$('<link rel="stylesheet" type="text/css">').attr('href',config.url).appendTo('head');
			});		
		}, selector);
		var loadJs = $.proxy( function(config){
			config = $.extend({once:true,cacheId:config.url,dataType:'text'},config);
			return waitFor(function(promise){
				ajax(config).done(function(){promise.resolve.apply(this,arguments)}).
							 fail(function(){promise.reject.apply(this,arguments)})
			}).done(function(data){
				//if($('head > script[data-src="'+config.url+'"]').length) return;
				window.evauluatedScript = window.evauluatedScript || {};
				if(window.evauluatedScript[config.url]) return;
				window.evauluatedScript[config.url] = true;
				$.globalEval(data);
				data = null;
				//console.log(config.url);
				//$('<script>').attr('data-src',config.url).text(data).appendTo('head');
			});		
		}, selector);	
		var	matchUrl = function(){
			var args = arguments;
			return function(){
				console.log(args);				
			}
		}
		if (!('toJSON' in Error.prototype))
		Object.defineProperty(Error.prototype, 'toJSON', {
			value: function () {
				var alt = {};

				Object.getOwnPropertyNames(this).forEach(function (key) {
					alt[key] = this[key];
				}, this);

				return alt;
			},
			configurable: true,
			writable: true
		});		
		var evalCode = $.proxy(function(code){
			try{
				eval('/* '+url+' */\n; '+code+';');
			} catch(e){
				console.error('Eval error',e);
				initPromise.reject(url,e);
			}
		},selector);
		
		var loadPromises = [];
		
		$('<div>').append(component.source).each(function(idx,html){
			$(selector).empty();
			$(html).find('> template').each(function(idx,template){
				$(selector).append($(template).html());
			}).remove();
			$(html).find('> script[src]').each(function(idx,script){
				loadPromises.push(loadJs({url:$(script).attr('src')}));
			});
			$(html).find('> link[href*=".css"]').each(function(idx,css){
				loadPromises.push(loadCss({url:$(css).attr('href')}));
			});
			$(html).find('> script:not([src])').first().each(function(idx,controler){
				code += $(controler).text();
			});	
		});
		$(selector).one('beforeUnload',function(e,unloadConfig,unloadCallback){
			var unloadChildsPromises = [];
			$(selector).off('load ready show router.changeUri').component('find','[component-id]:not([component-state=unload])').each(function(idx,child){
				unloadChildsPromises.push($(child).component('unload',{replaceWith:false}));
			});
			
			$.when.apply($,unloadChildsPromises).then(function(){
				unloadChildsPromises = null;
				var unloadPromises = [];
				$(selector).triggerHandler('unload',[$.proxy( function(promise){(unloadPromises || []).push(promise);}, selector)]);
				$(selector).off('unload');
				$.when.apply($,unloadPromises).then(function(){	
					unloadPromises = null;
					var id = component.id;
					component = null;
					components.unbind(id);
					if(unloadConfig.replaceWith){
						$(selector).empty().replaceWith(unloadConfig.replaceWith);
					}
					selector = null;
					unloadCallback(id);
				})
			});
		});		
		try{
			evalCode(code);					
		} catch(e){
				console.error('Eval error',e);
		}
		$(selector).triggerHandler('load',[$.proxy( function(promise){(loadPromises || []).push(promise); return promise;}, selector),loadConfig.data]);
		$(selector).off('load');
		$.when.apply($,loadPromises).done(function(){
			loadPromises = null;
			$(selector).on('router.changeUri',function(){
				$(selector).triggerHandler('changeUri');
			});
			var readyPromises = [];
			$(selector).triggerHandler('ready',[$.proxy( function(promise){(readyPromises || []).push(promise); return promise;}, selector),loadConfig.data]);
			$(selector).off('ready');
			$.when.apply($,readyPromises).done(function(){
				readyPromises = null;
				initPromise.resolve();
				//$(selector).triggerHandler('show',[]);
				//$(selector).off('show');
			}).fail(function(e){
				initPromise.reject(e);
			});
		}).fail(function(e){
			initPromise.reject(e);
		})
		return initPromise;
	}
		
	$.fn.component.load = function(config){		
		if($(this).length > 1) {
			console.error( 'Multiple calls not allowed' );
			return this;
		}
		if(!$('head > style[id=componentShow]').length){
			$('<style id="componentShow">').appendTo('head').text('@keyframes componentShow {from { opacity: 0.99; } to { opacity: 1; }} [component-id]{animation-duration: 0.001s;animation-name: componentShow;}');			
		}
		
		if(!$(this).length) {
			console.error( 'Component not exists',{loadConfig:config});
			return this;
		}
		
		var initialDOM = $(this).data('initialDOM') || $(this)[0].outerHTML;
		var waitFor =  $.proxy( Promise, $(this)); 
		return waitFor(function(promise){
			var selector = this;
			var newInstance = $(initialDOM);
			$(newInstance).on( 'animationend.componentShow',function(e){
				if(e.originalEvent.animationName == 'componentShow'){
					e.preventDefault();
					e.stopPropagation();
					$(newInstance).triggerHandler('show');
					$(newInstance).off('animationend.componentShow');
				}
			});			
			var loadPromise = $(newInstance).component('cleanLoad',config);
			$.when.apply($,[$(selector).component('unload',{replaceWith:false}),loadPromise]).always(function(unloaded,loaded){
				loadPromise.done(function(){
					$(newInstance).data('initialDOM',initialDOM);
					$(selector).empty().replaceWith(newInstance);
					promise.resolve.call(newInstance,newInstance);
				}).fail(function(e){
					promise.reject(e);
				}).catch(function(err){
					console.error('Promise',err);
				});
			});
		})
	}
	
	$.fn.component.cleanLoad = function(config){
		var config = config || {} ;
		config.url = config.url ? String(config.url) : '';
		var waitFor =  $.proxy( Promise, this); 
		var component = $(this).data('component') || {id:unique()};						
		$(this).data('component',component);			
		var _selector = this;
		return waitFor(function(promise){
			$(_selector).first().each(function(idx,selector){
				components.add({id:component.id,selector:$(selector)});
				ajax.call($(selector),{url:config.url,dataType:'text',cacheId:config.url,retry:3}).done(function(data){
					component.source = data;
					try{
						initController.call($(selector),{url:config.url,data:config.data}).done(function(){
							promise.resolve.call($(selector),$(selector));
						}).fail(function(e){
							console.error('Init Promise fail',config.url,!e.fail || '');
							promise.reject(e);
						}).catch(function(err){
							console.error(config.url,err);
						});
					} catch(e){
						console.error('Promise catch reject',config.url,e);
						promise.reject(e);
					}
				}).fail(function(e){
					console.error('Promise fail reject',config.url,!e.fail || '');
					promise.reject(e);
				});
			})
		}).done(function(){
			$(this).attr('component-state','resolve');
		}).fail(function(e){
			$(this).attr('component-state','error');
			console.error('Promise fail',config.url,!e.fail || '');
		})
	}
	
	$.fn.component.unload = function(config){
		config = $.extend({
			replaceWith:$(this).data('initialDOM') || false
		},(config || {}));
		var waitFor =  $.proxy( Promise, this); 
		return waitFor(function(promise){
			if(!$(this).component('firstActive').each(function(idx,selector){			
				$(selector).attr('component-state','unload');
				$(selector).triggerHandler('beforeUnload',[config,function(result){
					promise.resolve();
				}]);
			}).length) promise.resolve();
		});
	}
	$.fn.component.firstActive = function(){
		if($(this).length > 1) {
			$.error( 'Multiple calls not allowed' );
			return this;
		}		
		return $(this).first().filter('[component-id]:not([component-state=unload])');
	}
	$.fn.component.find = function(selector){
		var el = null
		$(this).filter('[component-id]').each(function(){
			var componentEl = this;
			el = $(this).find(selector).filter(function(idx,el){
				return $(el).parents('[component-id]').first().is(componentEl)
			});
		})
		return $(el);
	}
	$.fn.component.reload = function(config){
		var result;
		$(this).component('firstActive').each(function(){
			var component = $(this).data('component');
			result = $(this).component('load',component.loadConfig);
		});
		return result;
	}
	$.fn.component.parent = function(config){
		return $(this).parents('[component-id]').first().component('firstActive');
	}
	
})( jQuery );