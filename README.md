# AgriPulse: A Decentralized Carbon Credit Marketplace

**AgriPulse** is a decentralized carbon credit marketplace built on the Hedera network, designed to create a transparent, efficient, and trustworthy bridge between sustainable farmers and ESG-focused investors.

---

## Table of Contents
1.  [Executive Summary](#1-executive-summary)
2.  [The Problem We Solve: A Focus on Jordan](#2-the-problem-we-solve-a-focus-on-jordan)
3.  [Our Solution: A Multi-Layered Approach to Trust](#3-our-solution-a-multi-layered-approach-to-trust)
4.  [The Complete Project Flow](#4-the-complete-project-flow)
5.  [The dMRV System Explained](#5-the-dmrv-system-explained)
6.  [Technology Stack & Why Hedera](#6-technology-stack--why-hedera)
7.  [Future Enhancements](#7-future-enhancements)


---

## 1. Executive Summary

AgriPulse's mission is to democratize access to the carbon market, eliminate "greenwashing" through radical transparency, and channel funds directly to those making a real environmental impact. Our initial focus is on empowering the sustainable farming community in **Jordan**, with a vision for regional and global expansion.

We connect two key groups:
-   **Sustainable Farmers:** Small and medium-sized farmers in Jordan and beyond who implement practices that sequester carbon from the atmosphere.
-   **Corporations & Investors:** Entities that need to offset their carbon footprint in a verifiable and impactful way.

By leveraging Hedera's low-cost, high-throughput DLT and Google's Gemini AI for verification, AgriPulse provides a seamless, trustworthy, and efficient experience for all participants.

---

## 2. The Problem We Solve: A Focus on Jordan

The traditional voluntary carbon market is plagued with critical issues that disproportionately affect farmers in developing regions like Jordan:

-   **Opacity & Lack of Trust:** It's difficult for buyers to verify that the carbon credits they purchase represent real, permanent carbon sequestration. This leads to "greenwashing," where companies claim environmental impact without proof.
-   **High Intermediary Costs:** A complex web of brokers, certifiers, and registries takes a significant cut, meaning only a fraction of the investment reaches the farmers. In Jordan, where profit margins are already slim, this makes participation unviable.
-   **Barriers to Entry for Small Farmers:** The process of getting certified is often too expensive (costing thousands of dollars) and complex for smallholder farmers, excluding a vast majority of Jordan's agricultural producers from a vital source of income.
-   **Inefficient Settlement:** Transactions are slow, and payments can take months to process, creating cash flow problems for farmers.

---

## 3. Our Solution: A Multi-Layered Approach to Trust

AgriPulse leverages Hedera and AI to build a next-generation marketplace that directly addresses these problems. Our approach to data integrity is built on multiple layers of validation:

| Layer                       | How AgriPulse Implements It                                                                                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layer 1: Client-Side**    | The farm registration form uses standard HTML5 validation to provide immediate feedback, ensuring basic data quality before submission.                                                    |
| **Layer 2: AI-Powered dMRV**| Our system uses Google Gemini API to analyze the plausibility and consistency of the submitted data, preventing spam and nonsensical entries and providing a robust quality check.        |
| **Ultimate Proof: On-Chain**| The full, detailed report from our dMRV service, including the AI analysis, is recorded as an immutable message on the **Hedera Consensus Service (HCS)**, providing a public, unchangeable audit trail. |

**Core Features:**
-   **Efficiency & Low Cost:** By using Hedera's native **Atomic Swaps**, we eliminate costly intermediaries. The transaction is instant, and funds are split (e.g., 95% to farmer, 5% to platform) in a single, trustless step.
-   **Engagement & UX:** We use Google's Gemini API to create unique, AI-generated artwork for achievement NFTs awarded to both farmers and investors, enhancing user engagement.

---

## 4. The Complete Project Flow

This is the entire lifecycle of a carbon credit on the AgriPulse platform.

### **Phase 1: Platform Initialization (Admin Role)**
The platform cannot function until the on-chain infrastructure is established.
1.  **Login as Admin:** The administrator accesses their dashboard.
2.  **Initialize Platform:** With a single action, the admin's Hedera account creates and configures all necessary assets on the Hedera Testnet:
    -   **Hedera Consensus Service (HCS) Topic:** An immutable logbook is created to record all farm verification decisions. This is the foundation of our transparency.
    -   **NFT Collections:** Collections are created for Farm Verification (APF), Farmer Achievements (APL), and Investor Certificates (API).
    -   **Fungible Platform Token (e.g., JCO2):** The core carbon credit token is created, representing one ton of verified CO₂e. The supply is held in the admin's treasury.

### **Phase 2: The Farmer's Journey (Creating Supply)**
1.  **Onboarding:** A farmer signs up and connects their Hedera wallet.
2.  **Data Submission:** The farmer fills out the registration form with details about their farm and sustainable practices.
3.  **Automated Verification (dMRV) with AI:** Our `dMRVService` performs its multi-layered check, including an AI analysis for data plausibility.
4.  **On-Chain Auditing (HCS):** The full dMRV report is submitted to the HCS topic, creating a permanent, timestamped, and unchangeable audit record.
5.  **Approval & NFT Minting:** If approved, a unique **Farm NFT (APF)** is minted to the farmer as an on-chain verification certificate, and the farm is listed on the marketplace.

### **Phase 3: The Investor's Journey (Meeting Demand)**
1.  **Due Diligence:** An investor browses the marketplace and can view the immutable **HCS verification receipt** for any farm directly on HashScan.
2.  **Purchase (The Atomic Swap):** The investor buys credits. A single, multi-party atomic swap is executed on Hedera:
    -   Investor's HBAR is withdrawn.
    -   ~95% of HBAR is instantly sent to the farmer.
    -   ~5% of HBAR is instantly sent to the platform as a commission.
    -   The corresponding amount of JCO2 tokens is instantly transferred from the treasury to the investor.
3.  **Achievement NFTs:** For significant purchases, the Gemini API generates unique artwork, which is used to mint and award achievement NFTs to both the investor and the farmer.

### **Phase 4: Achieving Real-World Impact (Retirement)**
1.  **Retirement:** An investor "retires" their tokens to claim their environmental impact.
2.  **Token Wipe:** This action triggers a `TokenWipeTransaction`, permanently destroying the selected tokens from the investor's wallet.
3.  **Proof of Impact:** The investor receives proof of retirement via the transaction link on HashScan.

---

## 5. The dMRV System Explained

Our dMRV is a multi-layered, score-based system with an approval threshold of **70/100**.

-   **Layer 1: Client-Side Validation:** Ensures data format and length are correct before submission.
-   **Layer 2: Rule-Based Scoring:**
    -   Data Completeness (15 points)
    -   Sustainable Practices (35 points)
    -   Economic & Scientific Logic (20 points)
    -   Certificate Validation (30 points)
-   **Layer 3: AI-Powered Quality Assurance:**
    -   The Gemini API analyzes the textual data for plausibility.
    -   If the AI detects spam or nonsensical data, it applies a heavy penalty to the total score, ensuring rejection.

The full breakdown of this calculation is recorded on the HCS, ensuring anyone can audit our decisions.

---

## 6. Technology Stack & Why Hedera

-   **Frontend:** React, TypeScript, TailwindCSS
-   **AI Integration:** Google Gemini API
-   **Decentralized Storage:** IPFS (via Pinata)
-   **Blockchain:** Hedera Hashgraph

**Why Hedera was the PERFECT choice:**
-   **Hedera Token Service (HTS):** HTS is a native service on Hedera, which means creating, minting, and transferring tokens is incredibly fast, low-cost, and secure without the need to write and audit complex, gas-intensive smart contracts.
-   **Atomic Swaps:** Hedera's ability to handle complex, multi-party `TransferTransactions` is the engine of our marketplace. It allows us to execute a trustless exchange (HBAR for Tokens, with commission) in a single, instant transaction.
-   **Hedera Consensus Service (HCS):** This is our key differentiator. HCS provides a fast, low-cost, and provably fair way to log data immutably. We use it as the ultimate source of truth for our dMRV audit trail.
-   **Sustainability:** Hedera is a proof-of-stake network with an incredibly low carbon footprint. Building a climate solution on an energy-intensive blockchain would be counter-intuitive. Hedera's sustainability aligns perfectly with our core mission.

---

## 7. Future Enhancements

- **🚀 Service Provider Marketplace:** Introduce a new "Service Provider" user role where agricultural consultants and equipment suppliers can list their services. Farmers can use their earnings to purchase these services, creating a circular, self-sustaining economy.
- **🚀 Advanced dMRV:** Integrate satellite imagery and IoT data to provide even more robust and automated verification of sustainable practices.
- **🚀 Governance Token & DAO:** Introduce a platform governance token, allowing the community of farmers and investors to vote on key platform parameters like commission rates and new feature development.
