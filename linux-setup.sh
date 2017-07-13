#!/bin/bash
# add required package for nwj
SUDO=''
if (( $EUID != 0 )); then
    SUDO='sudo'
fi
# Make the application executable
$SUDO apt install libnss3
# Make sure several dependcies executable
$SUDO chmod +x Musicoin-client
$SUDO chmod +x bin/gmc/gmc
$SUDO chmod +x bin/go-ipfs/ipfs
