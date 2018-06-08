[![GitHub release](https://img.shields.io/github/release/musicoin/desktop.svg?style=for-the-badge)](https://github.com/Musicoin/desktop/releases/latest)
[![license](https://img.shields.io/github/license/musicoin/desktop.svg?style=for-the-badge)](https://github.com/Musicoin/desktop/blob/master/LICENSE)
[![Github All Releases](https://img.shields.io/github/downloads/Musicoin/desktop/total.svg?style=for-the-badge)](https://github.com/Musicoin/desktop/releases) 

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
Prerequisites: 
- node >=8.0.0
- yarn >=1.7.0
- optionally wine for windows builds on mac or linux

1. `git clone https://github.com/Musicoin/desktop && cd desktop`
2. `yarn --link-duplicates`
3. `yarn debug` - This will run in SDK mode for development.
4. `yarn build-all`
      -or-
   `yarn build-x86`
      -or-
   `yarn build-x64`
   To build all of the packages, for windows, mac, and linux. This is meant for teting or development and releasing.
5. `yarn run build -m --x64 ./` - This will build for MacOS x64. -m, -l, or -w determine the os and kind of app.

## Testing new interface builds

Open your package.json file in this repository after cloning, and find the line depending upon the interface private module. You can change this to another branch of the interface module; writing in `github:Musicoin/desktop-interface#dev` for the build on the `dev` branch; or `github:movingelectrons/desktop-interface` for an alternative repo entirely.

## Contributing

Pull Requests and Bug Reports for common issues via GitHub are most welcome.

The Wallet repo makes use of the following submodules:
1. UI module can be found at https://github.com/Musicoin/desktop-interface
2. `go-musicoin` npm package can be found at https://github.com/Musicoin/gmc-node-modules
3. For any web3 issues, checkout our web3 fork at https://github.com/Musicoin/web3.js

## Bounty program

Specific Issues are earmarked for bounty and carry a bounty label with them. More information regarding the bounty program can be found over at [BOUNTY](BOUNTY.md).
