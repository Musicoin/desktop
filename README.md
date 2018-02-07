# Musicoin Wallet![Version Info](https://img.shields.io/badge/version-1.0-61008A.svg?style=flat-square&colorA=FFD000&colorB=27053E&label=Musicoin-Wallet)

The official Musicoin Desktop Wallet

## Nightly Builds

Nightly builds for all supported Operating Systems can be found over at [builder](https://builder.musicoin.org)

Supported Operating systems:
1. Windows 10 - 32, 64 bit
2. macOS - 64 bit
3. Linux - 32, 64 bit
4. Windows Legacy (XP, 7) - 32, 64 bit

## Getting started

Prerequisites: Node, npm
1. Install nwjs `npm install nw`
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

Specific Issues are ear marked for bounty and carry a bounty label with them. More information regarding the bounty program can be found over at [BOUNTY](BOUNTY.md).

## License

MIT
