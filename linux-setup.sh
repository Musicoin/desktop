#!/bin/bash
# add required package(s) for nwjs
SUDO=''
if (( $EUID != 0 )); then
    SUDO='sudo'
fi
$SUDO apt install libnss
# Change permissions to ensure that the app is executable
$SUDO chmod +x Musicoin-wallet
$SUDO chmod +x bin/gmc/gmc
$SUDO chmod +x bin/go-ipfs/ipfs
