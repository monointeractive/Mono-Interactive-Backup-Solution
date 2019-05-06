#define _AppName "Backup Solution";
#define _AppPublisher "Mono Interactive";
#define _AppUrl "http://mono-interactive.pl";
#define _AppVersion GetDateTimeString('yyyymmdd', '', '');
#define _downloadFileName 'mbs-master' + GetDateTimeString('yyyymmdd', '', '');
#define _tmp GetEnv('temp');
#include 'downloadplugin\idp.iss';

[Code]

procedure InitializeWizard();
begin
  idpSetOption('RetryButton', '1');
  idpSetOption('InvalidCert', 'ignore');
  if not FileExists(ExpandConstant('{#_tmp}\{#_downloadFileName}.zip')) then
  begin
	idpAddFileSize('https://github.com/monointeractive/Mono-Interactive-Backup-Solution/archive/master.zip', ExpandConstant('{tmp}\{#_downloadFileName}.tmp'), 140000000);
	//idpAddFileSize('http://127.0.0.1/master.zip', ExpandConstant('{tmp}\{#_downloadFileName}.tmp'), 140000000);
  end 
  else
  begin
	if FileCopy(ExpandConstant('{#_tmp}\{#_downloadFileName}.zip'),ExpandConstant('{tmp}\{#_downloadFileName}.tmp'),True) then
	begin
		DeleteFile(ExpandConstant('{#_tmp}\{#_downloadFileName}.zip'));  
	end;
  end;
  idpDownloadAfter(wpReady);
end;

procedure TasksKill();
var ResultCode: Integer;
begin
	Exec(ExpandConstant('taskkill.exe'), '/f /t /im ' + '"mbs_*"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    Exec(ExpandConstant('taskkill.exe'), '/f /t /im ' + '"mbs.exe"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

procedure _extract();
var
  ResultCode: Integer;
  Status: Boolean;
begin
  Exec('cmd.exe', ' /C ' + AddQuotes(ExpandConstant('{app}\postinstall.cmd')) + ' ' + AddQuotes(ExpandConstant('{#_tmp}\{#_downloadFileName}.zip')), '', SW_HIDE, ewWaitUntilTerminated, ResultCode)
  if ResultCode = 0 then
  begin
	Status := True;
  end
  else begin
	DeleteFile(ExpandConstant('{#_tmp}\{#_downloadFileName}.zip'));  
    SuppressibleMsgBox('Installation failed. Please try again or report the problem to the software provider. Exit code ' + IntToStr(ResultCode), mbError, MB_OK,MB_OK);
	Status := False;
  end;
  DeleteFile(ExpandConstant('{tmp}\{#_downloadFileName}.tmp'));
  DeleteFile(ExpandConstant('{app}\postinstall.cmd'));
  if Status = False then
  begin
	WizardForm.Close;
  end;
end;

function InitializeUninstall(): Boolean;
begin
  TasksKill();
  result := True;
end;


[Files]
Source: "{tmp}\{#_downloadFileName}.tmp"; DestDir: "{#_tmp}" ; DestName : "{#_downloadFileName}.zip" ; Flags: external ignoreversion; 
Source: "bin\postinstall.exe"; DestDir: "{app}"; Flags: ignoreversion; BeforeInstall: TasksKill()
Source: "bin\postinstall.cmd"; DestDir: "{app}"; AfterInstall: _extract()
Source: "..\..\files\app\icons\icon.ico"; DestDir: "{app}"; 

[Run]
Filename: {app}\mbs_uac.exe; Description: Run {#_AppPublisher} {#_AppName}; Flags: postinstall nowait

[UninstallDelete]
Type: filesandordirs; Name: "{app}"

[Icons]
Name: "{group}\{#_AppName}\{#_AppName}"; Filename: "{app}\mbs_uac.exe"; IconFilename: {app}\icon.ico;
Name: "{group}\{#_AppName}\{cm:UninstallProgram,{#_AppName}}"; Filename: "{uninstallexe}"

[Setup]
AppId={{0DC904E7-E8CD-4373-97E1-2409C60BDA0F}
AppName={#_AppName}
AppVersion={#_AppVersion}
AppVerName={#_AppPublisher} {#_AppName}
AppPublisher={#_AppPublisher}
AppPublisherURL={#_AppUrl}
AppUpdatesURL=https://github.com/monointeractive/Mono-Interactive-Backup-Solution/tree/master/deploy
DefaultDirName={commonpf}\{#_AppPublisher}\{#_AppName}
DefaultGroupName={#_AppPublisher}
OutputBaseFilename=setup_mbs
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
OutputDir=..\..\deploy\
PrivilegesRequired=poweruser
AllowUNCPath=False
ShowLanguageDialog=no
LanguageDetectionMethod=none
SolidCompression=True
