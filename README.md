
[![GitHub release](https://img.shields.io/github/release/musicoin/desktop.svg?style=for-the-badge)](https://github.com/Musicoin/desktop/releases/latest)
[![license](https://img.shields.io/github/license/musicoin/desktop.svg?style=for-the-badge)](https://github.com/Musicoin/desktop/blob/master/LICENSE)
[![GitHub Release Date](https://img.shields.io/github/release-date/Musicoin/desktop.svg?style=for-the-badge)](https://github.com/Musicoin/desktop/releases) 
[![Github All Releases](https://img.shields.io/github/downloads/Musicoin/desktop/total.svg?style=for-the-badge)](https://github.com/Musicoin/desktop/releases) 
[![GitHub issues](https://img.shields.io/github/issues-raw/badges/shields.svg?style=for-the-badge)](https://github.com/Musicoin/desktop/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) 
![GitHub contributors](https://img.shields.io/github/contributors/Musicoin/desktop.svg?style=for-the-badge) 

---

# Musicoin Wallet 

The official Musicoin Desktop Wallet

## Nightly Builds

Nightly builds for all supported Operating Systems can be found over at [builder.musicoin.org](https://builder.musicoin.org/)

Supported Operating systems:
1. Windows 7 and later - [64 bit](https://builder.musicoin.org/windows-x64.exe), [32bit](https://builder.musicoin.org/windows-x32.exe)
2. macOS - [64 bit](https://builder.musicoin.org/mac-x64.zip)
3. Linux - [64 bit](https://builder.musicoin.org/linux-x64.tar.xz), [32bit](https://builder.musicoin.org/linux-x32.tar.xz)
4. Windows XP and older - [32bit](https://builder.musicoin.org/windows-x32-legacy.exe), [64 bit](https://builder.musicoin.org/windows-x64-legacy.exe)

## Getting started

Prerequisites: Node.js, npm

1. Install nwjs: `npm install nw`
2. `npm install`
3. `npm install bower`
4. `npm run build:gmc`
3. `nw .`

## Creating an executable/dmg/binary for your platform

1. Install nwjs-builder: `npm install nwjs-builder -g`
2. Package the app: `nwb nwbuild -v 0.27.4 -p <win64,osx64,linux64> -o <build_directory>`
3. Download [go-musicoin](https://github.com/Musicoin/go-musicoin/releases) and place in `build/gmc/` inside the built package   
(on MacOS place it in `Musicoin-wallet.app/Contents/Resources/app.nw/bin/gmc/` )
4. Run app

## Contributing

Pull Requests and Bug Reports for common issues via GitHub are most welcome.

## Bounty program

Specific Issues are earmarked for bounty and carry a bounty label with them. More information regarding the bounty program can be found over at [BOUNTY](BOUNTY.md).

## License

MIT
