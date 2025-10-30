# AgriPulse: A Decentralized Carbon Credit Marketplace

**AgriPulse** is a decentralized carbon credit marketplace built on the Hedera network, designed to create a transparent, efficient, and trustworthy bridge between sustainable farmers and ESG-focused investors.

---

## Table of Contents
1.  [Executive Summary](#1-executive-summary)
2.  [The Problem We Solve](#2-the-problem-we-solve)
3.  [Our Solution](#3-our-solution)
4.  [Technology Stack](#4-technology-stack)
5.  [The Complete Project Flow](#5-the-complete-project-flow)
6.  [Project Phases & Features](#6-project-phases--features)
    - [Phase 1: Implemented MVP Features](#phase-1-implemented-mvp-features)
    - [Phase 2: Planned Enhancements](#phase-2-planned-enhancements)
7.  [Future Development: Backend Integration](#7-future-development-backend-integration)

---

## 1. Executive Summary

The project's mission is to democratize access to the carbon market, eliminate "greenwashing" through radical transparency, and channel funds directly to those making a real environmental impact on the ground. By leveraging Hedera's low-cost, high-throughput DLT and Google's Gemini AI for verification, AgriPulse provides a seamless experience for all participants.

---

## 2. The Problem We Solve
The traditional voluntary carbon market is plagued with critical issues:
- **Opacity & Lack of Trust:** Difficulty in verifying the authenticity of carbon credits, leading to "greenwashing."
- **High Intermediary Costs:** Brokers and certifiers take significant cuts, reducing funds for farmers.
- **Barriers to Entry:** The certification process is often too expensive and complex for smallholder farmers.
- **Inefficient Settlement:** Transactions are slow, and payments can take months to process.

---

## 3. Our Solution
AgriPulse leverages Hedera and AI to build a next-generation marketplace that directly addresses these problems.
- **AI-Powered dMRV:** A multi-layered verification system using Google Gemini API to analyze farm data for plausibility, consistency, and authenticity, preventing spam and fraud.
- **On-Chain Audit Trail:** Every verification decision is immutably recorded on the **Hedera Consensus Service (HCS)**, providing a public, unchangeable audit trail that anyone can inspect.
- **Instant, Low-Cost Transactions:** Hedera's native **Atomic Swaps** facilitate instant, peer-to-peer trades without costly smart contract intermediaries.

---

## 4. Technology Stack
- **Frontend:** React, TypeScript, TailwindCSS
- **AI Integration:** Google Gemini API (for dMRV and metadata generation)
- **Decentralized Storage:** IPFS (via Pinata) for storing NFT metadata and farm documentation.
- **Blockchain:** Hedera Hashgraph (HTS, HCS, Atomic Swaps)
- **Data Persistence (MVP):** Browser `localStorage` (to be replaced by a full backend).

---

## 5. The Complete Project Flow
This is the entire lifecycle of a carbon credit on the AgriPulse platform.

### A. Platform Initialization (Admin)
1.  **One-Click Setup:** The Admin uses their dashboard to deploy all necessary on-chain assets:
    *   **HCS Topic:** An immutable logbook for all dMRV audit trails.
    *   **NFT Collections:** For Farm Verification, Farmer Achievements, and Investor Certificates.
    *   **Fungible Token:** The core carbon credit token, with its supply held in the Admin treasury.

### B. The Farmer's Journey (Creating Supply)
1.  **Onboarding:** A farmer signs up and connects their Hedera wallet.
2.  **Farm Registration:** The farmer submits farm details, sustainable practices, and proof of ownership.
3.  **AI-Powered Verification (dMRV):** The system analyzes the data for plausibility and scores the farm. The full report, including the AI's justification, is submitted to the **HCS Topic**.
4.  **Approval & Minting:** If approved, a unique **Farm NFT** is minted to the farmer's wallet as a certificate of authenticity, and the corresponding amount of carbon credit tokens is minted to the platform treasury. The farm is now listed on the marketplace.

### C. The Investor's Journey (Meeting Demand)
1.  **Due Diligence:** An investor browses the marketplace, filtering by location, and can view the immutable **HCS verification receipt** for any farm.
2.  **Purchase (Primary Market):** The investor buys credits directly from the platform via an **Atomic Swap**. HBAR is exchanged for carbon credit tokens instantly. A platform commission is automatically deducted and sent to the Admin account.
3.  **Trade (Secondary Market):** An investor can list their purchased carbon credits on the **Secondary Marketplace** for a set price. Another investor can then purchase these credits via a **peer-to-peer Atomic Swap**, where HBAR and tokens are exchanged directly between the two investors, with a small commission automatically sent to the platform.
4.  **Retirement:** To claim their environmental impact, an investor "retires" their credits. This triggers a `TokenWipeTransaction`, permanently destroying the tokens and providing the investor with an on-chain proof of retirement.

---

## 6. Project Phases & Features

### Phase 1: Implemented MVP Features
This is the core functionality available in the current version of AgriPulse.

- **✅ User Roles & Dashboards:** Dedicated dashboards for Farmers, Investors, and a platform Admin.
- **✅ AI-Powered dMRV:** A robust, automated farm verification system using Google Gemini.
- **✅ Primary Marketplace:** Investors can browse verified farms and purchase carbon credits directly from the platform treasury using Hedera Atomic Swaps.
- **✅ Secondary P2P Marketplace:** A dedicated marketplace where investors can list their carbon credit tokens for sale and trade directly with other investors.
- **✅ Advanced Farm Search:** The marketplace includes a search filter to find farms based on location (country, city).
- **✅ Public User Profiles:** All users have a public profile page. Farmers can showcase their verified farms, and investors can display their company information and on-chain impact.
- **✅ On-Chain Achievements:** Unique NFTs are awarded to both farmers and investors for significant transactions, with metadata stored on IPFS.
- **✅ Credit Retirement:** Investors can permanently retire their carbon credits, with the transaction recorded on-chain as proof of impact.
- **✅ Full On-Chain Audit Trail:** Every critical action, from verification to retirement, is logged on the Hedera Consensus Service.

### Phase 2: Planned Enhancements
These features represent the next stage of development to expand the AgriPulse ecosystem.

- **🚀 Full Backend Integration:** Transition from browser `localStorage` to a scalable backend infrastructure. This will enable user data persistence, advanced analytics, and a more robust platform.
- **🚀 Service Provider Marketplace:** Introduce a new "Service Provider" user role.
    -   Providers (e.g., equipment rental companies, agricultural consultants) can list their services on a dedicated marketplace.
    -   Farmers can use their earnings from credit sales to purchase these services directly on the platform, creating a circular, self-sustaining economy.
    -   This fosters a local support network for farmers, helping them further improve their sustainable practices.
- **🚀 Advanced dMRV with Satellite/IoT Data:** Integrate with external data sources (e.g., satellite imagery APIs, on-farm IoT sensors) to provide even more robust and automated verification of sustainable practices.
- **🚀 Governance Token & DAO:** Introduce a platform governance token, allowing the community of farmers and investors to vote on key platform parameters like commission rates and new feature development.

---

## 7. Future Development: Backend Integration
The current MVP uses browser `localStorage` for rapid prototyping and demonstration. The next critical step for a production-ready application is to integrate a dedicated backend.

**Proposed Stack:**
- **API:** Node.js with Express.js or a similar framework.
- **Database:** PostgreSQL for relational data (Users, Farms, Listings).
- **Authentication:** JWT-based authentication managed by the backend.

**Integration Plan:**
1.  **Develop API Endpoints:** Create RESTful or GraphQL endpoints for all CRUD (Create, Read, Update, Delete) operations currently handled by `localStorage`.
2.  **Refactor Contexts:** Update the React contexts (`AuthContext`, `FarmContext`) to fetch data from the new API endpoints instead of `localStorage`.
3.  **Secure Sensitive Operations:** Move logic that requires administrative privileges (e.g., initiating minting operations) to be authorized and triggered by the secure backend, which would then interact with the Hedera network.
4.  **User Data Management:** All user profiles, farm data, and marketplace listings will be persisted in the database, providing a single source of truth and enabling a more scalable and reliable user experience.
