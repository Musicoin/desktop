call nwb nwbuild  -v 0.17.4 --with-ffmpeg -p win64,osx64,linux64 -o C:\tmp\mc-mvp3 --side-by-side

robocopy C:\tmp\mc-mvp3\dependencies\win64 C:\tmp\mc-mvp3\Musicoin-client-win-x64\bin /S
robocopy C:\tmp\mc-mvp3\dependencies\osx64 C:\tmp\mc-mvp3\Musicoin-client-osx-x64\Musicoin-client.app\Contents\Resources\app.nw\bin /S
robocopy C:\tmp\mc-mvp3\dependencies\linux64 C:\tmp\mc-mvp3\Musicoin-client-linux-x64\bin /S

REM Remove files we don't want but nwbuild will copy
del C:\tmp\mc-mvp3\Musicoin-client-win-x64\config\config.ext.js
del C:\tmp\mc-mvp3\Musicoin-client-osx-x64\Musicoin-client.app\Contents\Resources\app.nw\config\config.ext.js
del C:\tmp\mc-mvp3\Musicoin-client-linux-x64\config\config.ext.js

del C:\tmp\mc-mvp3\Musicoin-client-win-x64\build-all.bat
del C:\tmp\mc-mvp3\Musicoin-client-osx-x64\Musicoin-client.app\Contents\Resources\app.nw\build-all.bat
del C:\tmp\mc-mvp3\Musicoin-client-linux-x64\build-all.bat

RD /S /Q C:\tmp\mc-mvp3\Musicoin-client-win-x64\.git
RD /S /Q C:\tmp\mc-mvp3\Musicoin-client-osx-x64\Musicoin-client.app\Contents\Resources\app.nw\.git
RD /S /Q C:\tmp\mc-mvp3\Musicoin-client-linux-x64\.git

RD /S /Q C:\tmp\mc-mvp3\Musicoin-client-win-x64\.idea
RD /S /Q C:\tmp\mc-mvp3\Musicoin-client-osx-x64\Musicoin-client.app\Contents\Resources\app.nw\.idea
RD /S /Q C:\tmp\mc-mvp3\Musicoin-client-linux-x64\.idea

del C:\tmp\mc-mvp3\Musicoin-client-win-x64\log.txt
del C:\tmp\mc-mvp3\Musicoin-client-osx-x64\Musicoin-client.app\Contents\Resources\app.nw\log.txt
del C:\tmp\mc-mvp3\Musicoin-client-linux-x64\log.txt

del C:\tmp\mc-mvp3\Musicoin-client-win-x64\client.txt
del C:\tmp\mc-mvp3\Musicoin-client-osx-x64\Musicoin-client.app\Contents\Resources\app.nw\client.txt
del C:\tmp\mc-mvp3\Musicoin-client-linux-x64\client.txt

REM OSX and Windows do not need the linux-setup.sh file
del C:\tmp\mc-mvp3\Musicoin-client-win-x64\linux-setup.sh
del C:\tmp\mc-mvp3\Musicoin-client-osx-x64\Musicoin-client.app\Contents\Resources\app.nw\linux-setup.sh
