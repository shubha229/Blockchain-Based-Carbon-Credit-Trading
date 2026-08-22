import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

const CONTRACT_ADDRESS = "NEW_CONTRACT_ADDRESS";

/* =========================================================
   CONTRACT ABI
========================================================= */

const CONTRACT_ABI = [
  // =========================
  // ADMIN
  // =========================

  "function admin() view returns (address)",

  "function authorizedIssuers(address) view returns (bool)",

  "function registerIssuer(address issuer) external",

  "function removeIssuer(address issuer) external",

  // =========================
  // ISSUE CREDIT
  // =========================

  "function issueCarbonCredit(string projectName,string projectType,string location,uint256 vintageYear,uint256 tonnesCO2e,address owner,string metadataHash) external returns (uint256)",

  // =========================
  // CREDIT DETAILS
  // =========================

  "function getCreditDetails(uint256 creditId) view returns (tuple(uint256 creditId,string projectName,string projectType,string location,uint256 vintageYear,uint256 tonnesCO2e,address issuer,address owner,string metadataHash,uint8 status,uint256 createdAt,uint256 retiredAt,string retirementReason))",

  "function getCreditStatus(uint256 creditId) view returns (string)",

  "function isCreditOwner(address owner,uint256 creditId) view returns (bool)",

  // =========================
  // MARKETPLACE
  // =========================

  "function listCreditForSale(uint256 creditId,uint256 price) external",

  "function getListing(uint256 creditId) view returns (uint256 creditId,address seller,uint256 price,bool active)",

  "function cancelListing(uint256 creditId) external",

  "function buyCredit(uint256 creditId) external payable",

  // =========================
  // TRANSFER
  // =========================

  "function transferCredit(uint256 creditId,address newOwner) external",

  // =========================
  // RETIRE
  // =========================

  "function retireCredit(uint256 creditId,string reason) external",

  // =========================
  // OWNER
  // =========================

  "function getOwnerCredits(address owner) view returns (uint256[])",

  // =========================
  // STATISTICS
  // =========================

  "function getPlatformStats() view returns (uint256,uint256,uint256,uint256)",

  // =========================
  // PUBLIC VARIABLES
  // =========================

  "function nextCreditId() view returns (uint256)",

  "function totalCreditsIssued() view returns (uint256)",

  "function activeSupplyTonnes() view returns (uint256)",

  "function retiredSupplyTonnes() view returns (uint256)",

  "function totalTradingVolume() view returns (uint256)",
];

/* =========================================================
   APP
========================================================= */

function App() {
  // =========================
  // WALLET / ROLE STATE
  // =========================

  const [account, setAccount] = useState("");

  const [admin, setAdmin] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  const [isIssuer, setIsIssuer] = useState(false);

  const [ownerCredits, setOwnerCredits] = useState([]);

  // =========================
  // MARKETPLACE STATE
  // =========================

  const [creditId, setCreditId] = useState("");

  const [price, setPrice] = useState("");

  const [listing, setListing] = useState(null);

  const [creditDetails, setCreditDetails] = useState(null);

  // =========================
  // ISSUE CREDIT STATE
  // =========================

  const [projectName, setProjectName] = useState("");

  const [projectType, setProjectType] = useState("");

  const [location, setLocation] = useState("");

  const [vintageYear, setVintageYear] = useState("");

  const [tonnes, setTonnes] = useState("");

  const [ownerAddress, setOwnerAddress] = useState("");

  const [metadataHash, setMetadataHash] = useState("");

  // =========================
  // ADMIN STATE
  // =========================

  const [issuerAddress, setIssuerAddress] = useState("");

  // =========================
  // TRANSFER / RETIRE
  // =========================

  const [retireReason, setRetireReason] = useState("");

  const [transferAddress, setTransferAddress] = useState("");

  // =========================
  // STATUS
  // =========================

  const [message, setMessage] = useState("");

  /* =========================================================
     ALERT
  ========================================================= */

  function showAlert(text) {
    setMessage(text);
    window.alert(text);
  }

  /* =========================================================
     PROVIDER
  ========================================================= */

  function getProvider() {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    return new ethers.BrowserProvider(window.ethereum);
  }

  /* =========================================================
     CONTRACT
  ========================================================= */

  async function getContract(withSigner = true) {
    const provider = getProvider();

    if (withSigner) {
      const signer = await provider.getSigner();

      return new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
    }

    return new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );
  }

  /* =========================================================
     ERROR MESSAGE
  ========================================================= */

  function getErrorMessage(error, fallback) {
    return (
      error?.reason ||
      error?.shortMessage ||
      error?.info?.error?.message ||
      error?.message ||
      fallback
    );
  }

  /* =========================================================
     LOAD ROLES
  ========================================================= */

  async function loadRoles(walletAddress) {
    try {
      const contract = await getContract(false);

      const adminAddress = await contract.admin();

      const issuerStatus =
        await contract.authorizedIssuers(walletAddress);

      const ownedCredits =
        await contract.getOwnerCredits(walletAddress);

      setAdmin(adminAddress);

      setIsAdmin(
        adminAddress.toLowerCase() ===
          walletAddress.toLowerCase()
      );

      setIsIssuer(Boolean(issuerStatus));

      setOwnerCredits(
        ownedCredits.map((id) => id.toString())
      );

    } catch (error) {
      console.error("Load roles error:", error);

      setIsAdmin(false);
      setIsIssuer(false);
      setOwnerCredits([]);
    }
  }

  /* =========================================================
     CONNECT WALLET
  ========================================================= */

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        showAlert("❌ MetaMask is not installed.");
        return;
      }

      const accounts =
        await window.ethereum.request({
          method: "eth_requestAccounts",
        });

      if (!accounts.length) {
        return;
      }

      const wallet = accounts[0];

      setAccount(wallet);

      await loadRoles(wallet);

      showAlert("✅ Wallet connected successfully.");

    } catch (error) {
      console.error(error);

      showAlert(
        getErrorMessage(
          error,
          "❌ Wallet connection failed."
        )
      );
    }
  }

  /* =========================================================
     ACCOUNT CHANGE
  ========================================================= */

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (!accounts.length) {
        setAccount("");
        setIsAdmin(false);
        setIsIssuer(false);
        setOwnerCredits([]);
        setListing(null);
        setCreditDetails(null);
        return;
      }

      const wallet = accounts[0];

      setAccount(wallet);

      await loadRoles(wallet);

      // Clear old displayed data when wallet changes
      setListing(null);
      setCreditDetails(null);
      setMessage("");
    };

    window.ethereum.on(
      "accountsChanged",
      handleAccountsChanged
    );

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);

  /* =========================================================
     AUTO CONNECT
  ========================================================= */

  useEffect(() => {
    async function checkConnection() {
      try {
        if (!window.ethereum) return;

        const accounts =
          await window.ethereum.request({
            method: "eth_accounts",
          });

        if (accounts.length) {
          setAccount(accounts[0]);

          await loadRoles(accounts[0]);
        }

      } catch (error) {
        console.error(error);
      }
    }

    checkConnection();
  }, []);

  /* =========================================================
     ADMIN - REGISTER ISSUER
  ========================================================= */

  async function registerIssuer() {
    try {
      if (!isAdmin) {
        showAlert(
          "❌ Only admin can register an issuer."
        );
        return;
      }

      if (!issuerAddress) {
        showAlert(
          "⚠️ Enter issuer wallet address."
        );
        return;
      }

      if (!ethers.isAddress(issuerAddress)) {
        showAlert(
          "❌ Invalid wallet address."
        );
        return;
      }

      const contract = await getContract();

      showAlert(
        "⏳ Waiting for MetaMask confirmation..."
      );

      const tx =
        await contract.registerIssuer(
          issuerAddress
        );

      await tx.wait();

      showAlert(
        "✅ Issuer registered successfully."
      );

      setIssuerAddress("");

    } catch (error) {
      console.error(error);

      showAlert(
        getErrorMessage(
          error,
          "❌ Register issuer failed."
        )
      );
    }
  }

  /* =========================================================
     ADMIN - REMOVE ISSUER
  ========================================================= */

  async function removeIssuer() {
    try {
      if (!isAdmin) {
        showAlert(
          "❌ Only admin can remove an issuer."
        );
        return;
      }

      if (!issuerAddress) {
        showAlert(
          "⚠️ Enter issuer wallet address."
        );
        return;
      }

      if (!ethers.isAddress(issuerAddress)) {
        showAlert(
          "❌ Invalid wallet address."
        );
        return;
      }

      const contract = await getContract();

      showAlert(
        "⏳ Waiting for MetaMask confirmation..."
      );

      const tx =
        await contract.removeIssuer(
          issuerAddress
        );

      await tx.wait();

      showAlert(
        "✅ Issuer removed successfully."
      );

      setIssuerAddress("");

    } catch (error) {
      console.error(error);

      showAlert(
        getErrorMessage(
          error,
          "❌ Remove issuer failed."
        )
      );
    }
  }

  /* =========================================================
     ISSUER - ISSUE CREDIT
  ========================================================= */

  async function issueCredit() {
    try {
      if (!isIssuer) {
        showAlert(
          "❌ Only an authorized issuer can issue credits."
        );
        return;
      }

      if (
        !projectName ||
        !projectType ||
        !location ||
        !vintageYear ||
        !tonnes ||
        !ownerAddress
      ) {
        showAlert(
          "⚠️ Please fill all required credit details."
        );
        return;
      }

      if (!ethers.isAddress(ownerAddress)) {
        showAlert(
          "❌ Invalid owner wallet address."
        );
        return;
      }

      const year = Number(vintageYear);

      const tonneValue = Number(tonnes);

      if (
        !Number.isInteger(year) ||
        year < 2000 ||
        year > 2100
      ) {
        showAlert(
          "❌ Vintage year must be between 2000 and 2100."
        );
        return;
      }

      if (
        !Number.isInteger(tonneValue) ||
        tonneValue <= 0
      ) {
        showAlert(
          "❌ Tonnes CO₂e must be a positive integer."
        );
        return;
      }

      const contract = await getContract();

      showAlert(
        "⏳ Waiting for MetaMask confirmation..."
      );

      const tx =
        await contract.issueCarbonCredit(
          projectName,
          projectType,
          location,
          year,
          tonneValue,
          ownerAddress,
          metadataHash
        );

      await tx.wait();

      showAlert(
        "✅ Carbon credit issued successfully."
      );

      setProjectName("");
      setProjectType("");
      setLocation("");
      setVintageYear("");
      setTonnes("");
      setOwnerAddress("");
      setMetadataHash("");

      if (account) {
        await loadRoles(account);
      }

    } catch (error) {
      console.error(error);

      showAlert(
        getErrorMessage(
          error,
          "❌ Credit issuance failed."
        )
      );
    }
  }

  /* =========================================================
     CHECK CREDIT
  ========================================================= */

  async function checkCredit() {
    try {
      if (!creditId) {
        showAlert(
          "⚠️ Please enter Credit ID."
        );
        return;
      }

      setMessage(
        "🔍 Checking carbon credit..."
      );

      const contract =
        await getContract(false);

      const credit =
        await contract.getCreditDetails(
          BigInt(creditId)
        );

      const statusNames = [
        "ACTIVE",
        "LISTED",
        "TRANSFERRED",
        "RETIRED",
      ];

      const status =
        statusNames[
          Number(credit.status)
        ] || "UNKNOWN";

      setCreditDetails({
        creditId:
          credit.creditId.toString(),

        projectName:
          credit.projectName,

        projectType:
          credit.projectType,

        location:
          credit.location,

        vintageYear:
          credit.vintageYear.toString(),

        tonnes:
          credit.tonnesCO2e.toString(),

        issuer:
          credit.issuer,

        owner:
          credit.owner,

        metadataHash:
          credit.metadataHash,

        status:
          Number(credit.status),

        createdAt:
          credit.createdAt.toString(),

        retiredAt:
          credit.retiredAt.toString(),

        retirementReason:
          credit.retirementReason,
      });

      alert(
        `🌱 Carbon Credit #${credit.creditId}\n\n` +
        `Project Name: ${credit.projectName}\n` +
        `Project Type: ${credit.projectType}\n` +
        `Location: ${credit.location}\n` +
        `Vintage Year: ${credit.vintageYear}\n` +
        `Tonnes CO₂e: ${credit.tonnesCO2e}\n\n` +
        `Issuer:\n${credit.issuer}\n\n` +
        `Owner:\n${credit.owner}\n\n` +
        `Status: ${status}`
      );

      setMessage(
        `✅ Carbon credit #${credit.creditId} verified successfully.`
      );

    } catch (error) {
      console.error(
        "Check Credit Error:",
        error
      );

      setCreditDetails(null);

      showAlert(
        getErrorMessage(
          error,
          "❌ Unable to verify carbon credit."
        )
      );

      setMessage("");
    }
  }

  /* =========================================================
     CHECK LISTING
  ========================================================= */

  async function checkListing() {
    try {
      if (!creditId) {
        alert("⚠️ Please enter Credit ID.");
        return;
      }

      const contract = await getContract(false);

      const result = await contract.getListing(
        BigInt(creditId)
      );

      const returnedCreditId = result[0];
      const seller = result[1];
      const listingPrice = result[2];
      const active = Boolean(result[3]);

      console.log("Listing Data:", {
        creditId: returnedCreditId.toString(),
        seller,
        price: ethers.formatEther(listingPrice),
        active,
      });

      setListing({
        creditId: returnedCreditId.toString(),
        seller: seller,
        price: ethers.formatEther(listingPrice),
        active: active,
      });

      if (active) {
        alert(
          `✅ Credit #${returnedCreditId} is currently listed.\n\n` +
          `Seller: ${seller}\n` +
          `Price: ${ethers.formatEther(listingPrice)} ETH`
        );
      } else {
        alert(
          `ℹ️ Credit #${returnedCreditId} is not currently listed.`
        );
      }

      setMessage(
        "✅ Listing information loaded."
      );

    } catch (error) {
      console.error(
        "Get Listing Error:",
        error
      );

      setListing(null);

      alert(
        "❌ " +
          (
            error?.reason ||
            error?.shortMessage ||
            error?.info?.error?.message ||
            error?.message ||
            "Unable to load listing."
          )
      );

      setMessage("");
    }
  }

  /* =========================================================
     OWNER - LIST CREDIT
  ========================================================= */

  async function listCredit() {
    try {
      if (!creditId || !price) {
        showAlert(
          "⚠️ Enter Credit ID and price."
        );
        return;
      }

      if (
        !ownerCredits.includes(
          String(creditId)
        )
      ) {
        showAlert(
          "❌ You do not own this credit."
        );
        return;
      }

      let priceWei;

      try {
        priceWei =
          ethers.parseEther(price);
      } catch {
        showAlert(
          "❌ Enter a valid ETH price."
        );
        return;
      }

      if (priceWei <= 0n) {
        showAlert(
          "❌ Price must be greater than zero."
        );
        return;
      }

      const contract =
        await getContract();

      showAlert(
        "⏳ Waiting for MetaMask confirmation..."
      );

      const tx =
        await contract.listCreditForSale(
          BigInt(creditId),
          priceWei
        );

      await tx.wait();

      showAlert(
        "✅ Credit listed successfully."
      );

      await loadRoles(account);

    } catch (error) {
      console.error(error);

      showAlert(
        getErrorMessage(
          error,
          "❌ Listing failed."
        )
      );
    }
  }

  /* =========================================================
     BUY CREDIT
  ========================================================= */

  async function buyCredit() {
    try {
      if (!creditId) {
        showAlert(
          "⚠️ Enter Credit ID."
        );
        return;
      }

      const readContract =
        await getContract(false);

      const result =
        await readContract.getListing(
          BigInt(creditId)
        );

      const seller =
        result.seller ?? result[1];

      const listingPrice =
        result.price ?? result[2];

      const active =
        result.active ?? result[3];

      if (!active) {
        showAlert(
          "❌ This credit is not currently listed."
        );
        return;
      }

      if (
        seller.toLowerCase() ===
        account.toLowerCase()
      ) {
        showAlert(
          "❌ You cannot buy your own credit."
        );
        return;
      }

      showAlert(
        `💰 Credit price: ${ethers.formatEther(
          listingPrice
        )} ETH\n\nWaiting for MetaMask confirmation...`
      );

      const signerContract =
        await getContract(true);

      const tx =
        await signerContract.buyCredit(
          BigInt(creditId),
          {
            value: listingPrice,
          }
        );

      await tx.wait();

      showAlert(
        "✅ Credit purchased successfully."
      );

      await loadRoles(account);

      // Refresh listing
      try {
        await checkListing();
      } catch {
        // Ignore refresh error
      }

    } catch (error) {
      console.error(error);

      showAlert(
        getErrorMessage(
          error,
          "❌ Purchase failed."
        )
      );
    }
  }

  /* =========================================================
     OWNER - CANCEL LISTING
  ========================================================= */

  async function cancelListing() {
    try {
      if (!account) {
        showAlert("❌ Please connect your MetaMask wallet first.");
        return;
      }

      if (!creditId) {
        showAlert("⚠️ Please enter Credit ID.");
        return;
      }

      const id = BigInt(creditId);

      // Do not use getListing() to decide whether to send the
      // cancellation transaction. Solidity is the source of truth.
      const contract = await getContract(true);

      console.log("Cancel Listing Request:", {
        creditId: id.toString(),
        connectedAccount: account,
        contractAddress: CONTRACT_ADDRESS,
      });

      // Directly call the smart contract.
      // MetaMask will open for a valid seller/listing.
      const tx = await contract.cancelListing(id);

      showAlert(
        `⏳ Cancellation transaction submitted for Credit #${id.toString()}.\n\n` +
        "Please confirm the transaction in MetaMask."
      );

      await tx.wait();

      showAlert(
        `✅ Credit #${id.toString()} listing cancelled successfully.`
      );

      setListing(null);
      setMessage(
        `✅ Credit #${id.toString()} listing cancelled successfully.`
      );

      if (account) {
        await loadRoles(account);
      }

      // Refresh UI only after successful cancellation.
      try {
        const readContract = await getContract(false);
        const updated = await readContract.getListing(id);

        setListing({
          creditId: updated[0].toString(),
          seller: updated[1],
          price: ethers.formatEther(updated[2]),
          active: Boolean(updated[3]),
        });
      } catch (refreshError) {
        console.log(
          "Listing refresh after cancellation skipped:",
          refreshError
        );
        setListing(null);
      }

    } catch (error) {
      console.error("Cancel Listing Error:", error);

      const rawMessage =
        error?.reason ||
        error?.shortMessage ||
        error?.info?.error?.message ||
        error?.data?.message ||
        error?.message ||
        "Cancel listing failed.";

      let messageText = rawMessage;

      if (
        rawMessage.toLowerCase().includes("listing not active")
      ) {
        messageText =
          "❌ This listing is not active on the smart contract.";
      } else if (
        rawMessage.toLowerCase().includes("not listing seller") ||
        rawMessage.toLowerCase().includes("only seller")
      ) {
        messageText =
          "❌ Only the seller/owner of this listing can cancel it.";
      } else if (
        rawMessage.toLowerCase().includes("credit does not exist") ||
        rawMessage.toLowerCase().includes("credit not found") ||
        rawMessage.toLowerCase().includes("invalid credit")
      ) {
        messageText = `❌ Credit #${creditId} does not exist.`;
      } else if (
        rawMessage.toLowerCase().includes("user rejected") ||
        rawMessage.toLowerCase().includes("rejected")
      ) {
        messageText = "⚠️ Transaction rejected in MetaMask.";
      } else if (
        rawMessage.toLowerCase().includes("insufficient funds")
      ) {
        messageText = "❌ Insufficient ETH for transaction gas.";
      } else if (
        rawMessage.toLowerCase().includes("could not decode result data")
      ) {
        messageText =
          "❌ Contract response could not be decoded. Check that CONTRACT_ADDRESS and CONTRACT_ABI match the currently deployed Solidity contract.";
      }

      showAlert(messageText);
      setMessage("");
    }
  }

  /* =========================================================
     OWNER - TRANSFER
  ========================================================= */

  async function transferCredit() {
    try {
      if (!creditId || !transferAddress) {
        showAlert(
          "⚠️ Enter Credit ID and new owner address."
        );
        return;
      }

      if (
        !ethers.isAddress(
          transferAddress
        )
      ) {
        showAlert(
          "❌ Invalid new owner address."
        );
        return;
      }

      if (
        !ownerCredits.includes(
          String(creditId)
        )
      ) {
        showAlert(
          "❌ You do not own this credit."
        );
        return;
      }

      const contract =
        await getContract(true);

      showAlert(
        "⏳ Waiting for MetaMask confirmation..."
      );

      const tx =
        await contract.transferCredit(
          BigInt(creditId),
          transferAddress
        );

      await tx.wait();

      showAlert(
        "✅ Credit transferred successfully."
      );

      setTransferAddress("");

      await loadRoles(account);

    } catch (error) {
      console.error(error);

      showAlert(
        getErrorMessage(
          error,
          "❌ Transfer failed."
        )
      );
    }
  }

  /* =========================================================
     OWNER - RETIRE
  ========================================================= */

  async function retireCredit() {
    try {
      if (!creditId || !retireReason) {
        showAlert(
          "⚠️ Enter Credit ID and retirement reason."
        );
        return;
      }

      if (
        !ownerCredits.includes(
          String(creditId)
        )
      ) {
        showAlert(
          "❌ You do not own this credit."
        );
        return;
      }

      const contract =
        await getContract(true);

      showAlert(
        "⏳ Waiting for MetaMask confirmation..."
      );

      const tx =
        await contract.retireCredit(
          BigInt(creditId),
          retireReason
        );

      await tx.wait();

      showAlert(
        "✅ Carbon credit retired successfully."
      );

      setRetireReason("");

      await loadRoles(account);

    } catch (error) {
      console.error(error);

      showAlert(
        getErrorMessage(
          error,
          "❌ Retirement failed."
        )
      );
    }
  }

  /* =========================================================
     SHORT ADDRESS
  ========================================================= */

  function shortAddress(address) {
    if (!address) return "";

    return `${address.slice(
      0,
      6
    )}...${address.slice(-4)}`;
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar">

        <div className="logo">
          🌱 CarbonX
        </div>

        <button
          className="connect-btn"
          onClick={connectWallet}
        >
          {account
            ? shortAddress(account)
            : "Connect Wallet"}
        </button>

      </nav>

      <main>

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="hero">

          <div>

            <p className="tag">
              BLOCKCHAIN CARBON MARKETPLACE
            </p>

            <h1>
              Trade Carbon Credits
              <span>
                {" "}Transparently.
              </span>
            </h1>

            <p className="subtitle">
              Buy, sell, transfer and retire
              verified carbon credits using
              blockchain technology.
            </p>

            <div className="contract-box">

              <small>
                Smart Contract
              </small>

              <p>
                {CONTRACT_ADDRESS}
              </p>

              {account && (
                <>
                  <small>
                    Connected Wallet
                  </small>

                  <p>
                    {account}
                  </p>
                </>
              )}

            </div>

          </div>

          <div className="hero-card">

            <div className="eco-icon">
              🌍
            </div>

            <h3>
              Verified Carbon Market
            </h3>

            <p>
              Transparent transactions
              powered by smart contracts.
            </p>

          </div>

        </section>

        {/* ===================================================
            ROLE INFORMATION
        =================================================== */}

        {account && (

          <section className="card">

            <h2>
              👤 Your Role
            </h2>

            <p>
              Wallet:{" "}
              {shortAddress(account)}
            </p>

            <p>
              {isAdmin
                ? "👑 Admin + Authorized Issuer"
                : isIssuer
                ? "🏭 Authorized Issuer"
                : ownerCredits.length > 0
                ? "🌱 Credit Owner / Seller"
                : "💰 Marketplace User"}
            </p>

            {isAdmin && (
              <p>
                You have administrator privileges.
              </p>
            )}

          </section>

        )}

        {/* ===================================================
            ADMIN ONLY
        =================================================== */}

        {account && isAdmin && (

          <section className="card">

            <h2>
              👑 Admin Management
            </h2>

            <p>
              Only the contract administrator
              can manage authorized issuers.
            </p>

            <p>
              <strong>
                Admin:
              </strong>{" "}
              {admin}
            </p>

            <label>
              Issuer Wallet Address
            </label>

            <input
              type="text"
              placeholder="0x..."
              value={issuerAddress}
              onChange={(e) =>
                setIssuerAddress(
                  e.target.value
                )
              }
            />

            <div className="button-row">

              <button
                onClick={registerIssuer}
              >
                Register Issuer
              </button>

              <button
                className="danger-btn"
                onClick={removeIssuer}
              >
                Remove Issuer
              </button>

            </div>

          </section>

        )}

        {/* ===================================================
            ISSUER ONLY
        =================================================== */}

        {account && isIssuer && (

          <section className="card">

            <h2>
              🏭 Issue Carbon Credit
            </h2>

            <p>
              Only authorized issuers can
              create verified carbon credits.
            </p>

            <label>
              Project Name
            </label>

            <input
              type="text"
              placeholder="Example: Solar Farm Project"
              value={projectName}
              onChange={(e) =>
                setProjectName(
                  e.target.value
                )
              }
            />

            <label>
              Project Type
            </label>

            <input
              type="text"
              placeholder="Example: Renewable Energy"
              value={projectType}
              onChange={(e) =>
                setProjectType(
                  e.target.value
                )
              }
            />

            <label>
              Location
            </label>

            <input
              type="text"
              placeholder="Example: Bengaluru, India"
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
            />

            <label>
              Vintage Year
            </label>

            <input
              type="number"
              placeholder="Example: 2025"
              value={vintageYear}
              onChange={(e) =>
                setVintageYear(
                  e.target.value
                )
              }
            />

            <label>
              Tonnes CO₂e
            </label>

            <input
              type="number"
              step="1"
              min="1"
              placeholder="Example: 100"
              value={tonnes}
              onChange={(e) =>
                setTonnes(
                  e.target.value
                )
              }
            />

            <label>
              Owner / Seller Wallet
            </label>

            <input
              type="text"
              placeholder="0x..."
              value={ownerAddress}
              onChange={(e) =>
                setOwnerAddress(
                  e.target.value
                )
              }
            />

            <label>
              Metadata Hash
            </label>

            <input
              type="text"
              placeholder="IPFS CID / metadata hash"
              value={metadataHash}
              onChange={(e) =>
                setMetadataHash(
                  e.target.value
                )
              }
            />

            <button
              onClick={issueCredit}
            >
              Issue Carbon Credit
            </button>

          </section>

        )}

        {/* ===================================================
            MARKETPLACE
            EVERY CONNECTED USER
        =================================================== */}

        {account && (

          <section className="dashboard">

            {/* =================================================
                CHECK LISTING
            ================================================= */}

            <div className="card">

              <h2>
                🔎 Check Listing
              </h2>

              <p>
                View the current marketplace
                listing.
              </p>

              <label>
                Credit ID
              </label>

              <input
                type="number"
                min="1"
                placeholder="Example: 1"
                value={creditId}
                onChange={(e) =>
                  setCreditId(
                    e.target.value
                  )
                }
              />

              <button
                onClick={checkListing}
              >
                Get Listing
              </button>

              {listing && (

                <div className="listing-result">

                  <p>
                    <strong>
                      Credit ID:
                    </strong>{" "}
                    {listing.creditId}
                  </p>

                  <p>
                    <strong>
                      Seller:
                    </strong>
                    <br />
                    {listing.seller}
                  </p>

                  <p>
                    <strong>
                      Price:
                    </strong>{" "}
                    {listing.price} ETH
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    <span
                      className={
                        listing.active
                          ? "active"
                          : "inactive"
                      }
                    >
                      {listing.active
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </span>
                  </p>

                </div>

              )}

            </div>

            {/* =================================================
                BUY
            ================================================= */}

            <div className="card">

              <h2>
                💰 Buy Credit
              </h2>

              <p>
                Purchase an active
                carbon credit.
              </p>

              <label>
                Credit ID
              </label>

              <input
                type="number"
                min="1"
                placeholder="Example: 1"
                value={creditId}
                onChange={(e) =>
                  setCreditId(
                    e.target.value
                  )
                }
              />

              <button
                className="buy-btn"
                onClick={buyCredit}
              >
                Buy Credit
              </button>

            </div>

            {/* =================================================
                CHECK CREDIT
            ================================================= */}

            <div className="card">

              <h2>
                🔍 Check Credit
              </h2>

              <p>
                Verify that a carbon credit
                exists on-chain.
              </p>

              <label>
                Credit ID
              </label>

              <input
                type="number"
                min="1"
                placeholder="Example: 1"
                value={creditId}
                onChange={(e) =>
                  setCreditId(
                    e.target.value
                  )
                }
              />

              <button
                onClick={checkCredit}
              >
                Check Credit
              </button>

              {creditDetails && (

                <div className="listing-result">

                  <p>
                    <strong>
                      Credit ID:
                    </strong>{" "}
                    {creditDetails.creditId}
                  </p>

                  <p>
                    <strong>
                      Project:
                    </strong>{" "}
                    {creditDetails.projectName}
                  </p>

                  <p>
                    <strong>
                      Type:
                    </strong>{" "}
                    {creditDetails.projectType}
                  </p>

                  <p>
                    <strong>
                      Location:
                    </strong>{" "}
                    {creditDetails.location}
                  </p>

                  <p>
                    <strong>
                      Vintage:
                    </strong>{" "}
                    {creditDetails.vintageYear}
                  </p>

                  <p>
                    <strong>
                      Tonnes:
                    </strong>{" "}
                    {creditDetails.tonnes}
                  </p>

                  <p>
                    <strong>
                      Issuer:
                    </strong>
                    <br />
                    {creditDetails.issuer}
                  </p>

                  <p>
                    <strong>
                      Owner:
                    </strong>
                    <br />
                    {creditDetails.owner}
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    {
                      [
                        "ACTIVE",
                        "LISTED",
                        "TRANSFERRED",
                        "RETIRED",
                      ][
                        Number(
                          creditDetails.status
                        )
                      ] || "UNKNOWN"
                    }
                  </p>

                  {creditDetails.retirementReason && (
                    <p>
                      <strong>
                        Retirement Reason:
                      </strong>{" "}
                      {
                        creditDetails.retirementReason
                      }
                    </p>
                  )}

                </div>

              )}

            </div>

          </section>

        )}

        {/* ===================================================
            OWNER / SELLER ONLY
        =================================================== */}

        {account &&
          ownerCredits.length > 0 && (

          <section className="dashboard">

            {/* =================================================
                LIST
            ================================================= */}

            <div className="card">

              <h2>
                📋 Sell / List Credit
              </h2>

              <p>
                List one of your owned
                carbon credits.
              </p>

              <p>
                <strong>
                  Your Credit IDs:
                </strong>{" "}
                {ownerCredits.join(", ")}
              </p>

              <label>
                Credit ID
              </label>

              <input
                type="number"
                min="1"
                placeholder="Example: 1"
                value={creditId}
                onChange={(e) =>
                  setCreditId(
                    e.target.value
                  )
                }
              />

              <label>
                Price in ETH
              </label>

              <input
                type="number"
                min="0"
                step="0.0001"
                placeholder="Example: 0.01"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
              />

              <button
                onClick={listCredit}
              >
                List Credit
              </button>

            </div>

            {/* =================================================
                CANCEL
            ================================================= */}

            <div className="card">

              <h2>
                ❌ Cancel Listing
              </h2>

              <p>
                Cancel one of your active
                marketplace listings.
              </p>

              <label>
                Credit ID
              </label>

              <input
                type="number"
                min="1"
                placeholder="Example: 1"
                value={creditId}
                onChange={(e) =>
                  setCreditId(
                    e.target.value
                  )
                }
              />

              <button
                className="danger-btn"
                onClick={cancelListing}
              >
                Cancel Listing
              </button>

            </div>

            {/* =================================================
                TRANSFER
            ================================================= */}

            <div className="card">

              <h2>
                🔄 Transfer Credit
              </h2>

              <p>
                Transfer your carbon credit
                to another wallet.
              </p>

              <label>
                Credit ID
              </label>

              <input
                type="number"
                min="1"
                placeholder="Example: 1"
                value={creditId}
                onChange={(e) =>
                  setCreditId(
                    e.target.value
                  )
                }
              />

              <label>
                New Owner Wallet
              </label>

              <input
                type="text"
                placeholder="0x..."
                value={transferAddress}
                onChange={(e) =>
                  setTransferAddress(
                    e.target.value
                  )
                }
              />

              <button
                onClick={transferCredit}
              >
                Transfer Credit
              </button>

            </div>

            {/* =================================================
                RETIRE
            ================================================= */}

            <div className="card">

              <h2>
                ♻️ Retire Credit
              </h2>

              <p>
                Permanently retire one of
                your carbon credits.
              </p>

              <label>
                Credit ID
              </label>

              <input
                type="number"
                min="1"
                placeholder="Example: 1"
                value={creditId}
                onChange={(e) =>
                  setCreditId(
                    e.target.value
                  )
                }
              />

              <label>
                Retirement Reason
              </label>

              <input
                type="text"
                placeholder="Example: Corporate sustainability"
                value={retireReason}
                onChange={(e) =>
                  setRetireReason(
                    e.target.value
                  )
                }
              />

              <button
                onClick={retireCredit}
              >
                Retire Credit
              </button>

            </div>

          </section>

        )}

        {/* ===================================================
            STATUS
        =================================================== */}

        {message && (

          <div className="status">

            <strong>
              Status:
            </strong>{" "}

            {message}

          </div>

        )}

      </main>

      <footer>

        <p>
          CarbonX • Blockchain Carbon Credit
          Trading Platform
        </p>

        <p>
          Built with Solidity + Hardhat +
          React + Ethers
        </p>

      </footer>

    </div>
  );
}

export default App;
