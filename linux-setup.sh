#!/bin/bash
# add required package(s) for nwjs
SUDO=''
if (( $EUID != 0 )); then
    SUDO='sudo'
fi
$SUDO apt install libnss3
# Make sure several dependcies executable
$SUDO chmod +x Musicoin-client
$SUDO chmod +x bin/gmc/gmc
$SUDO chmod +x bin/go-ipfs/ipfs
