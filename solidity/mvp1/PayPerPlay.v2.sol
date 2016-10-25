contract MusicoinLogger {
    event playEvent(address sender, uint plays);
    event licenseUpdateEvent(address sender, uint version);
    event transferEvent(address sender, address oldOwner, address newOwner);
    event resourceUpdateEvent(address sender, string oldResource, string newResource);
    event metadataUpdateEvent(address sender, string oldResource, string newResource);

    modifier noCoins {
        if (msg.value > 0) throw;
        _
    }

    function MusicCoinLogger() noCoins {

    }

    function logPlayEvent(uint plays) noCoins {
        playEvent(msg.sender, plays);
    }

    function logLicenseUpdateEvent(uint version) noCoins {
        licenseUpdateEvent(msg.sender, version);
    }

    function logTransferEvent(address oldOwner, address newOwner) noCoins {
        transferEvent(msg.sender, oldOwner, newOwner);
    }

    function logResourceUpdateEvent(string oldResource, string newResource) noCoins {
        resourceUpdateEvent(msg.sender, oldResource, newResource);
    }

    function logMetadataUpdateEvent(string oldMetadata, string newMetadata) noCoins {
        metadataUpdateEvent(msg.sender, oldMetadata, newMetadata);
    }

    function() {
        throw;
    }
}

// "0x22682a1302c7f6358ebe99e14e773ba67e6304b5", 100, "url", "{'test':123}", ["0x03", "0x02"], [20, 30]
//pragma solidity ^0.4.3;
contract PayPerPlay {
    string public constant contractVersion = "v0.2";

    address public owner;
    string public resourceUrl; // e.g. ipfs://<hash>
    string public metadata;

    // license information
    uint public coinsPerPlay;
    address[] public recipients;
    uint[] public shares;
    uint public totalShares;
    MusicoinLogger private logger;

    // book keeping
    mapping(address => uint) public pendingPayment;
    uint public playCount;
    uint public totalEarned;
    uint public licenseVersion;
    uint public metadataVersion;

    // events
    event playEvent(uint plays);
    event licenseUpdateEvent(uint version);
    event transferEvent(address oldOwner, address newOwner);
    event resourceUpdateEvent(string oldResource, string newResource);
    event metadataUpdateEvent(string oldMetadata, string newMetadata);

    function PayPerPlay(
            address _loggerAddress,
            uint _coinsPerPlay,
            string _resourceUrl,
            string _metadata,
            address[] _recipients,
            uint[] _shares) {
        logger = MusicoinLogger(_loggerAddress);
        owner = msg.sender;
        resourceUrl = _resourceUrl;
        metadata = _metadata;
        updateLicense(_coinsPerPlay, _recipients, _shares);
    }

    modifier adminOnly {
        if (msg.sender != owner) throw;
        if (msg.value > 0) throw;
        _
    }

    modifier noCoins {
        if (msg.value > 0) throw;
        _
    }

    function play() {
        if (msg.value < coinsPerPlay) throw;

        // users can only purchase one play at a time.  don't steal their money
        var toRefund = msg.value - coinsPerPlay;

        // I believe there is minimal risk in calling the sender directly, as it
        // should not be able to stall the contract for any other callers.
        if (toRefund > 0 && !msg.sender.send(toRefund)) {
            throw;
        }

        distributePayment(coinsPerPlay);
        totalEarned += coinsPerPlay;
        playCount++;

        playEvent(playCount);
        logger.logPlayEvent(playCount);
    }

    function collectPendingPayment() noCoins {
        var toSend = pendingPayment[msg.sender];
        pendingPayment[msg.sender] = 0;
        if (toSend > 0 && !msg.sender.send(toSend)) {
            // throw to ensure pendingPayment[msg.sender] is reverted
            throw;
        }
    }

    /*** Admin functions ***/

    function transferOwnership(address newOwner) adminOnly {
        address oldOwner = owner;
        owner = newOwner;
        transferEvent(oldOwner, newOwner);
        logger.logTransferEvent(oldOwner, newOwner);
    }

    function updateResourceUrl(string newResourceUrl) adminOnly {
        string memory oldResourceUrl = resourceUrl;
        resourceUrl = newResourceUrl;
        resourceUpdateEvent(oldResourceUrl, newResourceUrl);
        logger.logResourceUpdateEvent(oldResourceUrl, newResourceUrl);
    }

    function updateMetadata(string newMetadata) adminOnly {
        string memory oldMetadata = metadata;
        metadata = newMetadata;
        metadataVersion++;
        metadataUpdateEvent(oldMetadata, newMetadata);
        logger.logMetadataUpdateEvent(oldMetadata, newMetadata);
    }

    /*
     * Updates share allocations.  All old allocations are over written
     */
    function updateLicense(uint _coinsPerPlay, address[] _recipients, uint[] _shares) adminOnly {
        if (_recipients.length != _shares.length) throw;
        if (_recipients.length == 0) throw;

        coinsPerPlay = _coinsPerPlay;
        recipients = _recipients;
        shares = _shares;
        totalShares = 0;
        for (uint i=0; i < recipients.length; i++) {
            totalShares += shares[i];
        }

        // make sure there is at least one share
        if (totalShares == 0)
            throw;

        licenseVersion++;
        licenseUpdateEvent(licenseVersion);
        logger.logLicenseUpdateEvent(licenseVersion);
    }

    function distributeBalance() adminOnly {
        distributePayment(this.balance);
    }

    function kill(bool _distributeBalanceFirst) adminOnly {
        if (_distributeBalanceFirst) {
            distributeBalance(); // is there any risk here?
        }
        selfdestruct(owner);
    }

    /*** internal ***/
    bool private distributionReentryLock;
    modifier withDistributionLock {
        if (distributionReentryLock) throw;
        distributionReentryLock = true;
        _
        distributionReentryLock = false;
    }

    function distributePayment(uint _total) withDistributionLock internal {
        for (uint i=0; i < recipients.length; i++) {
            var amount = (shares[i] * _total) / totalShares;
            var recipient = recipients[i];

            if (amount > 0 && !recipient.send(amount)) {
                // don't throw, otherwise the contract can stall
                pendingPayment[recipient] += amount;
            }
        }
    }
}