echo Off
cls
setlocal EnableDelayedExpansion
SET currentDir=%~dp0
CD /D "%currentDir%"
SET currentDir=%CD%
SET outputDir=%currentDir%
SET outputDir=%outputDir:scss=css%
echo "%currentDir%:%outputDir%"
START /B sass --no-cache --sourcemap=none --trace --watch "%currentDir%":"%outputDir%"
pause