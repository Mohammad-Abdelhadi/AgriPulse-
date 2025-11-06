# AgriPulse: A Decentralized Carbon Credit Marketplace

**AgriPulse** is a decentralized carbon credit marketplace built on the Hedera network, designed to create a transparent, efficient, and trustworthy bridge between sustainable farmers and ESG-focused investors.

## 🎥 Pitch Deck

[![Pitch Deck Thumbnail](https://youtu.be/jndI3k5wi3Q)

## Live Demo: [agripulsehedera.netlify.app](https://agripulsehedera.netlify.app/)  
## Feasibility Study: [View on GitHub](https://github.com/Mohammad-Abdelhadi/AgriPulse-/blob/main/Feasibility-study.md)  
## DoraHack Submission: [View Here](https://dorahacks.io/buidl/35662)

# Team Certificates

## Mohammad Abdelhadi
[View Certificate](https://drive.google.com/file/d/1dSCeEpGIoa2PKkyhCGFc6gjQ20w41IJR/view?usp=drive_link)

## Ahmad Abdelhadi
[View Certificate](https://drive.google.com/file/d/1pZ1K12pii17usKM0qRFZX2eHw0-_LAYV/view?usp=drive_link)

## Khaled Musa
[View Certificate](https://drive.google.com/file/d/11WqXxNc2xbToVnw-Ty--9zojqCbIsG2N/view?usp=drive_link)

---

## Executive Summary

AgriPulse makes carbon markets transparent, secure, and accessible. We connect sustainable farmers with corporates and investors through Hedera’s HCS + HTS and Google Gemini AI, ensuring direct impact and trust.

---

## The Problem

Carbon markets fail small farmers:
-   **No Trust:** Unverifiable credits and greenwashing.
-   **High Costs:** Intermediaries take big cuts.
-   **Complex Access:** Certification is costly.
-   **Slow Payments:** Delays hurt cash flow.

---

## The Solution

AgriPulse uses AI + Hedera DLT for transparency and efficiency:
-   **HCS Validation:** Immutable on-chain proof of dMRV data.
-   **HTS Payments:** Atomic swaps send 95% instantly to farmers.
-   **NFT Rewards:** AI-generated HCS NFTs boost engagement.
-   **Security:** Users’ private keys are securely stored locally, never on our servers.

---

## Core Features

-   **HTS Integration:** Uses Hedera Token Service (HTS) to manage carbon tokens and NFTs with secure, low-cost, and high-speed transactions.
-   **AI-Powered Verification (dMRV):** Google Gemini analyzes farm data for quality, preventing fraud and ensuring credit integrity.
-   **Radical Transparency:** Every verification is logged on the Hedera Consensus Service (HCS), creating a public, unchangeable audit trail.
-   **Instant & Fair Payments:** Hedera’s Atomic Swaps enable direct, instant payments — farmers receive 95% of every sale.
-   **Engaging Rewards:** AI generates unique NFT certificates and badges for farmers and investors.

---

## Why Hedera is PERFECT

-   **HTS:** Fast, low-cost, secure token creation—no smart contracts.
-   **Atomic Swaps:** Trustless, instant HBAR-for-token trades.
-   **HCS:** Immutable, fair, low-cost audit trail for dMRV.
-   **Sustainability:** Proof-of-stake, ultra-low carbon—mission aligned.

---

## Onboarding

Register as a Farmer or a Company (Investor) with a simple email and password. You will then be prompted to connect your Hedera Testnet account by providing your Account ID and DER Encoded Private Key.

---

## Quickstart Demo in 3 Steps

Experience the full platform flow with these pre-configured accounts.

### 1. Admin: Initialize the Platform

-   **Log in as Admin:**
    -   **Email:** `admin@admin.com`
    -   **Password:** `admin123`
-   Go to the **Admin Dashboard** and click **Initialize Platform**.

This creates all required tokens and NFT collections on the Hedera Testnet.

-   **Platform Token (JCO2 – 0.0.7165850):** Main CO₂ credit token.
    -   🔗 [View on HashScan](https://hashscan.io/testnet/token/0.0.7165850)
-   **HCS Audit Trail (0.0.7165849):** Records audits and verifications.
    -   🔗 [View on HashScan](https://hashscan.io/testnet/topic/0.0.7165849)
-   **Farmer NFT Collection (APL – 0.0.7165852):** Represents verified farmers.
    -   🔗 [View on HashScan](https://hashscan.io/testnet/token/0.0.7165852)
-   **Investor NFT Collection (API – 0.0.7165853):** Represents carbon credit investors.
    -   🔗 [View on HashScan](https://hashscan.io/testnet/token/0.0.7165853)
-   **Farm NFT Collection (APF – 0.0.7165851):** Represents farms that have sold carbon credits.
    -   🔗 [View on HashScan](https://hashscan.io/testnet/token/0.0.7165851)

### 2. Farmer: Create the Supply

-   **Log out and log in as Farmer:**
    -   **Email:** `farmer@farm.com`
    -   **Password:** `farmer123`
-   Go to **My Farm** and complete the one-time wallet setup.
-   Click **Register New Farm**, fill in the details (use the "Golden Grain Oasis" data from the docs), and submit. Our AI will verify it and list it on the marketplace.

**On-chain Proof:**
-   **Farm Verification NFT for "Golden Grain Oasis" (Score 97/100):**
    -   🔗 [View on HashScan](https://hashscan.io/testnet/token/0.0.7165851/1)

### 3. Investor: Purchase with Confidence

-   **Log out and log in as Investor:**
    -   **Email:** `inv@inv.com`
    -   **Password:** `investor123`
-   Go to **My Dashboard** and complete the one-time wallet setup.
-   In the **Marketplace**, find the new farm and click **Purchase Credits**.

An atomic swap instantly settles the transaction. You get credits and an NFT.

**On-chain Proof:**
-   **Credit Purchase Transaction (Atomic Swap):**
    -   🔗 [View on HashScan](https://hashscan.io/testnet/transaction/0.0.7130606-1761886707-794393576)
-   **Investor NFT Mint:**
    -   🔗 [View on HashScan](https://hashscan.io/testnet/token/0.0.7165853/1)

---

### **Liquid vs. Retired Credits**

-   **Liquid Credits:** Active tokens you own but haven’t used.
-   **Retiring Credits:** Permanently remove credits to claim your offset. This is an on-chain action that destroys the tokens.
-   **Impact & Certificate:** Your on-chain transaction serves as cryptographic proof of your CO₂ impact.
    -   **Example Retirement Transaction:**
        -   🔗 [View on HashScan](https://hashscan.io/testnet/transaction/0.0.7163581-1761941718-217193352)

---

## Technology Stack

-   **Frontend:** React, TypeScript, TailwindCSS
-   **Hedera Hashgraph:** HTS, HCS, NFTs
-   **AI & Verification:** Google Gemini API
-   **Decentralized Storage:** IPFS (via Pinata)

---

## Future Enhancements

### Phase 1: Foundational Enhancements & Core Features
-   **Backend & Database Integration:** Transition from local storage to a secure backend and database to manage user data, farm details, and NFT metadata, ensuring scalability and data integrity.
-   **Real Wallet Integration:** Implement support for browser extension wallets like HashPack using the Hedera WalletConnect standard, removing the need for users to handle private keys directly.
-   **Enhanced dMRV & Farm Registration:** Expand the farm registration form with more detailed fields (e.g., soil type, historical land use, water sources) to feed into an improved dMRV model for more accurate CO2e calculations.
-   **Comprehensive User Profiles:** Develop dedicated profile pages for farmers and investors. These pages will showcase a user's transaction history, a gallery of their earned NFTs, and role-specific information like a farmer's portfolio of farms or an investor's total retired credits.
-   **Marketplace V2 - Filtering & Search:** Upgrade the marketplace with advanced filtering (by location, crop type, price, etc.) and search functionality to improve discoverability for investors.

### Phase 2: Ecosystem Expansion & Liquidity
-   **Secondary Marketplace:** Launch a peer-to-peer (P2P) marketplace enabling investors to trade their liquid carbon credit tokens with each other. This will increase liquidity and create a more dynamic market.
-   **Verifiable Retirement Certificates:** Upon retiring credits, automatically generate a downloadable, shareable certificate (e.g., PDF) that includes transaction details and on-chain proof, providing formal documentation for ESG reporting.
-   **Service Provider Marketplace:** Introduce a new "Service Provider" user role, creating a marketplace where agricultural consultants and equipment suppliers can offer their services to farmers, fostering a circular economy within the platform.
-   **Governance & DAO:** Begin the development of a platform governance token. This will empower the community of farmers and investors to vote on key platform parameters like commission rates and feature development, progressively decentralizing control.
