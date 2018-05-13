# Install node and gtk2.0 before
# Run as sudo
# Basic Setup Stuff
git clone https://github.com/Musicoin/desktop.git
cd desktop/
git clone https://github.com/Musicoin/go-musicoin
cd go-musicoin/
make gmc
cp build/bin/gmc ../
cd ..
rm -rf go-musicoin
mkdir -p bin/gmc
chmod +x gmc
cp gmc bin/gmc/
wget https://dist.ipfs.io/go-ipfs/v0.4.10/go-ipfs_v0.4.10_linux-amd64.tar.gz
tar -xvzf go-ipfs_v0.4.10_linux-amd64.tar.gz
cd go-ipfs_v0.4.10_linux-amd64
cp ipfs ../
cd ..
rm -rf go-ipfs_v0.4.10_linux-amd64*
mkdir bin/go-ipfs
chmod +X ipfs # A precaution really
cp ipfs bin/go-ipfs/

# Setup nw, the troublemaker
npm install
npm install -g bower
cd interfaces/
bower install
cd ..
npm install -g nw@0.20.0 # Version is important since 0.23 (as of updating this has a bug on macOS preventing us from using it)
nw .
