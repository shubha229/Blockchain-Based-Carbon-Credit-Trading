# 🌱 CarbonX — Blockchain-Based Carbon Credit Trading Platform

A decentralized blockchain application for **issuing, verifying, transferring, trading, and retiring carbon credits** using smart contracts.

CarbonX creates a transparent and tamper-resistant lifecycle for digital carbon credits. Authorized issuers can create credits, owners can list and transfer them, buyers can purchase active listings, and owners can permanently retire credits on-chain.

> ⚠️ **Disclaimer:**
> This project uses simulated carbon-credit data for educational and demonstration purposes. The credits represented by this application are not officially verified or certified carbon offsets.

---

# 🚀 Project Highlights

* 🔗 Blockchain-based carbon credit management
* 🏭 Authorized issuer-controlled credit issuance
* 🔍 On-chain carbon credit verification
* 🏪 Decentralized carbon credit marketplace
* 💰 Buy and sell carbon credits using ETH
* 🔄 Transfer carbon credit ownership between wallets
* ❌ Cancel active marketplace listings
* ♻️ Permanently retire carbon credits
* 🔒 Prevent retired credits from being transferred
* 🔒 Prevent retired credits from being listed
* 👑 Admin-controlled issuer management
* 🦊 MetaMask wallet integration
* ⛓️ Smart-contract-based transaction processing
* 📊 Complete credit lifecycle tracking

---

# ✨ Features

## 👤 Wallet & Web3

* Connect wallet using MetaMask
* Display connected wallet address
* Switch between local blockchain accounts
* Detect user roles
* Display administrator and authorized issuer status
* Submit blockchain transactions through MetaMask
* Display transaction status and feedback

---

## 👑 Admin Management

The administrator can manage authorized issuers.

### Admin Features

* View administrator wallet
* Register authorized issuer
* Remove authorized issuer
* Manage issuer permissions
* Restrict administrative functions to the administrator

---

## 🏭 Issue Carbon Credit

Only authorized issuers can create verified digital carbon credits.

### Credit Information

| Field               | Description                       |
| ------------------- | --------------------------------- |
| Credit ID           | Unique credit identifier          |
| Project Name        | Name of the carbon project        |
| Project Type        | Type/category of project          |
| Location            | Project location                  |
| Vintage Year        | Year associated with the credit   |
| Tonnes CO₂e         | Carbon reduction/removal quantity |
| Owner/Seller Wallet | Current owner wallet              |
| Issuer Wallet       | Authorized issuer wallet          |
| Metadata Hash       | Metadata/IPFS reference           |

### Example

```text
Project Name    : Solar Energy
Project Type    : Renewable Energy
Location        : Bengaluru
Vintage Year    : 2025
Tonnes CO₂e     : 100
Owner           : Wallet Address
```

---

# 🔍 Check Carbon Credit

Users can verify a carbon credit using its **Credit ID**.

The application displays:

* Credit ID
* Project Name
* Project Type
* Location
* Vintage Year
* Tonnes CO₂e
* Issuer
* Current Owner
* Credit Status

All information is retrieved from the deployed smart contract.

---

# 🏪 Carbon Credit Marketplace

Credit owners can list their credits for sale.

### Listing Features

* Select owned Credit ID
* Set price in ETH
* Create marketplace listing
* View listing information
* Check listing status
* Cancel active listing
* Buy Carbon Credit

Buyers can purchase an active carbon credit listing.

---

# 💰 Purchase Flow

```text
Buyer
  ↓
Enter Credit ID
  ↓
Check Listing
  ↓
Buy Credit
  ↓
MetaMask Confirmation
  ↓
Smart Contract
  ↓
Ownership Updated
  ↓
Listing Becomes Inactive
```

---

# ❌ Cancel Listing Flow

Only the current seller can cancel an active marketplace listing.

```text
Seller
  ↓
Enter Credit ID
  ↓
Cancel Listing
  ↓
MetaMask Confirmation
  ↓
Blockchain Transaction
  ↓
Listing Becomes Inactive
```

---

# ♻️ Retire Carbon Credit

A credit owner can permanently retire a carbon credit.

The user provides:

* Credit ID
* Retirement Reason

### Example

```text
Credit ID: 1
Retirement Reason: Corporate Sustainability
```

After successful retirement, the credit enters a permanent retired state.

---

# 🔒 Retired Credit Protection

Retired credits cannot return to the normal trading lifecycle.

```text
Retired Credit
      │
      ├── ❌ Transfer
      │
      ├── ❌ Listing
      │
      └── ❌ Re-retirement
```

This prevents reuse of retired credits within the application's lifecycle.

---

# 🔄 Carbon Credit Lifecycle

```text
                    ┌──────────────┐
                    │    ISSUE     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    ACTIVE    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
           LISTING      TRANSFER      RETIRE
              │            │            │
              ▼            ▼            ▼
             BUY        NEW OWNER     RETIRED
              │                         │
              ▼                         │
          NEW OWNER                     │
              │                         │
              └──────────┐              │
                         ▼              │
                       RETIRE ◄─────────┘
```

---

# 🏗️ System Architecture

```text
                     ┌──────────────────────────┐
                     │       CarbonX UI         │
                     │      React + Vite        │
                     └────────────┬─────────────┘
                                  │
                                  │ Ethers.js
                                  ▼
                     ┌──────────────────────────┐
                     │        MetaMask          │
                     │   Wallet & Transactions  │
                     └────────────┬─────────────┘
                                  │
                                  │ RPC
                                  ▼
              ┌────────────────────────────────────┐
              │     CarbonCreditTrading.sol        │
              │                                    │
              │  • Admin Management                │
              │  • Issuer Authorization            │
              │  • Credit Issuance                 │
              │  • Credit Verification             │
              │  • Marketplace                     │
              │  • Buy Credit                      │
              │  • Cancel Listing                  │
              │  • Transfer Credit                 │
              │  • Retire Credit                   │
              │  • Retired Credit Protection       │
              └────────────────┬───────────────────┘
                               │
                               ▼
                     ┌───────────────────────┐
                     │    Hardhat Network    │
                     │    Local Blockchain   │
                     └───────────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* ⚛️ React
* ⚡ Vite
* JavaScript
* HTML
* CSS

## Blockchain

* Solidity
* Hardhat
* Ethereum-compatible blockchain
* Hardhat Local Network

## Web3

* Ethers.js
* MetaMask

## Development

* Node.js
* npm
* TypeScript
* Git
* GitHub
* Visual Studio Code

---

# 📁 Project Structure

```text
Blockchain-Carbon-Credit-Trading-Platform/
│
├── artifacts/
├── cache/
│
├── contracts/
│   └── CarbonCreditTrading.sol
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .gitignore
│   ├── .eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
│
├── scripts/
│   └── deploy.ts
|
├── .gitignore
├── hardhat.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

# 📌 Important Files

### `contracts/CarbonCreditTrading.sol`

Main Solidity smart contract containing:

* Admin management
* Issuer authorization
* Carbon credit issuance
* Credit ownership
* Marketplace listings
* Buying
* Listing cancellation
* Transfers
* Retirement
* Retired credit protection

### `scripts/deploy.ts`

Deployment script used to deploy the smart contract.

### `frontend/src/App.jsx`

Main React application containing:

* MetaMask connection
* Wallet handling
* Role detection
* Admin operations
* Issuer management
* Credit issuance
* Credit verification
* Marketplace operations
* Buying
* Transfer
* Retirement
* Listing cancellation
* Transaction handling

### `frontend/src/App.css`

Application-specific UI styling.

### `frontend/src/index.css`

Global CSS styling.

### `frontend/src/main.jsx`

React application entry point.

---

# 📊 Carbon Credit Data Model

| Field         | Description                       |
| ------------- | --------------------------------- |
| Credit ID     | Unique identifier                 |
| Project Name  | Carbon project name               |
| Project Type  | Project category                  |
| Location      | Project location                  |
| Vintage Year  | Credit vintage year               |
| Tonnes CO₂e   | Carbon reduction/removal quantity |
| Issuer        | Authorized issuer wallet          |
| Owner         | Current credit owner              |
| Metadata Hash | Metadata/IPFS reference           |
| Status        | Current credit lifecycle status   |

---

# 👥 User Roles

## 👑 Administrator

Responsible for:

* Managing authorized issuers
* Registering issuers
* Removing issuers
* Managing administrative permissions

## 🏭 Authorized Issuer

Responsible for:

* Issuing carbon credits
* Providing project information
* Assigning the initial owner

## 👤 Credit Owner

Can:

* View owned credits
* List credits
* Cancel listings
* Transfer credits
* Retire credits

## 💰 Buyer

Can:

* Check listings
* View seller and price
* Purchase active credits
* Become the new owner

---

# 🔐 Smart Contract Security

The smart contract enforces important rules directly on-chain.

### Access Control

Only the administrator can manage authorized issuers.

### Issuer Authorization

Only authorized issuers can issue carbon credits.

### Ownership Validation

Owner-specific operations require the correct wallet.

### Marketplace Validation

Only active listings can be purchased or cancelled.

### Retirement Protection

Retired credits cannot be transferred or listed.

### Blockchain Validation

Important state changes are executed through smart-contract transactions.

---

# 📸 Screenshots

1. CarbonX Dashboard
<img width="1600" height="799" alt="image" src="https://github.com/user-attachments/assets/5ef273ac-6c86-46a1-b6e7-e16d6a442c1b" />

2. Admin & Authorized Issuer Role
<img width="1600" height="800" alt="image" src="https://github.com/user-attachments/assets/08e49613-4d92-44f6-be48-7e7f26012072" />

3. Issue Carbon Credit
<img width="1600" height="806" alt="image" src="https://github.com/user-attachments/assets/4c839287-121d-430e-b663-e702584e7f37" />

4. Check Carbon Credit
<img width="1600" height="801" alt="image" src="https://github.com/user-attachments/assets/cd3150d1-a796-475c-bbed-be31fec3e95a" />

5. Sell / List Carbon Credit
<img width="1600" height="802" alt="image" src="https://github.com/user-attachments/assets/e9e194a1-998c-44da-960f-49217daa5ea0" />

6. Successful Purchase
<img width="1600" height="793" alt="image" src="https://github.com/user-attachments/assets/b722a0c8-cf1a-4ab4-bea5-51777849e481" />

7. Cancel Listing MetaMask Transaction
<img width="1600" height="764" alt="image" src="https://github.com/user-attachments/assets/441589c7-8af6-4558-852b-169102fe2f03" />

8. Transfer Carbon Credit - Successful Transfer
<img width="1600" height="805" alt="image" src="https://github.com/user-attachments/assets/9b651b6b-faf8-435e-98e8-4b735a4e6e82" />

9. Successful Retirement
<img width="1600" height="798" alt="image" src="https://github.com/user-attachments/assets/0d292357-d493-405d-93aa-dcc6b839ded6" />

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/shubha229/Blockchain-Carbon-Credit-Trading-Platform.git
```

## 2. Navigate to the Project

```bash
cd Blockchain-Carbon-Credit-Trading-Platform
```

## 3. Install Blockchain Dependencies

```bash
npm install
```

## 4. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

# 🔨 Compile Smart Contract

From the project root:

```bash
npx hardhat compile
```

Main contract:

```text
contracts/CarbonCreditTrading.sol
```

---

# ⛓️ Start Local Blockchain

Run:

```bash
npx hardhat node
```

Hardhat will provide local development accounts and private keys.

---

# 🚀 Deploy Smart Contract

Open another terminal in the project root:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the deployed contract address into the frontend configuration.

---

# 🦊 MetaMask Setup

Connect MetaMask to the local Hardhat network.

```text
Network Name : Hardhat Localhost
RPC URL      : http://127.0.0.1:8545
Chain ID     : 31337
Currency     : ETH
```

Import one of the Hardhat development accounts into MetaMask.

> ⚠️ **Never use real private keys or real funds for local testing.**

---

# 💻 Run Frontend

Navigate to the frontend:

```bash
cd frontend
```

Start the Vite development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 🧪 Testing

Run Hardhat tests:

```bash
npx hardhat test
```

### Important Scenarios

* Admin authorization
* Issuer registration
* Issuer removal
* Credit issuance
* Credit verification
* Credit listing
* Listing cancellation
* Credit purchase
* Ownership transfer
* Credit retirement
* Retired transfer prevention
* Retired listing prevention
* Access-control restrictions

---

# 🔄 Application Workflow

```text
                         ADMIN
                           │
                           ▼
                  Register Authorized
                       Issuer
                           │
                           ▼
                  AUTHORIZED ISSUER
                           │
                           ▼
                  Issue Carbon Credit
                           │
                           ▼
                      CREDIT ACTIVE
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
            LIST        TRANSFER      RETIRE
              │            │            │
              ▼            ▼            ▼
             BUY        NEW OWNER     RETIRED
              │                         │
              ▼                         ▼
          NEW OWNER              PERMANENT STATE
```

---

# 🌍 Real-World Relevance

Blockchain can provide a transparent digital record for environmental assets.

A production carbon-credit platform could potentially use blockchain for:

* Credit provenance
* Ownership tracking
* Marketplace transactions
* Transfer records
* Retirement records
* Audit trails
* Digital verification

CarbonX demonstrates these concepts using a local blockchain environment.

---

# ⚠️ Limitations

This project uses simulated carbon-credit information.

A blockchain record alone does not prove that a real-world project actually removed or avoided a specific amount of CO₂.

A production platform would require:

* Measurement
* Reporting
* Verification
* Independent auditing
* Approved methodologies
* Environmental project validation
* Regulatory compliance
* Real-world monitoring
* Integration with recognized carbon registries

> Therefore, **CarbonX should be considered an educational blockchain prototype, not a certified carbon-offset marketplace.**

---

# 🔮 Future Enhancements

* 📄 Carbon project document verification
* 📊 Marketplace analytics
* 📈 Carbon credit price history
* 🧾 Digital retirement certificates
* 📱 Improved mobile responsiveness
* 🔔 Real-time transaction notifications
* 📜 Complete transaction history
* 📍 Environmental project verification
* 🪪 QR-based credit verification

---

# 🎯 Learning Outcomes

Through this project, the following technologies and concepts were practically implemented:

* Solidity smart contracts
* Hardhat development
* React frontend development
* Vite
* Ethers.js
* MetaMask integration
* Web3 wallet interaction
* Blockchain transactions
* Smart-contract access control
* Ownership management
* Retirement mechanisms
* Blockchain validation
* Local blockchain development
* Git and GitHub

---

### Demonstration Flow

1. MetaMask Connection
2. Admin Management
3. Register Issuer
4. Issue Carbon Credit
5. Check Credit
6. List Credit
7. Check Listing
8. Buy Credit
9. Transfer Credit
10. Cancel Listing
11. Retire Credit
12. Prevent Retired Transfer
13. Prevent Retired Listing

---

# 📄 License

This project is created for **educational, academic, and demonstration purposes**.
