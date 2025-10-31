# AgriPulse: Decentralized Carbon Credits

AgriPulse is a transparent carbon credit marketplace on Hedera, connecting sustainable farmers with investors using AI for verification and blockchain for trust.

---

### Core Features

-   **AI-Powered Verification (dMRV):** Google Gemini analyzes farm data for quality, preventing fraud and ensuring credit integrity.
-   **Radical Transparency:** Every verification is logged on the Hedera Consensus Service (HCS), creating a public, unchangeable audit trail.
-   **Instant & Fair Payments:** Hedera's Atomic Swaps enable direct, instant payments. Farmers receive 95% of every sale.
-   **Engaging Rewards:** AI generates unique NFT certificates and badges for farmers and investors.

---

## Quickstart Demo in 3 Steps

Experience the full platform flow with these pre-configured accounts.

**1. Admin: Initialize the Platform**
-   Log in as **Admin**:
    -   **Email:** `admin@admin.com`
    -   **Password:** `admin123`
-   Go to the **Admin Dashboard** and click **Initialize Platform**.
-   This creates all required tokens and contracts on the Hedera Testnet.

**2. Farmer: Create the Supply**
-   Log out and log in as **Farmer**:
    -   **Email:** `farmer@farm.com`
    -   **Password:** `farmer123`
-   Go to **My Farm** and complete the one-time wallet setup.
-   Click **Register New Farm**, fill in the details (use the `Golden Grain Oasis` data from the docs), and submit. Our AI will verify it and list it on the marketplace.

**3. Investor: Purchase with Confidence**
-   Log out and log in as **Investor**:
    -   **Email:** `inv@inv.com`
    -   **Password:** `investor123`
-   Go to **My Dashboard** and complete the one-time wallet setup.
-   In the **Marketplace**, find the new farm and click **Purchase Credits**.
-   An atomic swap instantly settles the transaction. You get credits and an NFT.

---

### Technology Stack

-   **Frontend:** React, TypeScript, TailwindCSS
-   **Blockchain:** Hedera Hashgraph (HTS, HCS)
-   **AI & Verification:** Google Gemini API
-   **Decentralized Storage:** IPFS (via Pinata)