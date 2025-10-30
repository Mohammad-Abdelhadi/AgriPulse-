import { Farm } from '../types';
import { PRACTICES, APPROVAL_THRESHOLD, HECTARE_TO_DUNUM } from '../constants';
import { geminiService } from './geminiService';

// This is a mock dMRV (Digital Monitoring, Reporting, and Verification) service.
// It now uses a multi-layered approach: initial checks followed by AI validation.

interface VerificationResult {
    score: number;
    isApproved: boolean;
    reason: string;
    breakdown: Record<string, { score: number; max: number; reason: string }>;
}

type VerifiableFarmData = Omit<Farm, 'id' | 'status' | 'farmerId' | 'farmerName' | 'farmerHederaAccountId' | 'certificateIpfsUrl'>;

export const dMRVService = {
    async verifyFarm(farmData: VerifiableFarmData, certificate: { mimeType: string; data: string; } | null): Promise<VerificationResult> {
        console.log("dMRV Service: Verifying farm data for", farmData.name);
        
        let totalScore = 0;
        const breakdown: VerificationResult['breakdown'] = {};

        // 1. Data Completeness Score (Max 15)
        let dataScore = 0;
        let dataReason = "Incomplete data.";
        if (farmData.location?.length > 5) dataScore += 5;
        if (farmData.story?.length > 50) dataScore += 5;
        if (farmData.cropType?.length > 2) dataScore += 5;
        breakdown['dataCompleteness'] = { score: dataScore, max: 15, reason: dataReason };
        totalScore += dataScore;
        
        // 2. Sustainable Practices Score (Max 35)
        let practiceScore = 0;
        const practiceCount = farmData.practices.length;
        let practiceReason = "No sustainable practices selected.";
        if (practiceCount === 1) practiceScore = 15;
        else if (practiceCount === 2) practiceScore = 25;
        else if (practiceCount > 2) practiceScore = 35;
        if (practiceCount > 0) practiceReason = `${practiceCount} practice(s) selected.`;
        breakdown['sustainablePractices'] = { score: practiceScore, max: 35, reason: practiceReason };
        totalScore += practiceScore;

        // 3. Land Area & CO2 Logic Score (Max 20)
        let logicScore = 0;
        let logicReason = "Land area or CO2 calculation seems low.";
        const areaInDunums = farmData.areaUnit === 'hectare' ? farmData.landArea * HECTARE_TO_DUNUM : farmData.landArea;
        if (areaInDunums > 5) logicScore += 5;
        if (farmData.totalTons > 10) logicScore += 10;
        if (farmData.pricePerTon > 0.05) logicScore += 5;
        if (logicScore > 15) logicReason = "Plausible land area and pricing.";
        breakdown['economicLogic'] = { score: logicScore, max: 20, reason: logicReason };
        totalScore += logicScore;
        
        // 4. Certificate Validation Score (Max 30)
        // FIX: Re-structured the conditional to use a direct check. This ensures TypeScript correctly
        // narrows the type of `certificate` to `{ mimeType: "application/pdf"; ... }` before passing it to the analysis service, resolving the type error.
        if (certificate && certificate.mimeType === 'application/pdf') {
            try {
                console.log("dMRV: Sending certificate to Gemini for analysis...");
                const certAnalysis = await geminiService.analyzeCertificate(certificate);
                const certScore = Math.round(certAnalysis.score * (30 / 100)); // Scale to 30 max points
                totalScore += certScore;
                breakdown['certificateValidation'] = { score: certScore, max: 30, reason: certAnalysis.justification };
            } catch (error: any) {
                console.error("Certificate validation step failed:", error.message);
                breakdown['certificateValidation'] = { score: 0, max: 30, reason: `AI analysis failed: ${error.message}` };
            }
        } else {
            breakdown['certificateValidation'] = { score: 0, max: 30, reason: certificate ? "Only PDF files are accepted for certificate validation." : "No certificate provided." };
        }


        // 5. AI Plausibility & Consistency Check (Potential Penalty)
        try {
            console.log("dMRV: Sending data to Gemini for AI analysis...");
            const aiAnalysis = await geminiService.analyzeFarmData({
                name: farmData.name,
                location: farmData.location,
                story: farmData.story,
                cropType: farmData.cropType,
                landArea: farmData.landArea,
                areaUnit: farmData.areaUnit,
                practices: farmData.practices
            });

            let aiScore = 0;
            // Apply a heavy penalty if AI plausibility is very low (indicates spam/junk data)
            if (aiAnalysis.plausibilityScore < 20) {
                aiScore = -50; // Heavy penalty
                totalScore += aiScore;
                console.warn("AI detected low plausibility. Applying penalty.", aiAnalysis.justification);
            }
            breakdown['aiValidation'] = { score: aiScore, max: 0, reason: `Plausibility: ${aiAnalysis.plausibilityScore}/100. ${aiAnalysis.justification}` };

        } catch (error: any) {
            console.error("AI validation step failed:", error.message);
            // Add a breakdown entry to indicate failure, but don't penalize score
            breakdown['aiValidation'] = { score: 0, max: 0, reason: `AI analysis failed: ${error.message}` };
        }


        const isApproved = totalScore >= APPROVAL_THRESHOLD;
        const reason = isApproved 
            ? `Farm approved with a score of ${totalScore}.`
            : `Farm rejected. Score of ${totalScore} is below the required ${APPROVAL_THRESHOLD}.`;
            
        console.log(`dMRV Result: Final Score ${totalScore}, Approved: ${isApproved}`);

        return {
            score: totalScore,
            isApproved,
            reason,
            breakdown,
        };
    }
};