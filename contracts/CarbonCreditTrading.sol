// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CarbonCreditTrading {

    // =========================================================
    // ADMIN & ISSUER MANAGEMENT
    // =========================================================

    address public admin;

    mapping(address => bool) public authorizedIssuers;


    // =========================================================
    // CREDIT STATUS
    // =========================================================

    enum CreditStatus {
        ACTIVE,
        LISTED,
        TRANSFERRED,
        RETIRED
    }


    // =========================================================
    // CARBON CREDIT
    // =========================================================

    struct CarbonCredit {
        uint256 creditId;
        string projectName;
        string projectType;
        string location;
        uint256 vintageYear;
        uint256 tonnesCO2e;
        address issuer;
        address owner;
        string metadataHash;
        CreditStatus status;
        uint256 createdAt;
        uint256 retiredAt;
        string retirementReason;
    }


    // =========================================================
    // MARKETPLACE LISTING
    // =========================================================

    struct Listing {
        uint256 creditId;
        address seller;
        uint256 price;
        bool active;
    }


    // =========================================================
    // PLATFORM STATISTICS
    // =========================================================

    uint256 public nextCreditId = 1;

    uint256 public totalCreditsIssued;

    uint256 public activeSupplyTonnes;

    uint256 public retiredSupplyTonnes;

    uint256 public totalTradingVolume;


    // =========================================================
    // STORAGE
    // =========================================================

    mapping(uint256 => CarbonCredit) private credits;

    mapping(uint256 => Listing) public listings;

    mapping(address => uint256[]) private ownerCredits;


    // =========================================================
    // REENTRANCY PROTECTION
    // =========================================================

    bool private locked;


    // =========================================================
    // EVENTS
    // =========================================================

    event IssuerRegistered(
        address indexed issuer
    );

    event IssuerRemoved(
        address indexed issuer
    );

    event CreditIssued(
        uint256 indexed creditId,
        address indexed issuer,
        address indexed owner,
        uint256 tonnesCO2e
    );

    event CreditListed(
        uint256 indexed creditId,
        address indexed seller,
        uint256 price
    );

    event ListingCancelled(
        uint256 indexed creditId,
        address indexed seller
    );

    event CreditPurchased(
        uint256 indexed creditId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    event CreditTransferred(
        uint256 indexed creditId,
        address indexed from,
        address indexed to
    );

    event CreditRetired(
        uint256 indexed creditId,
        address indexed owner,
        uint256 tonnesCO2e,
        string reason,
        uint256 timestamp
    );


    // =========================================================
    // MODIFIERS
    // =========================================================

    modifier onlyAdmin() {
        require(
            msg.sender == admin,
            "Only admin"
        );
        _;
    }


    modifier onlyIssuer() {
        require(
            authorizedIssuers[msg.sender],
            "Not authorized issuer"
        );
        _;
    }


    modifier exists(uint256 creditId) {
        require(
            creditId > 0 &&
            creditId < nextCreditId,
            "Credit does not exist"
        );
        _;
    }


    modifier onlyOwner(uint256 creditId) {
        require(
            credits[creditId].owner == msg.sender,
            "Not credit owner"
        );
        _;
    }


    modifier nonReentrant() {
        require(
            !locked,
            "Reentrancy detected"
        );

        locked = true;

        _;

        locked = false;
    }


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    constructor() {
        admin = msg.sender;

        authorizedIssuers[msg.sender] = true;

        emit IssuerRegistered(msg.sender);
    }


    // =========================================================
    // ISSUER MANAGEMENT
    // =========================================================

    function registerIssuer(
        address issuer
    )
        external
        onlyAdmin
    {
        require(
            issuer != address(0),
            "Invalid issuer"
        );

        require(
            !authorizedIssuers[issuer],
            "Issuer already registered"
        );

        authorizedIssuers[issuer] = true;

        emit IssuerRegistered(issuer);
    }


    function removeIssuer(
        address issuer
    )
        external
        onlyAdmin
    {
        require(
            authorizedIssuers[issuer],
            "Issuer not registered"
        );

        authorizedIssuers[issuer] = false;

        emit IssuerRemoved(issuer);
    }


    // =========================================================
    // ISSUE CARBON CREDIT
    // =========================================================

    function issueCarbonCredit(
        string calldata projectName,
        string calldata projectType,
        string calldata location,
        uint256 vintageYear,
        uint256 tonnesCO2e,
        address owner,
        string calldata metadataHash
    )
        external
        onlyIssuer
        returns (uint256)
    {
        require(
            bytes(projectName).length > 0,
            "Project name required"
        );

        require(
            tonnesCO2e > 0,
            "Tonnes must be greater than zero"
        );

        require(
            owner != address(0),
            "Invalid owner"
        );

        require(
            vintageYear >= 2000 &&
            vintageYear <= 2100,
            "Invalid vintage year"
        );

        uint256 creditId = nextCreditId;

        CarbonCredit storage credit = credits[creditId];

        credit.creditId = creditId;

        credit.projectName = projectName;

        credit.projectType = projectType;

        credit.location = location;

        credit.vintageYear = vintageYear;

        credit.tonnesCO2e = tonnesCO2e;

        credit.issuer = msg.sender;

        credit.owner = owner;

        credit.metadataHash = metadataHash;

        credit.status = CreditStatus.ACTIVE;

        credit.createdAt = block.timestamp;

        ownerCredits[owner].push(creditId);

        nextCreditId++;

        totalCreditsIssued++;

        activeSupplyTonnes += tonnesCO2e;

        emit CreditIssued(
            creditId,
            msg.sender,
            owner,
            tonnesCO2e
        );

        return creditId;
    }


    // =========================================================
    // GET CREDIT DETAILS
    // =========================================================

    function getCreditDetails(
        uint256 creditId
    )
        external
        view
        exists(creditId)
        returns (CarbonCredit memory)
    {
        return credits[creditId];
    }


    // =========================================================
    // GET CREDIT STATUS
    // =========================================================

    function getCreditStatus(
        uint256 creditId
    )
        external
        view
        exists(creditId)
        returns (string memory)
    {
        CreditStatus status = credits[creditId].status;

        if (status == CreditStatus.ACTIVE) {
            return "ACTIVE";
        }

        if (status == CreditStatus.LISTED) {
            return "LISTED";
        }

        if (status == CreditStatus.TRANSFERRED) {
            return "TRANSFERRED";
        }

        if (status == CreditStatus.RETIRED) {
            return "RETIRED";
        }

        return "UNKNOWN";
    }


    // =========================================================
    // CHECK OWNERSHIP
    // =========================================================

    function isCreditOwner(
        address owner,
        uint256 creditId
    )
        external
        view
        exists(creditId)
        returns (bool)
    {
        return credits[creditId].owner == owner;
    }


    // =========================================================
    // LIST CREDIT
    // =========================================================

    function listCreditForSale(
        uint256 creditId,
        uint256 price
    )
        external
        exists(creditId)
        onlyOwner(creditId)
    {
        CarbonCredit storage credit = credits[creditId];

        require(
            credit.status != CreditStatus.RETIRED,
            "Retired credit cannot be listed"
        );

        require(
            credit.status != CreditStatus.LISTED,
            "Already listed"
        );

        require(
            price > 0,
            "Price must be greater than zero"
        );

        listings[creditId] = Listing(
            creditId,
            msg.sender,
            price,
            true
        );

        credit.status = CreditStatus.LISTED;

        emit CreditListed(
            creditId,
            msg.sender,
            price
        );
    }


    // =========================================================
    // GET LISTING
    // =========================================================

    function getListing(
        uint256 creditId
    )
        external
        view
        exists(creditId)
        returns (
            uint256,
            address,
            uint256,
            bool
        )
    {
        Listing memory listing = listings[creditId];

        return (
            listing.creditId,
            listing.seller,
            listing.price,
            listing.active
        );
    }


    // =========================================================
    // CANCEL LISTING
    // =========================================================

    function cancelListing(
        uint256 creditId
    )
        external
        exists(creditId)
    {
        Listing storage listing = listings[creditId];

        require(
            listing.active,
            "Listing not active"
        );

        require(
            listing.seller == msg.sender,
            "Not listing seller"
        );

        listing.active = false;

        credits[creditId].status = CreditStatus.ACTIVE;

        emit ListingCancelled(
            creditId,
            msg.sender
        );
    }


    // =========================================================
    // BUY CREDIT
    // =========================================================

    function buyCredit(
        uint256 creditId
    )
        external
        payable
        nonReentrant
        exists(creditId)
    {
        Listing memory listing = listings[creditId];

        require(
            listing.active,
            "Listing not active"
        );

        require(
            msg.sender != listing.seller,
            "Seller cannot buy own credit"
        );

        require(
            msg.value == listing.price,
            "Incorrect payment"
        );

        require(
            credits[creditId].status ==
            CreditStatus.LISTED,
            "Credit not listed"
        );

        // EFFECTS

        listings[creditId].active = false;

        credits[creditId].owner = msg.sender;

        credits[creditId].status =
            CreditStatus.TRANSFERRED;

        ownerCredits[msg.sender].push(creditId);

        _removeCreditFromOwner(
            listing.seller,
            creditId
        );

        totalTradingVolume += listing.price;

        // INTERACTION

        (bool success, ) =
            payable(listing.seller).call{
                value: listing.price
            }("");

        require(
            success,
            "Payment failed"
        );

        emit CreditPurchased(
            creditId,
            listing.seller,
            msg.sender,
            listing.price
        );
    }


    // =========================================================
    // DIRECT TRANSFER
    // =========================================================

    function transferCredit(
        uint256 creditId,
        address newOwner
    )
        external
        exists(creditId)
        onlyOwner(creditId)
    {
        require(
            newOwner != address(0),
            "Invalid new owner"
        );

        require(
            credits[creditId].status !=
            CreditStatus.RETIRED,
            "Retired credit cannot transfer"
        );

        require(
            credits[creditId].status !=
            CreditStatus.LISTED,
            "Cancel listing first"
        );

        address previousOwner =
            credits[creditId].owner;

        credits[creditId].owner = newOwner;

        credits[creditId].status =
            CreditStatus.TRANSFERRED;

        ownerCredits[newOwner].push(
            creditId
        );

        _removeCreditFromOwner(
            previousOwner,
            creditId
        );

        emit CreditTransferred(
            creditId,
            previousOwner,
            newOwner
        );
    }


    // =========================================================
    // RETIRE CREDIT
    // =========================================================

    function retireCredit(
        uint256 creditId,
        string calldata reason
    )
        external
        exists(creditId)
        onlyOwner(creditId)
    {
        CarbonCredit storage credit =
            credits[creditId];

        require(
            credit.status !=
            CreditStatus.RETIRED,
            "Credit already retired"
        );

        require(
            credit.status !=
            CreditStatus.LISTED,
            "Cancel listing first"
        );

        require(
            bytes(reason).length > 0,
            "Retirement reason required"
        );

        credit.status =
            CreditStatus.RETIRED;

        credit.retiredAt =
            block.timestamp;

        credit.retirementReason =
            reason;

        activeSupplyTonnes -=
            credit.tonnesCO2e;

        retiredSupplyTonnes +=
            credit.tonnesCO2e;

        emit CreditRetired(
            creditId,
            msg.sender,
            credit.tonnesCO2e,
            reason,
            block.timestamp
        );
    }


    // =========================================================
    // OWNER CREDITS
    // =========================================================

    function getOwnerCredits(
        address owner
    )
        external
        view
        returns (uint256[] memory)
    {
        return ownerCredits[owner];
    }


    // =========================================================
    // PLATFORM STATISTICS
    // =========================================================

    function getPlatformStats()
        external
        view
        returns (
            uint256 issued,
            uint256 activeTonnes,
            uint256 retiredTonnes,
            uint256 tradingVolume
        )
    {
        return (
            totalCreditsIssued,
            activeSupplyTonnes,
            retiredSupplyTonnes,
            totalTradingVolume
        );
    }


    // =========================================================
    // INTERNAL FUNCTION
    // =========================================================

    function _removeCreditFromOwner(
        address owner,
        uint256 creditId
    )
        internal
    {
        uint256[] storage ids =
            ownerCredits[owner];

        uint256 length = ids.length;

        for (
            uint256 i = 0;
            i < length;
            i++
        ) {
            if (ids[i] == creditId) {

                ids[i] =
                    ids[length - 1];

                ids.pop();

                return;
            }
        }
    }
}