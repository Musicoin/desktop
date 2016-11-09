nwb nwbuild  -v 0.17.4 --with-ffmpeg -p win64,osx64,linux64 -o C:\tmp\mc-mvp3 --side-by-side
del C:\tmp\mc-mvp3\Musicoin-client-win-x64\config\config.ext.js
del C:\tmp\mc-mvp3\Musicoin-client-osx-x64\config\config.ext.js
del C:\tmp\mc-mvp3\Musicoin-client-linux-x64\config\config.ext.js

robocopy C:\tmp\mc-mvp3\dependencies\win64 C:\tmp\mc-mvp3\Musicoin-client-win-x64\bin /S
robocopy C:\tmp\mc-mvp3\dependencies\osx64 C:\tmp\mc-mvp3\Musicoin-client-osx-x64\Musicoin-client.app\Contents\Resources\app.nw\bin /S
robocopy C:\tmp\mc-mvp3\dependencies\linux64 C:\tmp\mc-mvp3\Musicoin-client-linux-x64\bin /S