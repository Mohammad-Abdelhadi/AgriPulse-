import { Farm } from '../types';
import { PRACTICES, APPROVAL_THRESHOLD, HECTARE_TO_DUNUM } from '../constants';

// This is a mock dMRV (Digital Monitoring, Reporting, and Verification) service.
// In a real-world application, this would use satellite data, IoT sensors,
// and advanced algorithms to verify farm data and calculate a trust score.

interface VerificationResult {
    score: number;
    isApproved: boolean;
    reason: string;
    breakdown: Record<string, { score: number; max: number; reason: string }>;
}

// FIX: The farmData parameter was defined with too many exclusions.
// The `totalTons` property is calculated before this service is called and is needed for the logic check.
// Simplified the type to reflect the available data at the time of verification.
type VerifiableFarmData = Omit<Farm, 'id' | 'status' | 'farmerId' | 'farmerName' | 'farmerHederaAccountId'>;

export const dMRVService = {
    verifyFarm: (farmData: VerifiableFarmData): VerificationResult => {
        console.log("dMRV Service: Verifying farm data for", farmData.name);
        
        let totalScore = 0;
        const breakdown: VerificationResult['breakdown'] = {};

        // 1. Data Completeness Score (Max 30)
        let dataScore = 0;
        let dataReason = "Incomplete data.";
        if (farmData.location?.length > 5) dataScore += 10;
        if (farmData.story?.length > 50) dataScore += 10;
        if (farmData.cropType?.length > 2) dataScore += 5;
        if (farmData.imageUrl) dataScore += 5;
        if (dataScore > 25) dataReason = "All essential data provided.";
        breakdown['dataCompleteness'] = { score: dataScore, max: 30, reason: dataReason };
        totalScore += dataScore;
        
        // 2. Sustainable Practices Score (Max 40)
        let practiceScore = 0;
        const practiceCount = farmData.practices.length;
        let practiceReason = "No sustainable practices selected.";
        if (practiceCount === 1) practiceScore = 15;
        else if (practiceCount === 2) practiceScore = 25;
        else if (practiceCount > 2) practiceScore = 40;
        if (practiceCount > 0) practiceReason = `${practiceCount} practice(s) selected.`;
        breakdown['sustainablePractices'] = { score: practiceScore, max: 40, reason: practiceReason };
        totalScore += practiceScore;

        // 3. Land Area & CO2 Logic Score (Max 30)
        let logicScore = 0;
        let logicReason = "Land area or CO2 calculation seems low.";
        const areaInDunums = farmData.areaUnit === 'hectare' ? farmData.landArea * HECTARE_TO_DUNUM : farmData.landArea;
        if (areaInDunums > 5) logicScore += 10;
        if (farmData.totalTons > 10) logicScore += 10;
        if (farmData.pricePerTon > 0.05) logicScore += 10;
        if (logicScore > 20) logicReason = "Plausible land area and pricing.";
        breakdown['economicLogic'] = { score: logicScore, max: 30, reason: logicReason };
        totalScore += logicScore;

        const isApproved = totalScore >= APPROVAL_THRESHOLD;
        const reason = isApproved 
            ? `Farm approved with a score of ${totalScore}.`
            : `Farm rejected. Score of ${totalScore} is below the required ${APPROVAL_THRESHOLD}.`;
            
        console.log(`dMRV Result: Score ${totalScore}, Approved: ${isApproved}`);

        return {
            score: totalScore,
            isApproved,
            reason,
            breakdown,
        };
    }
};
