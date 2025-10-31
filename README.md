# AgriPulse: A Decentralized Carbon Credit Marketplace

AgriPulse is a transparent carbon credit marketplace built on Hedera. We connect sustainable farmers directly with ESG-focused investors, solving the critical problems of trust, cost, and access in the traditional carbon market.

By using AI for verification and blockchain for transparency, we ensure every credit represents real, verifiable climate action.

---

### Core Features

-   **AI-Powered Verification (dMRV):** Google Gemini analyzes farm data for plausibility and quality, preventing fraud and ensuring credit integrity.
-   **Radical Transparency:** Every verification decision is immutably logged on the Hedera Consensus Service (HCS), creating a public, unchangeable audit trail.
-   **Instant & Fair Payments:** Hedera's Atomic Swaps enable direct, instant, and trustless transactions. Farmers receive 95% of every sale the moment a purchase is made.
-   **Engaging Rewards:** AI-generated artwork is used to create unique NFT certificates and badges, rewarding both farmers and investors for their participation.

---

## Quickstart Demo

Follow this three-step flow to experience the entire platform from end to end.

### Demo Credentials

-   **Admin:** `admin@admin.com` / `admin123`
-   **Farmer:** `farmer@farm.com` / `farmer123`
-   **Investor:** `inv@inv.com` / `investor123`

### The Flow in 3 Steps

**1. Admin: Initialize the Platform**
-   Log in as the **Admin**.
-   Go to the **Admin Dashboard** and click **Initialize Platform**.
-   This single action creates all necessary tokens, NFT collections, and the audit log on the Hedera Testnet.

**2. Farmer: Create the Supply**
-   Log in as the **Farmer**.
-   On the **My Farm** page, complete the one-time wallet setup.
-   Click **Register New Farm**, fill it with valid data (e.g., from the 'Golden Grain Oasis' in the demo docs), and submit. The AI will verify it, mint a Farm NFT, and list it on the marketplace.

**3. Investor: Purchase with Confidence**
-   Log in as the **Investor**.
-   On **My Dashboard**, complete the one-time wallet setup.
-   Go to the **Marketplace**, find the "Golden Grain Oasis" farm, and verify its history using the on-chain links.
-   Click **Purchase Credits**, enter an amount (e.g., 10), and confirm. An atomic swap instantly settles the transaction, and you receive your credits and an NFT certificate.

---

### Technology Stack

-   **Frontend:** React, TypeScript, TailwindCSS
-   **Blockchain:** Hedera Hashgraph (HTS, HCS)
-   **AI & Verification:** Google Gemini API
-   **Decentralized Storage:** IPFS (via Pinata)
