
contract MusicoinLogger {
    event playEvent(address sender, address indexed listener, string indexed playId, uint plays);
    event tipEvent(address sender, uint tipAmount, uint tipCount);
    event workReleasedEvent(address sender, address owner, string title, string artist);
    event licenseReleasedEvent(address sender, address work);
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

    function logPlayEvent(address listener, string playId, uint plays) noCoins {
        playEvent(msg.sender, listener, playId, plays);
    }

    function logTipEvent(uint tipAmount, uint tipCount) noCoins {
        tipEvent(msg.sender, tipAmount, tipCount);
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

    function logWorkReleased(address owner, string title, string artist) noCoins {
        workReleasedEvent(msg.sender, owner, title, artist);
    }

    function logLicenseReleased(address work) noCoins {
        licenseReleasedEvent(msg.sender, work);
    }

    function() {
        throw;
    }
}

// "0x5c3c1540dfcd795b0aca58a496e3c30fe2405b07", 2, "Title", "Artist", "imageUrl", "metadataUrl"
contract Work {
    //
    enum WorkType {score, lyrics, recording}

    MusicoinLogger public logger;
    WorkType public workType;
    string public title;
    string public artist;

    // reference to a complete set of metadata
    string public metadataUrl;
    string public imageUrl;

    function Work(
        address _loggerAddress,
        WorkType _workType,
        string _title,
        string _artist,
        string _imageUrl,
        string _metadataUrl) {
        logger = MusicoinLogger(_loggerAddress);
        workType = _workType;
        title = _title;
        artist = _artist;
        metadataUrl = _metadataUrl;
        imageUrl = _imageUrl;
        logger.logWorkReleased(msg.sender, _title, _artist);
    }
}

contract Playlist {
    MusicoinLogger public logger;
    address public owner;
    string public title;
    uint public weiPrice;
    string public imageUrl;

    mapping(address => bool) public hasPaid;
    string private playlistUrl;

    // bookeeping
    uint public purchaseCount = 0;

    function Playlist(
        address _loggerAddress,
        string _title,
        uint _weiPrice,
        string _imageUrl,
        string _playlistUrl) {
        logger = MusicoinLogger(_loggerAddress);
        title = _title;
        weiPrice = _weiPrice;
        playlistUrl = _playlistUrl;
        imageUrl = _imageUrl;
        owner = msg.sender;
        //logger.logPlaylistReleased(msg.sender, _title, _artist);
    }

    modifier noCoins {
        if (msg.value > 0) throw;
        _
    }

    modifier adminOnly {
        if (msg.sender != owner) throw;
        if (msg.value > 0) throw;
        _
    }

    function purchase() {
        if (hasPaid[msg.sender]) throw;
        if (msg.value < weiPrice) throw;

        hasPaid[msg.sender] = true;
        purchaseCount++;
        var toRefund = msg.value - weiPrice;

        // I believe there is minimal risk in calling the sender directly, as it
        // should not be able to stall the contract for any other callers.
        if (toRefund > 0 && !msg.sender.send(toRefund)) {
            throw;
        }
    }

    function getPlaylistUrl() constant noCoins returns (string) {
        if (msg.sender != owner && !hasPaid[msg.sender]) throw;
        return playlistUrl;
    }

    /*** Admin functions ***/

    function updatePlaylist(string newUrl) adminOnly {
        playlistUrl = newUrl;
    }

    function updatePrice(uint newPrice) adminOnly {
        weiPrice = newPrice;
    }

    function updateTitle(string newTitle) adminOnly {
        title = newTitle;
    }
}

contract ArtistProfile {
    address public owner;
    string public artistName;
    address public artistAddress;
    string public imageUrl;
    string public descriptionUrl;
    string public socialUrl;


    uint public tipCount = 0;
    uint public tipTotal = 0;

    modifier onlyOwner {
        if (msg.sender != owner) throw;
        _;
    }

    modifier noCoins {
        if (msg.value != 0) throw;
        _;
    }

    function ArtistProfile(
        address _owner,
        address _artistAddress,
        string _artistName,
        string _imageUrl,
        string _descriptionUrl,
        string _socialUrl) noCoins {
        owner = _owner;
        artistAddress = _artistAddress;
        artistName = _artistName;
        imageUrl = _imageUrl;
        descriptionUrl = _descriptionUrl;
        socialUrl = _socialUrl;
    }

    function tip() {
        tipCount++;
        tipTotal += msg.value;
        if (!owner.send(msg.value)) {
            throw;
        }
    }

    function setOwner(address _owner) onlyOwner noCoins {
        owner = _owner;
    }

    function setArtistAddress(address _artistAddress) onlyOwner noCoins {
        artistAddress = _artistAddress;
    }

    function updateDetails(
        string _artistName,
        string _imageUrl,
        string _descriptionUrl,
        string _socialUrl) onlyOwner noCoins {
        artistName = _artistName;
        imageUrl = _imageUrl;
        descriptionUrl = _descriptionUrl;
        socialUrl = _socialUrl;
    }

    function setArtistName(string _artistName) onlyOwner noCoins {
        artistName = _artistName;
    }

    function setImageUrl(string _imageUrl) onlyOwner noCoins {
        imageUrl = _imageUrl;
    }

    function setDescriptionUrl(string _descriptionUrl) onlyOwner noCoins {
        descriptionUrl = _descriptionUrl;
    }

    function setSocialUrl(string _socialUrl) onlyOwner noCoins {
        socialUrl = _socialUrl;
    }
}

// "0x5c3c1540dfcd795b0aca58a496e3c30fe2405b07", "0xe3632b9ab0571d2601e804dfddc65eb51ab19310", 1, "ipfs://audio", "ipfs://metadata", [], [], ["0x1234", "0x1235"], [1, 2]
contract PayPerPlay {
    string public constant contractVersion = "v0.2";

    address public owner;
    address public workAddress;
    string public resourceUrl; // e.g. ipfs://<hash>
    string public metadataUrl;

    // license information
    uint public weiPerPlay;

    // fixed payment royaly amounts
    address[] public royalties;
    uint[] public royaltyAmounts;

    // proportional payments (dependent on weiPerPlay or tip size)
    address[] public contributors;
    uint[] public contributorShares;
    uint public totalShares;

    // Global singleton logger, so we can watch Musicoin events easily
    MusicoinLogger private logger;

    // book keeping
    mapping(address => uint) public pendingPayment;
    uint public playCount;
    uint public totalEarned;
    uint public tipCount;
    uint public totalTipped;
    uint public licenseVersion;
    uint public metadataVersion;

    // events
    event playEvent(uint plays);
    event tipEvent(uint plays, uint tipCount);
    event licenseUpdateEvent(uint version);
    event transferEvent(address oldOwner, address newOwner);
    event resourceUpdateEvent(string oldResource, string newResource);
    event metadataUpdateEvent(string oldMetadata, string newMetadata);

    function PayPerPlay(
            address _loggerAddress,
            address _workAddress,
            uint _weiPerPlay,
            string _resourceUrl,
            string _metadataUrl,
            address[] _royalties,
            uint[] _royaltyAmounts,
            address[] _contributors,
            uint[] _contributorShares) {
        logger = MusicoinLogger(_loggerAddress);
        workAddress = _workAddress;
        owner = msg.sender;
        resourceUrl = _resourceUrl;
        metadataUrl = _metadataUrl;

        updateLicense(_weiPerPlay,
            _royalties, _royaltyAmounts,
            _contributors, _contributorShares);

        logger.logLicenseReleased(workAddress);
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

    function tip() {
        // fixed royalty payments are
        // (1) contractual obligations for a *play* event
        // (2) sized accodingly to a single play
        // Since a tip is not a play event, the contributors are not
        // obliged to pay any per-play royalty.  Also, since a tip could
        // be of an arbitrary amount, it may not even be possible to pay
        // the royalties (the tip may be for less).  Therefore, do not
        // include fixed royalty payments when receiving a tip.
        distributePayment(msg.value, false);

        tipCount++;
        totalTipped += msg.value;
        totalEarned += msg.value;

        tipEvent(msg.value, tipCount);
        logger.logTipEvent(msg.value, tipCount);
    }

    function getContributorsLength() public constant returns(uint) {
        return contributors.length;
    }

    function getRoyaltiesLength() public constant returns(uint) {
        return royalties.length;
    }

    function play(string playId) {
        if (msg.value < weiPerPlay) throw;

        // users can only purchase one play at a time.  don't steal their money
        var toRefund = msg.value - weiPerPlay;

        // I believe there is minimal risk in calling the sender directly, as it
        // should not be able to stall the contract for any other callers.
        if (toRefund > 0 && !msg.sender.send(toRefund)) {
            throw;
        }

        distributePayment(weiPerPlay, true);
        totalEarned += weiPerPlay;
        playCount++;

        playEvent(playCount);
        logger.logPlayEvent(msg.sender, playId, playCount);
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

    function updateMetadataUrl(string newMetadataUrl) adminOnly {
        string memory oldMetadataUrl = metadataUrl;
        metadataUrl = newMetadataUrl;
        metadataVersion++;
        metadataUpdateEvent(oldMetadataUrl, newMetadataUrl);
        logger.logMetadataUpdateEvent(oldMetadataUrl, newMetadataUrl);
    }

    /*
     * Updates share allocations.  All old allocations are over written
     */
    function updateLicense(uint _weiPerPlay,
        address[] _royalties, uint[] _royaltyAmounts,
        address[] _contributors, uint[] _contributorShares) adminOnly {

        if (_contributors.length != _contributorShares.length) throw;
        if (_royalties.length != _royaltyAmounts.length) throw;

        weiPerPlay = _weiPerPlay;
        contributors = _contributors;
        contributorShares = _contributorShares;
        royalties = _royalties;
        royaltyAmounts = _royaltyAmounts;
        totalShares = 0;

        for (uint c=0; c < contributors.length; c++) {
            totalShares += contributorShares[c];
        }

        uint totalRoyaltyAmounts = 0;
        for (uint r=0; r < royaltyAmounts.length; r++) {
            totalRoyaltyAmounts += royaltyAmounts[r];
        }

        // sanity checks

        // watch out for division by 0 if totalShares == 0
        if (totalShares == 0 && contributors.length > 0)
            throw;

        // can't payout more than we get per play
        if (totalRoyaltyAmounts > weiPerPlay)
            throw;

        licenseVersion++;
        licenseUpdateEvent(licenseVersion);
        logger.logLicenseUpdateEvent(licenseVersion);
    }

    function distributeBalance() adminOnly {
        distributePayment(this.balance, false);
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

    function distributePayment(uint _total, bool payRoyalties) withDistributionLock internal {

        // when distributing the balance of the contract, it might not make
        // sense to pay the per-play royalties
        if (payRoyalties) {
            // each royalty entry gets a fixed amount (defined in wei)
            for (uint r=0; r < royalties.length; r++) {
                var royaltyAmount = royaltyAmounts[r];
                var royaltyAddress = royalties[r];
                if (royaltyAmount > 0 && !royaltyAddress.send(royaltyAmount)) {
                    pendingPayment[royaltyAddress] += royaltyAmount;
                }

                // subtract from the _total left to distribute to contributors
                _total -= royaltyAmount;
            }
        }

        // after royalties have been paid, contributors divide the remainder
        for (uint c=0; c < contributors.length; c++) {
            var amount = (contributorShares[c] * _total) / totalShares;
            var contributorAddress = contributors[c];

            if (amount > 0 && !contributorAddress.send(amount)) {
                // don't throw, otherwise the contract can stall
                pendingPayment[contributorAddress] += amount;
            }
        }
    }
}