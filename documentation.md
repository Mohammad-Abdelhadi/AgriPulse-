# AgriPulse: Project Features & Demo Guide

---

## 1. Key Project Features

AgriPulse is built on a foundation of trust and transparency, leveraging cutting-edge AI and distributed ledger technology.

-   **AI-Powered dMRV (Digital Monitoring, Reporting, and Verification):**
    Our platform uses Google's Gemini API to automate the farm verification process. It analyzes submitted data for plausibility, checks for consistency against agricultural logic, and even validates uploaded ownership certificates (PDFs). This eliminates the high costs and long delays of traditional certification, making the carbon market accessible to smallholder farmers for the first time.

-   **Radical Transparency with Hedera Consensus Service (HCS):**
    Every verification decision—whether approved or rejected—is recorded as an immutable message on the HCS. This creates a permanent, publicly auditable trail that anyone can check on a public ledger explorer like HashScan, directly solving the problem of "greenwashing" and building unparalleled trust.

-   **Instant Settlement via Atomic Swaps:**
    AgriPulse leverages Hedera's native atomic swaps to handle transactions. When an investor buys credits, a single, cryptographically secure transaction occurs instantly: the investor's HBAR is transferred, funds are automatically split (95% to the farmer, 5% to the platform), and the corresponding carbon credit tokens are delivered to the investor. This is trustless and eliminates payment delays.

-   **AI-Generated Achievement NFTs:**
    To enhance user engagement, Google's Gemini API generates unique, visually striking artwork for achievement NFTs. These are awarded on-chain to both farmers and investors for significant transactions, creating a gamified and rewarding experience that celebrates real-world impact.

---

## 2. Demo Walkthrough

### **Demo Credentials**

Use these pre-configured accounts. All are connected to the Hedera Testnet.

-   **Admin:** `admin@admin.com` / `admin123`
-   **Farmer:** `farmer@farm.com` / `farmer123`
-   **Investor:** `inv@inv.com` / `investor123`

---

### **Step 1: Admin - Initialize the Platform**

1.  **Log In as Admin.**
2.  Navigate to the **Admin Dashboard**.
3.  Click **Initialize Platform** and confirm. This single action creates all required on-chain assets: the fungible carbon credit token, the three NFT collections, and the HCS topic for the audit trail.

**Outcome:** The marketplace infrastructure is now live on the Hedera Testnet.

---

### **Step 2: Farmer - Create the Supply**

1.  **Log Out** and **Log In as Farmer.**
2.  Go to **My Farm** and complete the one-time **Step 1: Associate Wallet** setup.
3.  **Register a Valid Farm:**
    -   Click **Register New Farm**.
    -   Use the data for **"Golden Grain Oasis"** from `farm certifcates/farm-data.txt`.
    -   Upload the `Jordan_Farm_Certificate_1.pdf`.
    -   Click **Submit for Verification**. The AI-dMRV will approve it, mint a unique Farm NFT, and list it on the marketplace.
4.  **Register an Invalid Farm:**
    -   Register another farm using junk data (e.g., Name: `Junk Farm`, Story: `aaaaaaaa...`).
    -   The AI will reject it for low plausibility, demonstrating the anti-spam and quality control feature.

**Outcome:** A verified, tokenized carbon credit supply is now available on the marketplace.

---

### **Step 3: Investor - Purchase Credits & Verify**

1.  **Log Out** and **Log In as Investor.**
2.  Go to **My Dashboard** and click **Complete Account Setup** for the one-time wallet association.
3.  Navigate to the **Marketplace**.
4.  Find the **"Golden Grain Oasis"** farm and click **Purchase Credits**.
5.  Enter an amount (e.g., `10`) and confirm.
6.  **Verify the entire process on-chain:**
    -   Navigate to your **History** page via the profile dropdown.
    -   Review the "Credit Purchase" and "NFT Mint" transactions.
    -   Click the links to view the atomic swap and your new, AI-generated achievement NFT directly on HashScan.

**Outcome:** The purchase is completed instantly, funds are split, tokens are delivered, and the entire process is verifiable on the public ledger.