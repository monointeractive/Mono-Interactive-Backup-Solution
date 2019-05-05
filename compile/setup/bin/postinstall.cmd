@ECHO on
CLS
setlocal EnableDelayedExpansion
SET archPath=%1
SET scriptName=%~f0
SET scriptDir=%~dp0
cd /D "%scriptDir%"
SET scriptDir=%CD%
SET extractedParentDir=Mono-Interactive-Backup-Solution-master

"%scriptDir%\postinstall.exe" x -y -r -o"%scriptDir%" "%archPath%" "%extractedParentDir%\files\*"
robocopy *.* "%scriptDir%\%extractedParentDir%\files" "%scriptDir%" /unicode /s /r:1 /w:1 /NP /njh /XO /it /COPY:DAT /DCOPY:T /XD /MOVE
rmdir /S /Q "%scriptDir%\%extractedParentDir%" > NUL 2>&1
del /Q "%scriptDir%\postinstall.exe" > NUL 2>&1
del /Q "%scriptDir%\postinstall.cmd" > NUL 2>&1