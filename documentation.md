# AgriPulse: Full Demo Walkthrough

This document provides a step-by-step script for demonstrating the full, end-to-end functionality of the AgriPulse platform.

---

### **Demo Credentials**

Use these pre-configured accounts to follow the walkthrough. All are connected to the Hedera Testnet.

-   **Admin Role:**
    -   **Email:** `admin@admin.com`
    -   **Password:** `admin123`
-   **Farmer Role:**
    -   **Email:** `farmer@farm.com`
    -   **Password:** `farmer123`
-   **Investor Role:**
    -   **Email:** `inv@inv.com`
    -   **Password:** `investor123`

---

## The Full Flow: A Step-by-Step Guide

### **Step 1: Admin - Platform Initialization**

First, the Admin must establish the on-chain infrastructure.

1.  **Log In as Admin:** Use the `admin@admin.com` credentials.
2.  **Navigate to Admin Dashboard:** From the header, click `Admin Dashboard`.
3.  **Initialize the Platform:**
    -   Notice the "Platform Not Initialized" message.
    -   Click the **Initialize Platform** button. A modal will appear with pre-filled details for the on-chain assets.
    -   Click **Confirm & Create**.
    -   Wait for the process to complete. You will see notifications for each asset created. The dashboard will now display the on-chain IDs for the HCS Topic, the Platform Token, and the three NFT Collections.

**Outcome:** The entire on-chain foundation of the marketplace is now live on the Hedera Testnet.

---

### **Step 2: Farmer - Onboarding & Creating Supply**

Next, a farmer registers and lists their sustainable farm.

1.  **Log Out** from the Admin account.
2.  **Log In as Farmer:** Use the `farmer@farm.com` credentials.
3.  **Navigate to My Farm:** From the header, click `My Farm`.
4.  **Complete Account Setup:**
    -   You will see a prompt to "Complete Your Account Setup." This is a one-time step to associate the farmer's wallet with the achievement NFT collection.
    -   Click **Step 1: Associate Wallet**. 
    -   The button will disappear once the association is complete.
5.  **Register an Accepted Farm:**
    -   Click **Register New Farm**.
    -   Fill in the form with the following data:
        -   **Farm Name:** `Golden Grain Oasis`
        -   **Location:** `Al-Mafraq Governorate`
        -   **Land Area:** `45` | `dunum`
        -   **Agricultural Type:** `Wheat and Barley`
        -   **My Farm’s Story:** `Nestled in the highlands of Al-Mafraq, this farm has passed through generations of growers dedicated to cereal production. Over time, new irrigation systems and soil health practices have transformed it into a model of sustainable dryland agriculture.`
        -   **Practices:** Select `No-till`, `Reduced chemical fertilizer`, and `Efficient irrigation`.
        -   **Certificate:** Upload Jordan_Farm_Certificate_1 PDF from the `farm certifcates` folder.
    -   Click **Submit for Verification**.
6.  **Register a Rejected Farm:**
    -   After the first submission is complete, click **Register New Farm** again.
    -   Fill in the form with low-quality data:
        -   **Farm Name:** `Aaaaaaaaa farm`
        -   **Location:** `Aaaaaaaaa`
        -   **Story:** `Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa...` (at least 50 characters)
    -   Click **Submit for Verification**.

**Outcome:** The "Golden Grain Oasis" farm will pass the AI-dMRV, receive a high score, get a verification NFT minted, and be listed on the Marketplace. The "Aaaaaaaaa" farm will be rejected with a low score, and the reason will be logged on-chain.

---

### **Step 3: Investor - Purchasing Verifiable Credits**

An investor discovers the verified farm and makes a purchase.

1.  **Log Out** from the Farmer account.
2.  **Log In as Investor:** Use the `inv@inv.com` credentials.
3.  **Navigate to My Dashboard:** From the header, click `My Dashboard`.
4.  **Complete Account Setup:**
    -   Just like the farmer, the investor must complete a one-time wallet setup.
    -   Click **Complete Account Setup**. This associates the wallet with both the platform's carbon credit token and the investor achievement NFTs.
5.  **Go to the Marketplace:** Click `Marketplace` in the header.
6.  **Find and Verify the Farm:**
    -   Locate the **Golden Grain Oasis** farm card.
    -   Click the **Verification Log** link to view its immutable audit trail on HashScan.
    -   Click the **View Farm NFT** link to see its on-chain certificate.
7.  **Purchase Credits:**
    -   Click the **Purchase Credits** button on the farm card.
    -   In the modal, enter the number of credits to buy (e.g., `10`).
    -   Click **Confirm Purchase**.

**Outcome:** A Hedera atomic swap instantly transfers HBAR from the investor, splits it between the farmer and the platform, and delivers 10 carbon credit tokens to the investor's wallet. The user will receive several real-time notifications tracking the process.

---

### **Step 4: Verifying the On-Chain History**

Finally, the investor can review the entire transaction history.

1.  **Stay Logged In** as the Investor.
2.  **Open the Profile Menu:** Click the user avatar in the top-right corner of the header.
3.  **Navigate to History:** Click on the `History` link in the dropdown menu.
4.  **Review Transactions:**
    -   You will see a chronological list of recent activities.
    -   Find the **Credit Purchase** transaction for "Golden Grain Oasis". Click the `View Transaction` link to see the atomic swap on HashScan.
    -   Find the **NFT Mint** transaction for your new "Impact Certificate". Click the `View Mint Transaction` link to see your achievement NFT on HashScan.

**Outcome:** The user can independently verify every step of the purchase and reward process on the public ledger, demonstrating the platform's end-to-end transparency.
