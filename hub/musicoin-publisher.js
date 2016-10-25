function MusicoinPublisher(ipfsUtils, blockchain) {
  this.blockchain = blockchain;
  this.ipfsUtils = ipfsUtils;
}

MusicoinPublisher.prototype.releaseWork = function(releaseEvent) {
  var work = releaseEvent.work;
  var workReleaseRequest = {
    type: work.type,
    title: work.track,
    artist: work.artist,
    imageUrl: "",
    metadataUrl: ""
  };

  return Promise.all([
    this.ipfsUtils.add(work.imgFile),
    this.ipfsUtils.addString(JSON.stringify(work.metadata))
  ])
    .bind(this)
    .then(function (hashes) {
      workReleaseRequest.imageUrl = "ipfs://" + hashes[0];
      workReleaseRequest.metadataUrl = "ipfs://" + hashes[1];
      return this.blockchain.releaseWork(workReleaseRequest);
    })
    .then(function(contractAddress) {
      work.contract_address = contractAddress;
      return contractAddress;
    });
};

MusicoinPublisher.prototype.releaseLicense = function(releaseEvent) {
  var license = releaseEvent.license;
  var work = releaseEvent.work;
  var licenseReleaseRequest = {
    workAddress: work.address,
    coinsPerPlay: license.coinsPerPlay,
    resourceUrl: "",
    metadataUrl: "",
    royalties: license.royalties.map(function (r) {return r.address}),
    royaltyAmounts: license.royalties.map(function (r) {return r.amount}),
    contributors: license.contributors.map(function (r) {return r.address}),
    contributorShares: license.contributors.map(function (r) {return r.shares}),
  };

  return Promise.all([
    this.ipfsUtils.add(releaseEvent.audioFile),
    this.ipfsUtils.addString(JSON.stringify(license.metadata))
  ])
  .bind(this)
  .then(function(hashes) {
    licenseReleaseRequest.resourceUrl = "ipfs://" + hashes[0];
    licenseReleaseRequest.metadataUrl = "ipfs://" + hashes[1];
    return this.blockchain.releaseLicense(licenseReleaseRequest);
  })
  .then(function(contractAddress) {
    work.contract_address = contractAddress;
    return contractAddress;
  });
};

module.exports = MusicoinPublisher;