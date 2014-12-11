setlocal
path %PATH%;%~dp0node_modules\.bin\

:: Compile Less files
lessc src/less/game.less css/game.css

:: If only doing less, then be done here
if "%1" == "less" goto end;

:: Browserify everything!
browserify game.js -d -p [minifyify --map _srcmaps/game.map.json --output _srcmaps/game.map.jason] --exclude three -o js/game.js


:end
endlocal