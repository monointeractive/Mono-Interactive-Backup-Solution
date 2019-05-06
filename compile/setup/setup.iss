#define _AppName "Backup Solution";
#define _AppPublisher "Mono Interactive";
#define _AppUrl "http://mono-interactive.pl";
#define _AppVersion GetDateTimeString('yyyymmdd', '', '');
#define _downloadFileName 'mbs-master' + GetDateTimeString('yyyymmddhh', '', '');
#define _tmp GetEnv('temp');
#include 'downloadplugin\idp.iss';

[Code]
function saveOfflineCopyCmd(fileName : string; onlineDataFilePath:string; offlineDataFilePath:string): boolean;
var
  lines : TArrayOfString;
begin
  Result := true;
  SetArrayLength(lines, 3);
  lines[0] := 'copy '+ AddQuotes(onlineDataFilePath)+' /B '+ AddQuotes(offlineDataFilePath) + ' /Y' ;
  lines[1] := 'del /Q '+ AddQuotes(onlineDataFilePath);
  lines[2] := 'del /Q ' + AddQuotes(filename);
  Result := SaveStringsToFile(filename,lines,true);
  exit;
end;

procedure exitIfPrevInstall();
begin
	if FileExists(  WizardDirValue() + '\mbs.exe') then
  begin  
	SuppressibleMsgBox('It has been detected that the application is already installed in the folder: '+ WizardDirValue() +'. Uninstall the application before reinstalling.', mbError, MB_OK,MB_OK);
  	Abort();
  end;
end;

var offlineDataPath : String;
procedure InitializeWizard();
var offlineInstall: Boolean;
begin
  exitIfPrevInstall();
  offlineDataPath := ExpandConstant('{srcexe}');
  StringChangeEx ( offlineDataPath ,'.exe', '_offline.dat', True);  
  idpSetOption('RetryButton', '1');
  idpSetOption('InvalidCert', 'ignore');
  offlineInstall := False;
  if FileExists(offlineDataPath) then
  begin
	  if MsgBox('An offline installation file was detected. Do you want to use this file for installation without downloading components from the Internet?', mbConfirmation, MB_YESNO) = IDYES then
	  begin
		offlineInstall := True;
	  end;
  end;
    
  if not offlineInstall then
  begin
	idpAddFileSize('https://github.com/monointeractive/Mono-Interactive-Backup-Solution/archive/master.zip', ExpandConstant('{tmp}\{#_downloadFileName}.tmp'), 140000000);
	//idpAddFileSize('http://127.0.0.1/master.zip', ExpandConstant('{tmp}\{#_downloadFileName}.tmp'), 140000000);
  end 
  else
  begin
	FileCopy(offlineDataPath,ExpandConstant('{tmp}\{#_downloadFileName}.tmp'),True);
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
  Log(ExpandConstant('{tmp}\{#_downloadFileName}.offline.cmd'));
  Exec('cmd.exe', ' /C ' + AddQuotes(ExpandConstant('{app}\postinstall.cmd')) + ' ' + AddQuotes(ExpandConstant('{#_tmp}\{#_downloadFileName}.zip')), '', SW_HIDE, ewWaitUntilTerminated, ResultCode)
  if ResultCode = 0 then
  begin
	Status := True;
	saveOfflineCopyCmd(ExpandConstant('{#_tmp}\{#_downloadFileName}.offline.cmd'), ExpandConstant('{#_tmp}\{#_downloadFileName}.zip'), offlineDataPath);
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
Filename: cmd.exe; Parameters: "/C ""{#_tmp}\{#_downloadFileName}.offline.cmd""  "; Description: Save the downloaded files to perform offline installation at a later time.; Flags: postinstall nowait unchecked runhidden

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
UsePreviousAppDir=yes
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
