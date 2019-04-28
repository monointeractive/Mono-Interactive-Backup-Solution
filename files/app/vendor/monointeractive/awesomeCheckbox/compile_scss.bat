echo Off
cls
REM setlocal EnableDelayedExpansion
SET currentDir=%~dp0
CD /D "%currentDir%"
SET currentDir=%CD%
SET outputDir=%currentDir% 
SET outputDir=%outputDir:scss=css%
START /B sass --no-cache --sourcemap=none --trace --watch %currentDir%:%outputDir%
pause