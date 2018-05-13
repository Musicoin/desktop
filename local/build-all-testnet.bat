@echo off

set /p version="Enter a version number: "

IF EXIST version.txt del /F version.txt
@echo %version% > version.txt

REM delete log files created during debugging before the copy
del log.txt
del client.txt

call nwb nwbuild  -v 0.17.4 --with-ffmpeg -p win32,win64,osx64,linux64 -o C:\tmp\pi-musicoin-test --side-by-side

robocopy C:\tmp\pi-musicoin-test\dependencies\win64 C:\tmp\pi-musicoin-test\Musicoin-wallet-win-x64\bin /S
robocopy C:\tmp\pi-musicoin-test\dependencies\win32 C:\tmp\pi-musicoin-test\Musicoin-wallet-win-ia32\bin /S
robocopy C:\tmp\pi-musicoin-test\dependencies\osx64 C:\tmp\pi-musicoin-test\Musicoin-wallet-osx-x64\Musicoin-wallet.app\Contents\Resources\app.nw\bin /S
robocopy C:\tmp\pi-musicoin-test\dependencies\linux64 C:\tmp\pi-musicoin-test\Musicoin-wallet-linux-x64\bin /S

REM Remove files we don't want but nwbuild will copy
del C:\tmp\pi-musicoin-test\Musicoin-wallet-win-x64\config\config.ext.js
del C:\tmp\pi-musicoin-test\Musicoin-wallet-win-ia32\config\config.ext.js
del C:\tmp\pi-musicoin-test\Musicoin-wallet-osx-x64\Musicoin-wallet.app\Contents\Resources\app.nw\config\config.ext.js
del C:\tmp\pi-musicoin-test\Musicoin-wallet-linux-x64\config\config.ext.js

del C:\tmp\pi-musicoin-test\Musicoin-wallet-win-x64\build-all-testnet.bat
del C:\tmp\pi-musicoin-test\Musicoin-wallet-win-ia32\build-all-testnet.bat
del C:\tmp\pi-musicoin-test\Musicoin-wallet-osx-x64\Musicoin-wallet.app\Contents\Resources\app.nw\build-all-testnet.bat
del C:\tmp\pi-musicoin-test\Musicoin-wallet-linux-x64\build-all-testnet.bat

RD /S /Q C:\tmp\pi-musicoin-test\Musicoin-wallet-win-x64\.git
RD /S /Q C:\tmp\pi-musicoin-test\Musicoin-wallet-win-ia32\.git
RD /S /Q C:\tmp\pi-musicoin-test\Musicoin-wallet-osx-x64\Musicoin-wallet.app\Contents\Resources\app.nw\.git
RD /S /Q C:\tmp\pi-musicoin-test\Musicoin-wallet-linux-x64\.git

RD /S /Q C:\tmp\pi-musicoin-test\Musicoin-wallet-win-x64\.idea
RD /S /Q C:\tmp\pi-musicoin-test\Musicoin-wallet-win-ia32\.idea
RD /S /Q C:\tmp\pi-musicoin-test\Musicoin-wallet-osx-x64\Musicoin-wallet.app\Contents\Resources\app.nw\.idea
RD /S /Q C:\tmp\pi-musicoin-test\Musicoin-wallet-linux-x64\.idea

REM OSX and Windows do not need the linux-setup.sh file
del C:\tmp\pi-musicoin-test\Musicoin-wallet-win-x64\linux-setup.sh
del C:\tmp\pi-musicoin-test\Musicoin-wallet-win-ia32\linux-setup.sh
del C:\tmp\pi-musicoin-test\Musicoin-wallet-osx-x64\Musicoin-wallet.app\Contents\Resources\app.nw\linux-setup.sh
