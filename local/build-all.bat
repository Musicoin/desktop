@echo off

set /p version="Enter a version number: "

IF EXIST version.txt del /F version.txt
@echo %version% > version.txt

REM delete log files created during debugging before the copy
del log.txt
del client.txt

call nwb nwbuild  -v 0.20.2 --with-ffmpeg -p win32,win64,osx64,linux64,linux32 -o C:\tmp\pi-musicoin --side-by-side
REM call nwb nwbuild  -v 0.20.2 --with-ffmpeg -p linux32 -o C:\tmp\pi-musicoin --side-by-side

robocopy C:\tmp\pi-musicoin\dependencies\win64 C:\tmp\pi-musicoin\Musicoin-wallet-win-x64\bin /S
robocopy C:\tmp\pi-musicoin\dependencies\win32 C:\tmp\pi-musicoin\Musicoin-wallet-win-ia32\bin /S
robocopy C:\tmp\pi-musicoin\dependencies\osx64 C:\tmp\pi-musicoin\Musicoin-wallet-osx-x64\Musicoin-wallet.app\Contents\Resources\app.nw\bin /S
robocopy C:\tmp\pi-musicoin\dependencies\linux64 C:\tmp\pi-musicoin\Musicoin-wallet-linux-x64\bin /S
robocopy C:\tmp\pi-musicoin\dependencies\linux32 C:\tmp\pi-musicoin\Musicoin-wallet-linux-ia32\bin /S

REM Remove files we don't want but nwbuild will copy
del C:\tmp\pi-musicoin\Musicoin-wallet-win-x64\config\config.ext.js
del C:\tmp\pi-musicoin\Musicoin-wallet-win-ia32\config\config.ext.js
del C:\tmp\pi-musicoin\Musicoin-wallet-osx-x64\Musicoin-wallet.app\Contents\Resources\app.nw\config\config.ext.js
del C:\tmp\pi-musicoin\Musicoin-wallet-linux-x64\config\config.ext.js
del C:\tmp\pi-musicoin\Musicoin-wallet-linux-ia32\config\config.ext.js

RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-win-x64\local
RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-win-ia32\local
RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-osx-x64\Musicoin-wallet.app\Contents\Resources\app.nw\local
RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-linux-x64\local
RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-linux-ia32\local

RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-win-x64\.git
RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-win-ia32\.git
RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-osx-x64\Musicoin-wallet.app\Contents\Resources\app.nw\.git
RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-linux-x64\.git
RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-linux-ia32\.git

RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-win-x64\.idea
RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-win-ia32\.idea
RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-osx-x64\Musicoin-wallet.app\Contents\Resources\app.nw\.idea
RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-linux-x64\.idea
RD /S /Q C:\tmp\pi-musicoin\Musicoin-wallet-linux-ia32\.idea

REM OSX and Windows do not need the linux-setup.sh file
del C:\tmp\pi-musicoin\Musicoin-wallet-win-x64\linux-setup.sh
del C:\tmp\pi-musicoin\Musicoin-wallet-win-ia32\linux-setup.sh
del C:\tmp\pi-musicoin\Musicoin-wallet-osx-x64\Musicoin-wallet.app\Contents\Resources\app.nw\linux-setup.sh
