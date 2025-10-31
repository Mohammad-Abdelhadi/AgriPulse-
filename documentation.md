# AgriPulse: Demo Guide & Project Flow

This document provides a step-by-step guide for testing the AgriPulse platform, along with a detailed overview of the project's flow.

---

### **Demo Setup & Credentials**

Use the following pre-configured accounts to explore different user roles. All accounts are connected to the Hedera Testnet.

-   **Admin Role:**
    -   **Email:** `admin@admin.com`
    -   **Password:** `admin123`
-   **Investor Role:**
    -   **Email:** `inv@inv.com`
    -   **Password:** `investor123`
-   **Farmer Role:**
    -   **Email:** `farmer@farm.com`
    -   **Password:** `farmer123`

### **Farmer's Journey Test Scenarios**

Log in as the **Farmer** (`farmer@farm.com`) and navigate to the "My Farm" dashboard to test the registration and dMRV process.

**Scenario 1: Accepted Farm**

Use the following data to register a farm that is designed to be **approved** by the AI-powered dMRV system.

-   **Farm Name:** `Golden Grain Oasis`
-   **Location:** `Al-Mafraq Governorate`
-   **Land Area:** `45` (hectares)
-   **Agricultural Type:** `Wheat and Barley`
-   **My Farm’s Story:** `Nestled in the highlands of Al-Mafraq, this farm has passed through generations of growers dedicated to cereal production. Over time, new irrigation systems and soil health practices have transformed it into a model of sustainable dryland agriculture.`
-   **Practices:** Select `No-till`, `Reduced chemical fertilizer`, and `Efficient irrigation`.
-   **Certificate:** Upload any valid PDF document from your computer (e.g., any of the certificates from the `farm certifcates` folder). This is a required step for a high score.

**Scenario 2: Rejected Farm**

Use the following data to register a farm that is designed to be **rejected** by the AI due to low-quality, spam-like input.

-   **Farm Name:** `Aaaaaaaaa farm`
-   **Location:** `Aaaaaaaaa`
-   **Land Area:** `10` (hectares)
-   **Agricultural Type:** `Aaaaaaa`
-   **My Farm’s Story:** `Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
-   **Practices:** Select only one practice.
-   **Certificate:** Do not upload a certificate.

---

# AgriPulse: A Concise Project Flow

AgriPulse is a decentralized carbon credit marketplace on Hedera, connecting farmers and investors with full transparency.

**User Roles:**
-   **Admin:** Initializes the platform's on-chain assets.
-   **Farmer:** Registers farms to create carbon credit supply.
-   **Investor:** Buys and retires credits to offset emissions.

---

### **Phase 1: Platform Initialization (Admin)**

The Admin sets up the entire on-chain infrastructure from their dashboard.

1.  **Create HCS Topic:** An immutable audit log for all farm verifications is created on the Hedera Consensus Service (HCS).
2.  **Create Fungible Token:** The main carbon credit token (e.g., JCO2) is created. The total supply is held in the Admin's treasury account.
3.  **Create NFT Collections:** Three distinct NFT collections are created for:
    -   Farm Verification Certificates
    -   Farmer Achievement Badges
    -   Investor Impact Certificates

 <!-- Placeholder for screenshot -->

---

### **Phase 2: The Farmer's Journey (Creating Supply)**

Farmers tokenize their sustainable practices into verifiable assets.

1.  **Register Farm:** The farmer submits their farm's details, practices, and ownership documents.
2.  **AI-Powered Verification (dMRV):** Google's Gemini AI analyzes the data for plausibility and scores the farm's carbon sequestration potential.
3.  **On-Chain Audit:** The final verification score and report are permanently logged on the HCS topic.
4.  **Tokenization:** Upon approval:
    -   A unique **Farm NFT** is minted to the farmer as proof of verification.
    -   The corresponding carbon credits are minted to the platform treasury.
    -   The farm is listed on the public marketplace.

 <!-- Placeholder for screenshot -->

---

### **Phase 3: The Investor's Journey (Meeting Demand)**

Investors purchase credits with complete confidence and transparency.

1.  **Discover & Verify:** Investors browse the marketplace. They can click to view the immutable HCS audit trail for any farm directly on HashScan.
2.  **Purchase with Atomic Swap:** The investor buys credits. A single, instant Hedera transaction occurs:
    -   HBAR is sent from the Investor.
    -   ~95% of HBAR goes to the Farmer.
    -   ~5% of HBAR goes to the platform.
    -   Carbon credit tokens are sent from the treasury to the Investor.
3.  **Earn Achievement NFTs:** Significant purchases trigger the minting of unique, AI-generated NFTs for both the investor and the farmer.

 <!-- Placeholder for screenshot -->

---

### **Phase 4: Impact Realization (Retirement)**

Investors claim their environmental impact by permanently retiring credits.

1.  **Retire Credits:** From their dashboard, an investor selects an amount of credits to retire.
2.  **Permanent Burn:** This action triggers a `TokenWipeTransaction`, which permanently destroys the tokens from the investor's wallet. The transaction is recorded on-chain as a public proof of retirement.

 <!-- Placeholder for screenshot -->