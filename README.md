# Musicoin Wallet

The official Musicoin Desktop Wallet

[![GitHub release](https://img.shields.io/github/release/musicoin/desktop.svg?style=for-the-badge)](https://github.com/Musicoin/desktop/releases/latest)
[![license](https://img.shields.io/github/license/musicoin/desktop.svg?style=for-the-badge)](https://github.com/Musicoin/desktop/blob/master/LICENSE)
[![Github All Releases](https://img.shields.io/github/downloads/Musicoin/desktop/total.svg?style=for-the-badge)](https://github.com/Musicoin/desktop/releases)

## Nightly Builds

Nightly builds for all supported Operating Systems can be found over at [builder.musicoin.org](https://builder.musicoin.org/)

Supported Operating systems: 
1. Windows 7 and later - [64 bit](https://builder.musicoin.org/windows-x64.exe), [32bit](https://builder.musicoin.org/windows-x32.exe)
2. macOS - [64 bit](https://builder.musicoin.org/mac-x64.zip)
3. Linux - [64 bit](https://builder.musicoin.org/linux-x64.tar.xz), [32bit](https://builder.musicoin.org/linux-x32.tar.xz)
4. Windows XP and older - [32bit](https://builder.musicoin.org/windows-x32-legacy.exe), [64 bit](https://builder.musicoin.org/windows-x64-legacy.exe)

## Getting started
Prerequisites:
- node >=8.0.0
- yarn >=1.7.0
- optionally wine for windows builds on mac or linux

## Getting Started

1. `git clone https://github.com/Musicoin/desktop && cd desktop`
2. `yarn build`
3. `nw .`

## Packaging the app
1. `git clone https://github.com/Musicoin/desktop && cd desktop`
2. `yarn --link-duplicates`
3. `yarn debug` - This will run in SDK mode for development.
4. `yarn build-all`
      -or-
   `yarn build-x86`
      -or-
   `yarn build-x64`
   To build all of the packages, for windows, mac, and linux. This is meant for testing or development and releasing.
5. `yarn run build -m --x64 ./` - This will build for MacOS x64. -m, -l, or -w determine the os and kind of app.

## Testing new interface builds

This repo contains the UI modules in accordance with the last release version. To make changes, edit the files at `interface/` and issue a PR to the [desktop-interface]([desktop-interface](https://github.com/Musicoin/desktop-interface) repo. Please note that PRs towards interface changes will not be accepted on this repo.

## Contributing

Pull Requests and Bug Reports are most welcome.

The Wallet repo makes use of the following submodules:
1. [Default UI module](https://github.com/Musicoin/desktop-interface)
2. [`go-musicoin` npm package](https://github.com/Musicoin/gmc-node-modules)
3. [Web3 fork of musicoin](https://github.com/Musicoin/web3.js)

## Bounty program

Specific Issues are earmarked for bounty and carry a bounty label with them. More information regarding the bounty program can be found over at [BOUNTY](BOUNTY.md).
