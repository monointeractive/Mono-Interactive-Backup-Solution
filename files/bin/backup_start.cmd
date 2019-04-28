@echo off
setlocal enabledelayedexpansion
set currentDir=%cd%
set initDir=%~dp0
CD /D "%initDir%"
set initDir=%cd%
CD /D "%currentDir%"
cls
"%initDir%\php\php.exe" -f "%initDir%\php\start.php" -c "%initDir%\php\php.ini" & "%initDir%\winscp\winscp.com" /log="%currentDir%\transfer.txt" /ini=nul /script="%initDir%\winscp\sync.txt"
exit