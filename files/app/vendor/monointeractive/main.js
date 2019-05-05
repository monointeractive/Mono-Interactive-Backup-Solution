var main = new (function(){
	var scope = this;
	scope.init = function(){
		scope.showSplash();
		config.data.projects = config.data.projects && typeof config.data.projects == 'object' && config.data.projects.length ? config.data.projects : [];
		scope.projects = config.data.projects;
		scope.table.parent = scope;
		scope.table.init();
		//scope.backupSettingsWindow();
		//$('.btn-edit').last().click();
	}
	scope.showSplash = function(){
		scope.splashWnd = nw.Window.open('app/splash.html', {width:550,height:330,resizable:false,always_on_top:true,show_in_taskbar:false,frame:false,show:false}, function(new_win) {
			scope.splashWnd = new_win;			
			setTimeout(function(){scope.splashWnd.show();},200);
			setTimeout(function(){if(scope.splashWnd) scope.splashWnd.close(true);},10000);
		});
	}
	scope.openLogsFolder = function(){
		var dir = backup.getLogFileDir();
		if(!fs.existsSync(dir)) return showNotify({title:'Log folder is not exists',dir});
		var _open = spawn('explorer',[dir],{detached:true});
		_open.unref();
	}
	scope.backupSettingsWindow = function(){
		$(`<form>
			<div class="row">
				<div class="col">
					<div class="form-group">
					  <label>Computer name</label>
					  <input name="userdomain" type="text" data-onvalidate="if(this.value.length < 3) return 'Enter the name of this computer'" placeholder="Computer name" class="form-control">
					</div>
				</div>
				<div class="col">
					<div class="form-group">
					  <label>User name</label>
					  <input name="username" type="text" data-onvalidate="if(this.value.length < 3) return 'Enter the name of this user'" placeholder="User name" class="form-control">
					</div>
				</div>				
			</div>				
			<div class="row">
				<div class="col">
					<div class="form-group">
					  <label>Wait for inactivity before running a copy</label>
					  <select name="inactivityDelay" class="form-control"></select>
					</div>
				</div>
				<div class="col">
					<div class="form-group">
					  <label>Delete copies older than</label>
					  <select name="deleteAfterDays" class="form-control"></select>
					</div>
				</div>			
				<div class="col">
					<div class="form-group">
					  <label>Force stop copying after</label>
					  <select name="maxBackupExecutionTime" class="form-control"></select>
					</div>
				</div>					
			</div>						
			<div class="row">
				<div class="col">
					<div class="form-group">
						<label>Local folder for saving copies</label>
						<div class="input-group mb-3">
							<input type="text" class="form-control" name="rootBackupDir" data-onvalidate="if(!path.dirname(this.value).isValidWindowsDirname({allowDrive:true})) return 'The path must exist and must be readable by the logged in user.';" placeholder="Select directory">
							<div class="input-group-append"><a href="#" class="btn-browse-dir btn btn-lg btn-link"><span class="fa fa-fw fa-folder-open"></span></a></div>
						</div>						
					</div>
				</div>								
			</div>							
		</form>`).each(function(idx,form){
				config.data.server = config.data.server || {};
			var modal = $.mono.box({
				title:'Backup settings',
				message:form,
				autofocus:false,
				fitToMaxWidth:true,
				maxWidth:800,
				buttons:[
					{
						label: 'Save',
						className: 'btn primary',
						id:'submit',
						callback: function(modal){							
							$(form).submit();
							return false;
						}
					}
				]
			});
			$('input[name="userdomain"]',form).each(function(idx,input){
				if(config.data.userdomain) $(input).val(config.data.userdomain);
			});										
			$('input[name="username"]',form).each(function(idx,input){
				if(config.data.username) $(input).val(config.data.username);
			});							
			$('select[name=inactivityDelay]',form).each(function(idx,select){
				var min = 60;
				var hour = min * 60;
				[min / 2 ,min,min *5,min * 10,min * 20,min * 30,hour,hour * 2,hour * 4, hour * 6].forEach(function(i){
					$('<option>').each(function(idx,option){
						if(option) value = humanizeDuration(i * 1000);
						if(i == min * 20) {
							value = value + ' (default)';
						}
						$(option).attr('value',i).text(value);
					}).appendTo(select);					
					$(select).val(config.data.inactivityDelay || min * 20);
				});
			});
			$('select[name=deleteAfterDays]',form).each(function(idx,select){
				[-1,5,10,30,60,90,365,9999].forEach(function(i){
					$('<option>').each(function(idx,option){
						var value = i+' days';
						if(i == -1) {value = 'Always (for test)';}
						if(i == 90) {value = value + ' (default)';}
						if(i == 9999) {value = 'Never'};
						$(option).attr('value',i).text(value);
					}).appendTo(select);					
					$(select).val(config.data.deleteAfterDays || 90);
				});
			});
			$('select[name=maxBackupExecutionTime]',form).each(function(idx,select){
				[1,5,10,30,60,90,180, 240, 360, 720,0].forEach(function(i){
					$('<option>').each(function(idx,option){
						var value = i + ' min';
						if(i) value = humanizeDuration((i * 1000) * 60);
						if(i == 1) {value = value + ' (for test)';}
						if(i == 180) {value = value + ' (default)';}
						if(i == 0) {value = 'Limitless (not recommended)';}
						$(option).attr('value',i).text(value);
					}).appendTo(select);					
					$(select).val(config.data.maxBackupExecutionTime || 180);
				});
			});			
			
			$('input[name="rootBackupDir"]',form).each(function(idx,input){
				if(config.data.rootBackupDir) $(input).val(config.data.rootBackupDir);
			});							
		
			$(form).on('submit',function(e){
				var data = $(form).serializeAssoc();
				var result = false;
				$(form).mono('formValidator',{callback:function(data){
					result = data.result;
				}});
				if(result){				
					data.lastSettingsSave = moment().format("YYYY-MM-DD HH:mm:ss");
					data.deleteAfterDays = _parseInt(data.deleteAfterDays);
					data.inactivityDelay = _parseInt(data.inactivityDelay);
					data.maxBackupExecutionTime = _parseInt(data.maxBackupExecutionTime);
					data.rootBackupDir = $.trim(data.rootBackupDir);
					config.data = $.extend(true,config.data,data);
					config.save();
					$(modal).trigger('hide');					
				}
				return false;
			});			
		});		
	}
	scope.syncSettingsWindow = function(){
		$(`<form>
			<div class="row">
				<div class="col">
					<div class="form-group">
					  <label>Type</label>
					  <select name="server.type" class="form-control">
						<option value="">Disabled</option>
						<option value="ftp">FTP</option>
						<option value="dav">Webdav</option>
					  </select>
					</div>
				</div>
				<div class="col">
					<div class="form-group">
					  <label>Host</label>
					  <input name="server.host" type="text" placeholder="e.g. localhost" class="form-control">
					</div>
				</div>				
				<div class="col">
					<div class="form-group">
					  <label>Port</label>
					  <input name="server.port" type="text" data-onvalidate="if(this.value.length && !_parseInt(this.value)) return 'Enter valid server port'" placeholder="e.g. 21" class="form-control">
					</div>
				</div>	
				<div class="col">
					<div class="form-group">
					  <label>Remote folder</label>
					  <input name="server.remoteDir" type="text" placeholder="/" class="form-control">
					</div>
				</div>					
			</div>
			<div class="row">
				<div class="col">
					<div class="form-group">
					  <label>Username</label>
					  <input name="server.user" type="text" placeholder="e.g. anonymous" class="form-control">
					</div>
				</div>
				<div class="col">
					<div class="form-group">
					  <label>Password</label>
					  <input name="server.pass" type="password" placeholder="" class="form-control">
					</div>
				</div>													
			</div>			
		</form>`).each(function(idx,form){
				config.data.server = config.data.server || {};
			var modal = $.mono.box({
				title:'Synchronization settings',
				message:form,
				autofocus:false,
				fitToMaxWidth:true,
				maxWidth:800,
				buttons:[
					{
						label: 'Save',
						className: 'btn primary',
						id:'submit',
						callback: function(modal){							
							$(form).submit();
							return false;
						}
					}
				]
			})		
						
		
			$('select[name="server.type"]',form).each(function(idx,select){
				if(config.data.server.type) $(select).val(config.data.server.type);
			});		
			$('input[name="server.host"]',form).each(function(idx,input){
				if(config.data.server.host) $(input).val(config.data.server.host);
			});					
			$('input[name="server.port"]',form).each(function(idx,input){
				if(config.data.server.port) $(input).val(config.data.server.port);
			});		
			$('input[name="server.remoteDir"]',form).each(function(idx,input){
				if(config.data.server.remoteDir) $(input).val(config.data.server.remoteDir);
			});		
			$('input[name="server.user"]',form).each(function(idx,input){
				if(config.data.server.user) $(input).val(config.data.server.user);
			});		
			$('input[name="server.pass"]',form).each(function(idx,input){
				if(config.data.server.pass) $(input).val(config.data.server.pass);
			});
			
		
			$(form).on('submit',function(e){
				var data = $(form).serializeAssoc();
				var result = false;
				$(form).mono('formValidator',{callback:function(data){
					result = data.result;
				}});
				if(result){
					data['server.remoteDir'] = $.trim(data['server.remoteDir']);
					data['server.host'] = $.trim(data['server.host']);
					data['server.host'] = !data['server.host'].length ? 'localhost' : data['server.host'];
					data['server.port'] = _parseInt(data['server.port']) || '';
					data['server.user'] = $.trim(data['server.user']);
					data['server.user'] = !data['server.user'].length ? 'anonymous' : data['server.user'];
					data['server.pass'] = $.trim(data['server.pass']);
					(function(){
						for(var i in data){
							if(i.indexOf('.') > -1) {
								try{								
									var obj = {}; obj[i] = data[i];
									obj = nestStringProperties(obj);
									delete data[i];
									data = $.extend(true,data,obj);
								} catch(err){}
							}
						}
					})();			
					data.lastSettingsSave = moment().format("YYYY-MM-DD HH:mm:ss");					
					config.data = $.extend(true,config.data,data);
					config.save();
					$(modal).trigger('hide');					
				}
				return false;
			});			
		});		
	}	
	scope.projectPropertiesWindow = function(project,isNew){
		var isExist = project && typeof project == 'object';
		if(!isExist) {
			project = {
				enabled:true, 
				maxFileSizeMb:100,
				maxZipFileSizeMb:50,
				exclude : '*\\tmp\\*;*\\temp\\*'
			};	
		}
		isNew = isNew || !isExist;
		project.accept = typeof project.accept == 'string' && project.accept.length ? project.accept : '*.*';

		$(`<form>
			<div class="row">
				<div class="col">
					<div class="form-group">
					  <label>Project name</label>
					  <input name="name" type="text" data-onvalidate="if(this.value.length < 3) return 'Enter the name of the project'" placeholder="Project name" class="form-control">
					</div>
				</div>
				<div class="col">
					<div class="form-group">
					  <label>Ignore files larger than</label>
					  <select name="maxFileSizeMb" class="form-control"></select>
					</div>
				</div>
				<div class="col">
					<div class="form-group">
					  <label>Divide the output .zip's if</label>
					  <select name="maxZipFileSizeMb" class="form-control"></select>
					</div>
				</div>				
			</div>
			<div class="row">
				<div class="col">
					<div class="form-group">
						<label>Folder to backup</label>
						<div class="input-group mb-3">
							<input type="text" class="form-control" name="path" data-onvalidate="if(!this.value.isValidWindowsDirname()) return 'The path must exist and must be readable by the logged in user.';" placeholder="Select directory">
							<div class="input-group-append"><a href="#" class="btn-browse-dir btn btn-lg btn-link"><span class="fa fa-fw fa-folder-open"></span></a></div>
						</div>						
					</div>
				</div>								
			</div>
			<div class="row">
				<div class="col">
					<label>Path filters</label>
					<span class="small">(wildcards support e.g.: *.txt, */docs/*.txt etc.)</span>
				</div>
			</div>
			<div class="row">
				<div class="col">
					<div class="form-group">
					  <label>Accept <a title="Add" href="#" id="add-accept" class="btn btn-add btn-sm"><span class="fa fa-fw fa-plus-circle"></span></a></label>
					  <table id="accept" class="recordTable table table-bordered table-striped table-hover table-sm">
						<tbody></tbody>
					  </table>
					</div>
				</div>
				<div class="col">
					<div class="form-group">
					  <label>Ignore <a title="Add" href="#" id="add-exclude" class="btn btn-add btn-sm"><span class="fa fa-fw fa-plus-circle"></span></a></label>
					  <table id="exclude" class="recordTable table table-bordered table-striped table-hover table-sm">
						<tbody></tbody>
					  </table>
					</div>
				</div>						
			</div>					
		</form>`).each(function(idx,form){
			var modal = $.mono.box({
				title:'Project properties',
				message:form,
				autofocus:false,
				fitToMaxWidth:true,
				maxWidth:800,
				buttons:[
					{
						label: 'Save',
						className: 'btn primary',
						id:'submit',
						callback: function(modal){							
							$(form).submit();
							return false;
						}
					}
				]
			})					
			$('select[name=maxFileSizeMb]',form).each(function(idx,select){
				[10,50,100,300,500,1000,99999].forEach(function(i){
					$('<option>').each(function(idx,option){
						var value = i+' MB';
						if(i == 99999) value = 'Limitless (not recommended)';
						if(i == 100) {
							value = value + ' (default)';
						}
						$(option).attr('value',i).text(value);
					}).appendTo(select);					
					$(select).val(project.maxFileSizeMb || 100);
				});
			});
			$('select[name=maxZipFileSizeMb]',form).each(function(idx,select){
				[10,50,100,300,500,1000,99999].forEach(function(i){
					$('<option>').each(function(idx,option){
						var value = '[size] > '+i+' MB';
						if(i == 99999) value = 'Limitless (not recommended)';
						if(i == 50) {
							value = value + ' (default)';
						}
						$(option).attr('value',i).text(value);
					}).appendTo(select);					
					$(select).val(project.maxZipFileSizeMb || 50);
				});
			});			
			
			(function(){						
				var splitFilters = function(str){
					str = typeof str == 'string' ? str : '';
					var result = [];
					var filters = $.trim(str).split(/[\n,\r,;,\|,\,]+/);
					filters = filters && typeof filters =='object' && filters.length ? filters : [];
					filters.forEach(function(item){
						item = typeof item == 'string' ? $.trim(item) : '';
						if(!item.length) return;
						result.push(item);
					});
					return result;
				};
				var addFiltersFromArray = function(table,filters){
					filters = typeof filters == 'object' && filters.length ? filters : [];															
					filters.forEach(function(filter){
						addRow(table,filter);									
					});
				}
				var addFilterWindow = function(config){
					config = config || {};
					var filter = prompt('Add filter (wildcards support e.g.: *.txt)',config.value);
					return filter;
				}
				var addRow = function(table,filter){
					var removeChar = ';\|,"';
					filter = $.trim(filter);
					filter = filter.replace(/[|&;$%@"<>()+,;'\|,]/g, "");							
					if(!filter || !filter.length) return;
					$('tbody',table).each(function(idx,tbody){
						var exists = false;
						$('td',tbody).each(function(){
							if(!exists && $.trim($(this).text()).toLowerCase() == filter.toLowerCase()) exists = true;
						});
						if(exists) return;
						
						$(`<tr>
							<td><div class="ellipsis"><span class="filter">${filter}</span></div></td>
							<td class="cell-minimal-nowrap actions">
								<button title="Move up" class="btn btn-up btn-sm btn-link"><span class="fa fa-fw fa-arrow-up"></span></button>
								<button title="Move down" class="btn btn-down btn-sm btn-link"><span class="fa fa-fw fa-arrow-down"></span></button>
								<button title="Edit" class="btn btn-edit btn-sm btn-link"><span class="fa fa-fw fa-pencil"></span></button>
								<button title="Remove" class="btn btn-remove btn-sm btn-link"><span class="fa fa-fw fa-times"></span></button>
							</td>
						</tr>`).each(function(idx,tr){
							$(tr).data('record',{edit:function(){
									var filter = addFilterWindow({value:$.trim($('span.filter',tr).text())});
									if(filter && $.trim(filter).length){
										$(tr).remove();
										addFiltersFromArray(table,splitFilters(filter));
									}
							}});
						}).appendTo(tbody);	
					});
				};
				
				['accept','exclude'].forEach(function(filterType){							
					$('table#'+filterType,form).each(function(idx,table){
						addFiltersFromArray(table,splitFilters(project[filterType] || ''));
						$('a#add-'+filterType,form).on('click',function(e){
							var filter =  addFilterWindow();
							if(filter && $.trim(filter).length){
								addFiltersFromArray(table,splitFilters(filter));
							}
							e.preventDefault();
						});
					});
				});
			})();
			
			$('input[type=text]',form).each(function(idx,input){
				var name = $(input).attr('name');
				if(typeof project[name] !='undefined') $(input).val(project[name]);						
			});
			
			$(form).on('submit',function(e){
				var result = false;
				$(form).mono('formValidator',{callback:function(data){
					result = data.result;
				}});
				if(result){							
					var data = $(form).serializeAssoc();	
					data.maxFileSizeMb = _parseInt(data.maxFileSizeMb);					
					data.maxZipFileSizeMb = _parseInt(data.maxZipFileSizeMb);					
					data.accept = [];
					data.exclude = [];
					['accept','exclude'].forEach(function(filterType){							
						$('table#'+filterType+' tr td span.filter',form).each(function(idx,filter){
							data[filterType].push($.trim($(filter).text()));
						});									
						data[filterType] = data[filterType].join(';');
					});
					if(!data.accept.length) data.accept = '*.*';
					project = $.extend(true,project,data);
					if(isNew) scope.projects.push(project);
					config.save();
					scope.table.reload();
					$(modal).trigger('hide');					
				}
				return false;
			});			
		});
	}
	scope.table = new (function(){
		var scope = this;
		scope.init = function(){
			$('body').on('click','td.actions .btn-link, td.check',function(e){
				var btn = this;
				var tr = $(btn).parents('tr').first();				
				var recordData = $(tr).data('record');
				
				if($(btn).is('td.check')){
					var status = $(tr).attr('data-status') == 'selected';
					status = !status;
					$(tr).attr('data-status',status ? 'selected' : 'false');
					if(recordData && typeof recordData == 'object' && recordData.row && recordData.save){
						recordData.row.enabled = status;
						recordData.save();
					}
				}
				if($(btn).is('.btn-remove')){
					if(window.confirm('Are you sure you want to delete this entry?')){		
						$(tr).remove();
						if(recordData && typeof recordData == 'object' && recordData.save){
							recordData.array.splice(recordData.idx, 1);
							recordData.save();
						}
					}
				}
				if($(btn).is('.btn-edit')){
					if(recordData.edit){
						recordData.edit(tr);
					}
				}
				if($(btn).is('.btn-up') || $(btn).is('.btn-down')){
					var isUp = $(btn).is('.btn-up');
					$(tr)[isUp ? 'insertBefore' : 'insertAfter']($(tr)[isUp ? 'prev' : 'next']());
					if(recordData && typeof recordData == 'object' && recordData.save){
						recordData.array.move(recordData.idx, $(tr).index());
						recordData.save();
					}
				}
				e.stopPropagation();
				e.preventDefault();
			});
			scope.reload();
		}
		scope.reload = function(){
			scope.projectTable = $(`<table class="recordTable table table-bordered table-striped table-hover table-sm">
				<thead>
					<tr>
						<th colspan="2"><span>Name</span></th>
						<th><span>Path</span></th>
						<th><span>Accept</span></th>
						<th><span>Exclude</span></th>
						<th style="width:1px;" class="text-center"></th>
					</tr>
				</thead>
				<tbody>
				</tbody>
			</table>`);
			$('#projectList').empty().append(scope.projectTable);			
			
			scope.parent.projects.forEach(function(project,idx){
				$(`<tr data-status="${project.enabled ? "selected" : "false"}">
					<td title="Change on/off" class="check text-center"><span></span></td>
					<td style="width:1px"><span>${project.name}<span></td>
					<td><div class="ellipsis"><span style="direction: rtl;">${project.path}</span></div></td>
					<td>${project.accept ? '<div class="ellipsis"><span>'+project.accept+'</span></div>' : ''}</td>
					<td>${project.exclude ? '<div class="ellipsis"><span>'+project.exclude+'</span></div>' : ''}</td>
					<td class="cell-minimal-nowrap actions">
						<button title="Move up" class="btn btn-up btn-sm btn-link"><span class="fa fa-fw fa-arrow-up"></span></button>
						<button title="Move down" class="btn btn-down btn-sm btn-link"><span class="fa fa-fw fa-arrow-down"></span></button>
						<button title="Edit" class="btn btn-edit btn-sm btn-link"><span class="fa fa-fw fa-pencil"></span></button>
						<button title="Remove" class="btn btn-remove btn-sm btn-link"><span class="fa fa-fw fa-times"></span></button>
					</td>
				  </tr>`).each(function(){
					  $('td',this).each(function(){
						  var title = $(this).attr('title');
						  if(!title) title = $.trim($(this).text());
						  $(this).attr('title',title);
					  });
					  $(this).data('record',{idx:idx,array:scope.parent.projects,row:project,save:function(){scope.reload();config.save();},edit:function(){scope.parent.projectPropertiesWindow(project)}});
				  }).appendTo($('tbody',scope.projectTable));		

			});		
		}
	})();
})();

$( document ).ready(function() {
	$('body').on('dblclick','.recordTable tr',function(e){
		$('.btn-edit',this).first().click();
		e.preventDefault(); 
		e.stopPropagation();
	});
	$('body').on('click','.btn-browse-dir',function(e){
		var input = false;
		if(!input) $(this).parents('.input-group').first().find('input').first().each(function(){input = this;});
		$(input).each(function(){
			openFileDialog({isDir:true,dir:$(input).val().length ? $(input).val() : config.data.lastDir || '',callback:function(files){
				$(input).val(files[0].path);
				config.data.lastDir = files[0].path;
			}});
		});
		e.preventDefault();
		e.stopPropagation();
	});
	
	$.mono.setup.formValidator({
		callback:function(data){
			var showDelay = -200;
			var errors = [];
			data.items.forEach(function(item,idx){
				var attrTarget = $(item.input).is(':visible') ? item.input : $(item.input).parents('.form-group').first();
				$(attrTarget).attr('data-valid',item.isValid).on('focus, click',function(){$(this).removeAttr('data-valid');});
				if(!item.isValid) {
					errors.push(item.msg);
					
				}
			});
			if(errors.length) showNotify({title:'Some fields need improvement',message:errors.join('<br>')});
		}
	});		
	if(typeof win =='object' && debugMode && !process.isExit){
		win.showDevTools();
	}	
	if(process.isExit) return;
	
	config.init();
	app.init();
	tray.init();
	main.init();
	$(document).on('keydown',function(e){
		if(e.which == 87 && e.ctrlKey){
			$(document).off('keydown');
			app.restart();
		}
	});	
	setTimeout(function(){
		if(!debugMode) update.start(); else showNotify({title:'Debug mode is enabled',message:'Skip autoupdate'});
	},3000);
	win.minimize();
	if(!config.data.lastSettingsSave || debugMode){
		if(!config.data.lastSettingsSave) main.backupSettingsWindow();
		setTimeout(function(){if(win) win.show();},debugMode ? 1000 : 5000);		
	}
});