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
  idpSetOption('RetryButton',    '1');
  idpSetOption('InvalidCert',    'ignore');
  if not FileExists(ExpandConstant('{#_tmp}\{#_downloadFileName}.zip')) then
  begin
	idpAddFileSize('https://github.com/monointeractive/Mono-Interactive-Backup-Solution/archive/master.zip', ExpandConstant('{tmp}\{#_downloadFileName}.tmp'), 140000000);
  end;
  idpDownloadAfter(wpReady);
end;

procedure TasksKill();
var
  ResultCode: Integer;
begin
	Exec(ExpandConstant('taskkill.exe'), '/f /t /im ' + '"mbs_*"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    Exec(ExpandConstant('taskkill.exe'), '/f /t /im ' + '"mbs.exe"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

function InitializeUninstall(): Boolean;
  var ErrorCode: Integer;
begin
  TasksKill();
  result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then 
  begin
    RenameFile(ExpandConstant('{tmp}\{#_downloadFileName}.tmp'),ExpandConstant('{#_tmp}\{#_downloadFileName}.zip'));
	if not FileExists(ExpandConstant('{#_tmp}\{#_downloadFileName}.zip')) then
	begin
		//DeleteFile(ExpandConstant('{tmp}\{#_downloadFileName}.tmp'));
		//DeleteFile(ExpandConstant('{_tmp}\{#_downloadFileName}.zip'));
		SuppressibleMsgBox('Installation failed. Please try again or report the problem to the software provider.', mbError, MB_OK, MB_OK);
	end;
  end;
end;

[Files]
Source: "bin\postinstall.exe"; DestDir: "{app}"; Flags: ignoreversion; BeforeInstall: TasksKill()
Source: "bin\postinstall.cmd"; DestDir: "{app}"; 

[Run]
Filename: "{app}\postinstall.cmd"; Parameters: "{#_tmp}\{#_downloadFileName}.zip"; Flags: runhidden;

[UninstallDelete]
Type: filesandordirs; Name: "{app}"

[Setup]
AppId={{0DC904E7-E8CD-4373-97E1-2409C60BDA0F}
AppName={#_AppName}
AppVersion={#_AppVersion}
AppVerName={#_AppPublisher} {#_AppName}
AppPublisher={#_AppPublisher}
AppPublisherURL={#_AppUrl}
AppSupportURL={#_AppUrl}
AppUpdatesURL={#_AppUrl}
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
