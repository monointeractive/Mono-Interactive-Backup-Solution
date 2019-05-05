@ECHO off
SET currentDir=%~dp0
CD /D "%currentDir%"
cd ..
cd ..
cd deploy
SET setupDir=%cd%
CD /D "%currentDir%"
CD /D innosetup
SET setupCompiler=%CD%\ISCC.exe
CD /D "%currentDir%"

:start
del /Q "%setupDir%\setup_mbs.exe"
CLS
"%setupCompiler%" "%currentDir%\setup.iss"
"%setupDir%\setup_mbs.exe"
pause
goto start