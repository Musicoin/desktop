# Musicoin Wallet ![Version Info](https://img.shields.io/badge/version-1.0-61008A.svg?style=flat-square&colorA=FFD000&colorB=27053E&label=Musicoin-Wallet)

(This branch has been freezed towards [release-1.0](https://github.com/Musicoin/desktop/releases/tag/1.0). All future updates will be strictly on future release branches)

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
4. `cd interface/ ; bower install ; cd ..`
3. `nw .`

## Creating an executable/dmg/binary for your platform

1. Install nwjs-builder: `npm install nwjs-builder -g`
2. Package the app: `nwb nwbuild -v 0.27.4 -p <win64,osx64,linux64> -o <build_directory>`
3. Download [go-musicoin](https://github.com/Musicoin/go-musicoin/releases) and place in `build/gmc/` inside the built package
4. Run app

## Contributing

Pull Requests and Bug Reports for common issues via GitHub are most welcome.

## Bounty program

Specific Issues are earmarked for bounty and carry a bounty label with them. More information regarding the bounty program can be found over at [BOUNTY](BOUNTY.md).

## License

MIT
