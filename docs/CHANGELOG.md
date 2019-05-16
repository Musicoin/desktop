# Musicoin Desktop Wallet 1.7

Changes in this version:

1. Brand New UI

2. Available in 11 languages - Chinese, Chinese (Traditional), German, English, Spanish (Arg), Spanish (Esp), French, Greek, Dutch, Portuguese, Russian and Turkish

3. Bug fixes

# Musicoin Desktop Wallet 1.0

### Sleek new UI:

1. An all new UI with a new quick access navbar, from where critical functionalities like signing messages, checking exchange balance, direct links to Musicoin's public forums along with an introduction section only on first start-up for guiding users new to how a wallet functions.

2. Unique profile picture assigned to each account in order to make identification easier.

3. Standalone Send Funds button so that you can send funds from any of your accoutns, with one click

4. Integrated Music Player - Access musicoin.org from within the wallet UI while it syncs and transfer coins easily, efficiently and without errors between the web and desktop wallets. You can also maximize/minimize the windows to enhance your music listening experience.

5. Clear indication when the wallet is in sync - No more worrying whether your tx made it through or not, the send funds button unlocks only when the wallet is within a few blocks of the chain

6. View your balance in btc, usd and MUSIC at the click of a button, thanks to a new clutter free design, which introduces jsut three columns showing you critical info.

7. Per account backups and import function

8. Create and import Paper wallets so that you don't lose your keys in case your disk storage and backups fail.

### Reduced weight:

Improved fast sync in complaince with go-ethereum has reduced the chain size to < 10 GB

### Improved synchronisation and security:

1. Previosuly, the list of bootstrap nodes was not loaded on start-up, now it does. Users on connecting to a new peer will save new bootstrap nodes in `bootnodes.json` automatically.

2. User also has ability to restore default smaller nodes list via menu (Advanced - Restore default nodes list)

3. In case your local time is incorrect, you would see notification, with suggestion to enable time synchronisation in your OS.

4. Displaying private keys and mnemonics don't store state providing good privacy

### Host of configurable options:

1. Select go-musicoin cache size from the new navbar at the top of the screen.

2. Restore the default list of enodes, if you prefer connecting to a set of trusted peers.

3. Sign and verify messages, all from within the wallet itself.

4. Create a wallet wiht an easy to remember mnemonic or choose the standard way of using a password.

5. Display the private key at the click of a button, forget your keys no more.

6. Mandatory backups of your key are taken at startup at a directory chosen by the user, no more worrying that you don't have a backup handy.

### Support for legacy operating systems:

1. Support for Windows versions older than 7 is now available at a configured legacy release branch (some features are restricted to master and won't be available on the legacy implementation)

## Bug fixes

1. General bug fixes due to issues encountered in earlier versions (wallet not launching on specific OSs, import problems on legacy versions) have all been solved.

2. Automated build environment at https://builder.musicoin.org to download releases directly along with SHA sums for verification.

In short, Musicoin Desktop Wallet 1.0 is a whole new rethink of the Wallet and is a short glimpse of the things to come as the Musicoin Community moves forward. Enjoy $MUSIC!

# Musicoin Desktop Wallet 0.8

MDW 0.8 comes with a host of new features, including

1. Automatic time sync with remote time server every five seconds: Local time is synced with the network time at 5 second intervals and a warning box pops up notifying the user of the same.

2. Backup Wallet Option: You now can export your UTC file with the click of a button

3. Improved Syncing: Bundled with go-musicoin 2.5.1, the client now syncs faster than ever.

4. UI changes: Basic elements have been moved around to give you the details you need.

You can now click on the Explorer icon to be redirected to explorer.musicoin.org to view the tx log on the chain.

## Upgrading

In order to upgrade to the new version of the Musicoin client, you could replace the application directory (the directory that has the executable). The chain keys are NOT contained within the folder, so there is no worry of having to worry about them getting deleted. However, you MUST backup your keys in order to prevent them from getting lost forever. The Wallet's "Backup Wallet" button is designed to show you where your keys lie.

## Finding Peers

Ideally, you shouldn't have issues finding peers with go-musicoin 2.5.1. However, if you still encounter issues, you can manually add them via the "Add Peers" button on the Wallet.
