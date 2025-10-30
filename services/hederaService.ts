import * as hederasdk from '@hashgraph/sdk';

type HederaEntityType = 'transaction' | 'token' | 'account' | 'contract' | 'topic';

class HederaService {
    private logHederaEntity(type: HederaEntityType, id: string | hederasdk.TransactionId, network: 'testnet' | 'mainnet' = 'testnet') {
        let identifier: string;
        let displayId: string;

        if (type === 'transaction' && id instanceof hederasdk.TransactionId) {
            displayId = id.toString();
            identifier = id.toString();
        } else {
            displayId = id as string;
            identifier = id as string;
        }

        const output = {
            type,
            id: displayId,
            network,
            hashscan_link: `https://hashscan.io/${network}/${type}/${identifier}`
        };
        console.log('Hedera Entity Referenced:', JSON.stringify(output, null, 2));
    }
    
    private formatTxIdForUrl(txId: hederasdk.TransactionId): string {
        return txId.toString();
    }

    // --- REAL WRITE OPERATIONS ---
    
    async executeAtomicSwap(
        investorAccountId: string,
        investorPrivateKeyString: string,
        farmerAccountId: string,
        adminAccountId: string,
        adminPrivateKeyString: string,
        hbarAmountInTinybars: number,
        tokenId: string,
        tokenAmount: number
    ): Promise<{ hashscanUrl: string }> {
        console.log(`Attempting atomic swap...`);
        try {
            const client = hederasdk.Client.forTestnet();
            const investorPrivateKey = hederasdk.PrivateKey.fromString(investorPrivateKeyString);
            const adminPrivateKey = hederasdk.PrivateKey.fromString(adminPrivateKeyString);
    
            const totalAmount = BigInt(hbarAmountInTinybars);
            // Calculate 5% platform commission using BigInt arithmetic for precision.
            const commission = (totalAmount * 5n) / 100n; 
            const farmerShare = totalAmount - commission;

            console.log(`--- Atomic Swap Breakdown ---`);
            console.log(`Total HBAR from Investor: ${totalAmount.toString()} tinybars`);
            console.log(`Platform Commission (5%): ${commission.toString()} tinybars -> to Admin Account ${adminAccountId}`);
            console.log(`Farmer's Share (95%): ${farmerShare.toString()} tinybars -> to Farmer Account ${farmerAccountId}`);
            console.log(`Token Transfer: ${tokenAmount} of ${tokenId} from Admin ${adminAccountId} to Investor ${investorAccountId}`);
            console.log(`-----------------------------`);

            const transaction = new hederasdk.TransferTransaction()
                // FIX: Convert bigint to string for SDK compatibility
                .addHbarTransfer(investorAccountId, hederasdk.Hbar.fromTinybars(totalAmount.toString()).negated())
                // FIX: Convert bigint to string for SDK compatibility
                .addHbarTransfer(farmerAccountId, hederasdk.Hbar.fromTinybars(farmerShare.toString()))
                // FIX: Convert bigint to string for SDK compatibility
                .addHbarTransfer(adminAccountId, hederasdk.Hbar.fromTinybars(commission.toString()))
                .addTokenTransfer(tokenId, adminAccountId, -tokenAmount)
                .addTokenTransfer(tokenId, investorAccountId, tokenAmount);
    
            client.setOperator(investorAccountId, investorPrivateKey);
    
            const frozenTx = await transaction.freezeWith(client);
            const adminSignedTx = await frozenTx.sign(adminPrivateKey);
            const txResponse = await adminSignedTx.execute(client);
    
            await txResponse.getReceipt(client);
    
            this.logHederaEntity('transaction', txResponse.transactionId);
            console.log(`Atomic swap successful. Transaction ID: ${txResponse.transactionId.toString()}`);
            return { hashscanUrl: `https://hashscan.io/testnet/transaction/${this.formatTxIdForUrl(txResponse.transactionId)}` };
        } catch (err: any) {
            console.error("Error executing atomic swap:", err);
            if (err.message?.includes('INSUFFICIENT_PAYER_BALANCE') || err.message?.includes('INSUFFICIENT_ACCOUNT_BALANCE')) { 
                throw new Error('You do not have enough HBAR to complete this purchase.'); 
            }
            if (err.message?.includes('INSUFFICIENT_TOKEN_BALANCE')) { throw new Error('The treasury has an insufficient token balance for this purchase.'); }
            if (err.message?.includes('TOKEN_NOT_ASSOCIATED_TO_ACCOUNT')) { throw new Error('Investor must associate with the token first.'); }
            if (err.message?.includes('Invalid private key')) { throw new Error('An invalid private key was provided for the swap.'); }
            throw new Error(err.message || "An error occurred during the atomic swap.");
        }
    }

    async createRealFungibleToken(
        tokenName: string,
        tokenSymbol: string,
        initialSupply: number,
        adminAccountId: string,
        adminPrivateKey: string
    ): Promise<{ tokenId: string, hashscanUrl: string }> {
        console.log("Attempting to create a real fungible token...");

        if (!adminAccountId || !adminPrivateKey) {
            throw new Error("Admin account ID and private key are required.");
        }

        try {
            const client = hederasdk.Client.forTestnet();
            const privateKey = hederasdk.PrivateKey.fromString(adminPrivateKey);
            client.setOperator(adminAccountId, privateKey);

            const transaction = await new hederasdk.TokenCreateTransaction()
                .setTokenName(tokenName)
                .setTokenSymbol(tokenSymbol)
                .setTokenType(hederasdk.TokenType.FungibleCommon)
                .setDecimals(0)
                .setInitialSupply(initialSupply)
                .setTreasuryAccountId(adminAccountId)
                .setAdminKey(privateKey)
                .setSupplyKey(privateKey)
                .setWipeKey(privateKey)
                .freezeWith(client);

            const signTx = await transaction.sign(privateKey);
            const txResponse = await signTx.execute(client);
            const receipt = await txResponse.getReceipt(client);
            const tokenId = receipt.tokenId;

            this.logHederaEntity('account', adminAccountId);
            this.logHederaEntity('transaction', txResponse.transactionId);

            if (!tokenId) { throw new Error("Token ID was not returned from the receipt."); }
            this.logHederaEntity('token', tokenId.toString());
            
            console.log(`Token created successfully: ${tokenId.toString()}`);
            return {
                tokenId: tokenId.toString(),
                hashscanUrl: `https://hashscan.io/testnet/transaction/${this.formatTxIdForUrl(txResponse.transactionId)}`
            };

        } catch (err: any) {
            console.error("Error creating real fungible token:", err);
            if (err.message?.includes('INSUFFICIENT_ACCOUNT_BALANCE')) { throw new Error('Your account has insufficient HBAR to create a token.'); }
            if (err.message?.includes('Invalid private key')) { throw new Error('The provided private key is invalid.'); }
            throw new Error(err.message || "An error occurred during token creation.");
        }
    }

    async mintFungibleTokens(tokenId: string, amount: number, adminAccountId: string, adminPrivateKeyString: string): Promise<{ newTotalSupply: number, hashscanUrl: string }> {
        console.log(`Attempting to MINT ${amount} of token ${tokenId}`);
        try {
            const client = hederasdk.Client.forTestnet();
            const privateKey = hederasdk.PrivateKey.fromString(adminPrivateKeyString);
            client.setOperator(adminAccountId, privateKey);

            const transaction = await new hederasdk.TokenMintTransaction()
                .setTokenId(tokenId)
                .setAmount(amount)
                .freezeWith(client);
            
            const signTx = await transaction.sign(privateKey);
            const txResponse = await signTx.execute(client);
            const receipt = await txResponse.getReceipt(client);
            
            this.logHederaEntity('transaction', txResponse.transactionId);

            const newTotalSupply = receipt.totalSupply?.toNumber();
            if (newTotalSupply === undefined) {
                 throw new Error("Mint receipt did not return a new total supply.");
            }

            console.log(`Mint successful. New total supply: ${newTotalSupply}`);
            return { 
                newTotalSupply: newTotalSupply,
                hashscanUrl: `https://hashscan.io/testnet/transaction/${this.formatTxIdForUrl(txResponse.transactionId)}` 
            };
        } catch (err: any) {
            console.error("Error minting tokens:", err);
            if (err.message?.includes('TOKEN_HAS_NO_SUPPLY_KEY')) { throw new Error('The token was not created with a Supply Key, so tokens cannot be minted.'); }
            if (err.message?.includes('Invalid private key')) { throw new Error('The provided admin private key is invalid for minting.'); }
            throw new Error(err.message || "An error occurred during token minting.");
        }
    }
    
    async associateToken(
        accountId: string,
        privateKeyString: string,
        tokenId: string
    ): Promise<{ hashscanUrl: string, alreadyAssociated: boolean }> {
        console.log(`Attempting to associate account ${accountId} with token ${tokenId}`);
        try {
            const client = hederasdk.Client.forTestnet();
            const privateKey = hederasdk.PrivateKey.fromString(privateKeyString);
            client.setOperator(accountId, privateKey);

            const transaction = await new hederasdk.TokenAssociateTransaction().setAccountId(accountId).setTokenIds([tokenId]).freezeWith(client);
            const signTx = await transaction.sign(privateKey);
            const txResponse = await signTx.execute(client);
            await txResponse.getReceipt(client);

            this.logHederaEntity('account', accountId);
            this.logHederaEntity('token', tokenId);
            this.logHederaEntity('transaction', txResponse.transactionId);

            console.log(`Association successful. Transaction ID: ${txResponse.transactionId.toString()}`);
            return { hashscanUrl: `https://hashscan.io/testnet/transaction/${this.formatTxIdForUrl(txResponse.transactionId)}`, alreadyAssociated: false };
        } catch (err: any) {
            console.error("Error associating token:", err);
            if (err.message?.includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) {
                console.warn("Token already associated, proceeding gracefully.");
                return { hashscanUrl: '', alreadyAssociated: true };
            }
            if (err.message?.includes('Invalid private key')) { throw new Error('The provided private key is invalid.'); }
            throw new Error(err.message || "An error occurred during token association.");
        }
    }

    async createRealNftCollection(name: string, symbol: string, memo: string, adminAccountId: string, adminPrivateKey: string): Promise<{ tokenId: string, hashscanUrl: string }> {
        console.log("Attempting to create a real NFT collection with metadata...");
        const client = hederasdk.Client.forTestnet();
        const privateKey = hederasdk.PrivateKey.fromString(adminPrivateKey);
        client.setOperator(adminAccountId, privateKey);
        
        let tokenId: hederasdk.TokenId;
    
        try {
            const createTx = await new hederasdk.TokenCreateTransaction()
                .setTokenName(name)
                .setTokenSymbol(symbol)
                .setTokenType(hederasdk.TokenType.NonFungibleUnique)
                .setDecimals(0)
                .setInitialSupply(0)
                .setTreasuryAccountId(adminAccountId)
                .setAdminKey(privateKey)
                .setSupplyKey(privateKey)
                .setWipeKey(privateKey)
                .freezeWith(client);
    
            const signedCreateTx = await createTx.sign(privateKey);
            const createTxResponse = await signedCreateTx.execute(client);
            const receipt = await createTxResponse.getReceipt(client);
            
            if (!receipt.tokenId) throw new Error("NFT Collection ID not returned from receipt.");
            tokenId = receipt.tokenId;
            this.logHederaEntity('token', tokenId.toString());
            console.log(`Token created successfully: ${tokenId.toString()}`);
    
            const updateTx = await new hederasdk.TokenUpdateTransaction()
                .setTokenId(tokenId)
                .setTokenMemo(memo)
                .freezeWith(client);
    
            const signedUpdateTx = await updateTx.sign(privateKey);
            const updateTxResponse = await signedUpdateTx.execute(client);
            await updateTxResponse.getReceipt(client);
            this.logHederaEntity('transaction', updateTxResponse.transactionId);
            
            console.log("Token memo updated successfully.");
    
            return { tokenId: tokenId.toString(), hashscanUrl: `https://hashscan.io/testnet/token/${tokenId.toString()}` };
    
        } catch (err: any) {
            console.error("Error creating NFT collection with metadata:", err);
            if (err.message?.includes('Invalid private key')) { throw new Error('The provided private key is invalid.'); }
            throw new Error(err.message || "An error occurred during NFT collection creation.");
        }
    }

    async mintAndTransferNft(collectionTokenId: string, adminAccountId: string, adminPrivateKeyString: string, recipientAccountId: string, metadata: string): Promise<{ serialNumber: number, hashscanUrl: string }> {
         console.log(`Attempting to mint and transfer NFT to ${recipientAccountId}`);
         try {
            const client = hederasdk.Client.forTestnet();
            const privateKey = hederasdk.PrivateKey.fromString(adminPrivateKeyString);
            client.setOperator(adminAccountId, privateKey);

            const mintTx = await new hederasdk.TokenMintTransaction().setTokenId(collectionTokenId).setMetadata([new TextEncoder().encode(metadata)]).freezeWith(client);
            const signedMintTx = await mintTx.sign(privateKey);
            const mintTxResponse = await signedMintTx.execute(client);
            this.logHederaEntity('transaction', mintTxResponse.transactionId);

            const mintReceipt = await mintTxResponse.getReceipt(client);
            const serialNumber = mintReceipt.serials[0].toNumber();
            if (!serialNumber) throw new Error("Minting did not return a serial number.");

            const transferTx = await new hederasdk.TransferTransaction().addNftTransfer(collectionTokenId, serialNumber, adminAccountId, recipientAccountId).freezeWith(client);
            const signedTransferTx = await transferTx.sign(privateKey);
            const transferTxResponse = await signedTransferTx.execute(client);
            await transferTxResponse.getReceipt(client);
            
            this.logHederaEntity('account', adminAccountId); this.logHederaEntity('account', recipientAccountId); this.logHederaEntity('token', collectionTokenId); this.logHederaEntity('transaction', transferTxResponse.transactionId);
            
            const nftUrl = `https://hashscan.io/testnet/token/${collectionTokenId}/${serialNumber}`;
            console.log(`NFT minted and transferred. View on HashScan: ${nftUrl}`);

            return { serialNumber, hashscanUrl: nftUrl };
        } catch (err: any) {
            console.error("Error minting and transferring NFT:", err);
            if (err.message?.includes('TOKEN_NOT_ASSOCIATED_TO_ACCOUNT')) { throw new Error(`The recipient (${recipientAccountId}) must first associate with the NFT Collection.`); }
            if (err.message?.includes('Invalid private key')) { throw new Error('The admin private key is invalid.'); }
            throw new Error(err.message || "An error occurred during NFT awarding.");
        }
    }
    
    async wipeTokens(adminAccountId: string, adminPrivateKeyString: string, accountToWipeId: string, tokenId: string, amount: number): Promise<{ hashscanUrl: string }> {
        console.log(`Attempting to WIPE ${amount} of token ${tokenId} from account ${accountToWipeId}`);
        try {
            const client = hederasdk.Client.forTestnet();
            const privateKey = hederasdk.PrivateKey.fromString(adminPrivateKeyString);
            client.setOperator(adminAccountId, privateKey);

            const transaction = await new hederasdk.TokenWipeTransaction()
                .setAccountId(accountToWipeId)
                .setTokenId(tokenId)
                .setAmount(amount)
                .freezeWith(client);
            
            const signTx = await transaction.sign(privateKey);
            const txResponse = await signTx.execute(client);
            await txResponse.getReceipt(client);
            
            this.logHederaEntity('account', accountToWipeId);
            this.logHederaEntity('token', tokenId);
            this.logHederaEntity('transaction', txResponse.transactionId);

            console.log(`Wipe successful. Transaction ID: ${txResponse.transactionId.toString()}`);
            return { hashscanUrl: `https://hashscan.io/testnet/transaction/${this.formatTxIdForUrl(txResponse.transactionId)}` };
        } catch (err: any) {
            console.error("Error wiping tokens:", err);
            if (err.message?.includes('TOKEN_HAS_NO_WIPE_KEY')) { throw new Error('The token was not created with a Wipe Key, so tokens cannot be retired.'); }
            if (err.message?.includes('Invalid private key')) { throw new Error('The provided admin private key is invalid for wiping.'); }
            throw new Error(err.message || "An error occurred during token retirement.");
        }
    }
        
    async deleteToken(tokenId: string, adminAccountId: string, adminPrivateKeyString: string): Promise<{ hashscanUrl: string }> {
        console.log(`Attempting to DELETE token ${tokenId}`);
        try {
            const client = hederasdk.Client.forTestnet();
            const privateKey = hederasdk.PrivateKey.fromString(adminPrivateKeyString);
            client.setOperator(adminAccountId, privateKey);
    
            const transaction = await new hederasdk.TokenDeleteTransaction()
                .setTokenId(tokenId)
                .freezeWith(client);
    
            const signTx = await transaction.sign(privateKey);
            const txResponse = await signTx.execute(client);
            await txResponse.getReceipt(client);
    
            this.logHederaEntity('token', tokenId);
            this.logHederaEntity('transaction', txResponse.transactionId);
    
            console.log(`Delete successful. Transaction ID: ${txResponse.transactionId.toString()}`);
            return { hashscanUrl: `https://hashscan.io/testnet/transaction/${this.formatTxIdForUrl(txResponse.transactionId)}` };
        } catch (err: any) {
            console.error("Error deleting token:", err);
            if (err.message?.includes('TOKEN_IS_IMMUTABLE')) { throw new Error('The token was not created with an Admin Key, so it cannot be deleted.'); }
            if (err.message?.includes('TOKEN_WAS_DELETED')) {
                console.warn(`Token ${tokenId} was already deleted.`);
                return { hashscanUrl: '' };
            }
             if (err.message?.includes('TRANSACTION_REQUIRES_ZERO_TOKEN_SUPPLY')) { throw new Error('Cannot delete token: The total supply is not in the treasury account. Wipe/burn all tokens first.'); }
            throw new Error(err.message || "An error occurred during token deletion.");
        }
    }

    async dissociateTokens(accountId: string, privateKeyString: string, tokenIds: string[]): Promise<void> {
        console.log(`Attempting to DISSOCIATE account ${accountId} from ${tokenIds.length} tokens`);
        const client = hederasdk.Client.forTestnet();
        const privateKey = hederasdk.PrivateKey.fromString(privateKeyString);
        client.setOperator(accountId, privateKey);
        
        // Process one token at a time for resilience
        for (const tokenId of tokenIds) {
            try {
                const transaction = await new hederasdk.TokenDissociateTransaction()
                    .setAccountId(accountId)
                    .setTokenIds([tokenId])
                    .freezeWith(client);
        
                const signTx = await transaction.sign(privateKey);
                const txResponse = await signTx.execute(client);
                await txResponse.getReceipt(client);
        
                this.logHederaEntity('transaction', txResponse.transactionId);
                console.log(`Successfully dissociated from ${tokenId}`);
            } catch (err: any) {
                console.error(`Failed to dissociate from ${tokenId}:`, err);
                // Re-throw to be caught by the calling function, which handles logging
                throw new Error(`Failed on ${tokenId}: ${err.message}`);
            }
        }
    }
    
    async burnNftBatch(tokenId: string, serialNumbers: number[], adminAccountId: string, adminPrivateKeyString: string): Promise<void> {
        console.log(`Attempting to BURN batch of ${serialNumbers.length} NFTs from token ${tokenId}`);
        if (serialNumbers.length === 0) return;
        try {
            const client = hederasdk.Client.forTestnet();
            const privateKey = hederasdk.PrivateKey.fromString(adminPrivateKeyString);
            client.setOperator(adminAccountId, privateKey);

            const transaction = await new hederasdk.TokenBurnTransaction()
                .setTokenId(tokenId)
                .setSerials(serialNumbers)
                .freezeWith(client);
    
            const signTx = await transaction.sign(privateKey);
            const txResponse = await signTx.execute(client);
            await txResponse.getReceipt(client);
    
            this.logHederaEntity('transaction', txResponse.transactionId);
            console.log(`Batch burn of ${serialNumbers.length} NFTs successful.`);
        } catch (err: any) {
            console.error("Error in batch burning NFTs:", err);
            throw new Error(err.message || "An error occurred during NFT batch burn.");
        }
    }

    async transferAssetsBackToAdmin(
        userAccountId: string, userPrivateKeyString: string, adminAccountId: string,
        assets: { tokenId: string; amount?: number; serials?: number[] }[]
    ): Promise<void> {
        if (assets.length === 0) return;
        console.log(`Transferring assets from ${userAccountId} back to admin ${adminAccountId}`);
        try {
            const client = hederasdk.Client.forTestnet();
            const privateKey = hederasdk.PrivateKey.fromString(userPrivateKeyString);
            client.setOperator(userAccountId, privateKey);
    
            const transaction = new hederasdk.TransferTransaction();
    
            for (const asset of assets) {
                if (asset.amount) {
                    transaction.addTokenTransfer(asset.tokenId, userAccountId, -asset.amount);
                    transaction.addTokenTransfer(asset.tokenId, adminAccountId, asset.amount);
                }
                if (asset.serials) {
                    for (const serial of asset.serials) {
                        transaction.addNftTransfer(asset.tokenId, serial, userAccountId, adminAccountId);
                    }
                }
            }
    
            const frozenTx = await transaction.freezeWith(client);
            const signTx = await frozenTx.sign(privateKey);
            const txResponse = await signTx.execute(client);
            await txResponse.getReceipt(client);
    
            this.logHederaEntity('transaction', txResponse.transactionId);
            console.log("Assets transferred back to admin successfully.");
        } catch (err: any) {
            console.error("Error transferring assets back to admin:", err);
            if (err.message?.includes("TOKEN_NOT_ASSOCIATED_TO_ACCOUNT")) {
                 throw new Error("Transfer failed: The admin account is not associated with one of the tokens.");
            }
            throw new Error(err.message || "An error occurred during asset transfer.");
        }
    }

    async createHcsTopic(adminAccountId: string, adminPrivateKeyString: string, memo: string): Promise<{ topicId: string, hashscanUrl: string }> {
        console.log("Attempting to create a new HCS topic...");
        try {
            const client = hederasdk.Client.forTestnet();
            const privateKey = hederasdk.PrivateKey.fromString(adminPrivateKeyString);
            client.setOperator(adminAccountId, privateKey);

            const transaction = await new hederasdk.TopicCreateTransaction()
                .setTopicMemo(memo)
                .setAdminKey(privateKey) // Allows topic to be updated/deleted
                .setSubmitKey(privateKey) // Allows admin to submit messages
                .freezeWith(client);
            
            const signedTx = await transaction.sign(privateKey);
            const txResponse = await signedTx.execute(client);
            const receipt = await txResponse.getReceipt(client);

            const topicId = receipt.topicId;
            if (!topicId) { throw new Error("HCS Topic ID was not returned from the receipt."); }

            this.logHederaEntity('topic', topicId.toString());
            this.logHederaEntity('transaction', txResponse.transactionId);

            console.log(`HCS topic created successfully: ${topicId.toString()}`);
            return {
                topicId: topicId.toString(),
                hashscanUrl: `https://hashscan.io/testnet/topic/${topicId.toString()}`
            };

        } catch (err: any) {
            console.error("Error creating HCS topic:", err);
            throw new Error(err.message || "An error occurred during HCS topic creation.");
        }
    }

    async submitHcsMessage(topicId: string, message: string, adminAccountId: string, adminPrivateKeyString: string): Promise<{ hashscanUrl: string }> {
        console.log(`Submitting message to HCS topic ${topicId}`);
        try {
            const client = hederasdk.Client.forTestnet();
            const privateKey = hederasdk.PrivateKey.fromString(adminPrivateKeyString);
            client.setOperator(adminAccountId, privateKey);

            const transaction = await new hederasdk.TopicMessageSubmitTransaction({
                topicId: topicId,
                message: message,
            })
            .setMaxChunks(1) // Force the message to be a single transaction, preventing chunking.
            .freezeWith(client);

            const signedTx = await transaction.sign(privateKey);
            const txResponse = await signedTx.execute(client);
            await txResponse.getReceipt(client);

            this.logHederaEntity('topic', topicId);
            this.logHederaEntity('transaction', txResponse.transactionId);

            console.log(`Message submitted successfully to HCS topic. Transaction ID: ${txResponse.transactionId}`);
            return {
                hashscanUrl: `https://hashscan.io/testnet/transaction/${this.formatTxIdForUrl(txResponse.transactionId)}`
            };

        } catch (err: any) {
            console.error("Error submitting HCS message:", err);
            // Check for the specific error message from the Hedera SDK when a message exceeds the single chunk limit.
            if (err.message?.includes('too long for 1 chunks')) {
                throw new Error("HCS submission failed: The verification summary is too large. Please shorten farm details like name or story and try again.");
            }
            throw new Error(err.message || "An error occurred while submitting HCS message.");
        }
    }


    // --- REAL READ OPERATIONS ---

    async getRealAccountBalance(accountId: string): Promise<{ hbar: number; tokens: { tokenId: string, balance: number }[] }> {
        if (!accountId) return { hbar: 0, tokens: [] };
        this.logHederaEntity('account', accountId);
        console.log(`Fetching real balance for account: ${accountId}`);
        try {
            const apiUrl = `https://testnet.mirrornode.hedera.com/api/v1/balances?account.id=${accountId}&limit=100`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if (response.status === 404 || (await response.text()).includes("Not found")) {
                    console.warn(`Account ${accountId} not found on mirror node.`);
                    return { hbar: 0, tokens: [] };
                }
                throw new Error(`Hedera Mirror Node API error: ${response.statusText}`);
            }
            
            const data = await response.json();
            const accountData = data.balances?.[0];
            if (!accountData) { return { hbar: 0, tokens: [] }; }

            const hbarBalance = accountData.balance / 100_000_000;
            const tokenBalances: { tokenId: string, balance: number }[] = (accountData.tokens || []).map((token: any) => ({
                tokenId: token.token_id,
                balance: token.balance 
            }));

            console.log(`Balance fetched for ${accountId}: ${hbarBalance} HBAR, ${tokenBalances.length} tokens.`);
            return { hbar: hbarBalance, tokens: tokenBalances };
        } catch (error) {
            console.error("Error fetching real account balance from Hedera Mirror Node:", error);
            return { hbar: 0, tokens: [] };
        }
    }

    async getAccountAssociatedTokens(accountId: string): Promise<any[]> {
        if (!accountId) return [];
        console.log(`Fetching all associated tokens for account: ${accountId}`);
        try {
            const apiUrl = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/tokens?limit=100`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Mirror Node API error: ${response.statusText}`);
            
            const data = await response.json();
            const tokensWithDetails = await Promise.all(data.tokens.map(async (token: any) => {
                const info = await this.getTokenInfo(token.token_id);
                return { ...token, name: info.name, symbol: info.symbol };
            }));

            return tokensWithDetails;
        } catch (error) {
            console.error("Error fetching associated tokens from Mirror Node:", error);
            return [];
        }
    }

    async getTokenInfo(tokenId: string): Promise<any> {
        const apiUrl = `https://testnet.mirrornode.hedera.com/api/v1/tokens/${tokenId}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Failed to fetch token info for ${tokenId}`);
        return response.json();
    }
    
    async getPublicKey(privateKeyString: string): Promise<string> {
        try {
            return hederasdk.PrivateKey.fromString(privateKeyString).publicKey.toStringRaw();
        } catch (e) {
            return "invalid_key";
        }
    }

    async getAllNftsForCollection(tokenId: string): Promise<any[]> {
        let allNfts: any[] = [];
        let nextUrl: string | null = `https://testnet.mirrornode.hedera.com/api/v1/tokens/${tokenId}/nfts?limit=100`;
    
        while (nextUrl) {
            const response = await fetch(nextUrl);
            if (!response.ok) throw new Error(`Failed to fetch NFTs for collection ${tokenId}`);
            const data = await response.json();
            allNfts = allNfts.concat(data.nfts);
            nextUrl = data.links.next ? `https://testnet.mirrornode.hedera.com${data.links.next}` : null;
        }
        return allNfts;
    }
    
    async getAllTokenHolders(tokenId: string): Promise<any[]> {
        let allHolders: any[] = [];
        let nextUrl: string | null = `https://testnet.mirrornode.hedera.com/api/v1/tokens/${tokenId}/balances?limit=100`;

        while (nextUrl) {
            const response = await fetch(nextUrl);
            if (!response.ok) throw new Error(`Failed to fetch holders for token ${tokenId}`);
            const data = await response.json();
            allHolders = allHolders.concat(data.balances);
            nextUrl = data.links.next ? `https://testnet.mirrornode.hedera.com${data.links.next}` : null;
        }
        return allHolders;
    }
    
    async getNftsForAccountInCollection(accountId: string, tokenId: string): Promise<any[]> {
        let allNfts: any[] = [];
        let nextUrl: string | null = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/nfts?token.id=${tokenId}&limit=100`;

        while (nextUrl) {
            const response = await fetch(nextUrl);
            if (!response.ok) throw new Error(`Failed to fetch NFTs for account ${accountId} in collection ${tokenId}`);
            const data = await response.json();
            allNfts = allNfts.concat(data.nfts);
            nextUrl = data.links.next ? `https://testnet.mirrornode.hedera.com${data.links.next}` : null;
        }
        return allNfts;
    }


    async getHbarToUsdRate(): Promise<number> {
        console.log("Simulating fetch for HBAR to USD exchange rate.");
        return 0.08; 
    }
}

export const hederaService = new HederaService();