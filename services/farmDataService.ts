// This service provides realistic, sample farm data for demos and testing,
// inspired by open datasets like CropHarvest and real-world agricultural projects.

import { PRACTICES } from '../constants';

type SampleFarmData = {
    name: string;
    location: string;
    story: string;
    landArea: number;
    areaUnit: 'dunum' | 'hectare';
    cropType: string;
    practices: string[];
    imageUrl: string;
    pricePerTon: number;
};

const sampleFarms: SampleFarmData[] = [
    {
        name: "Wadi Rum Olive Grove",
        location: "Wadi Rum, Jordan",
        story: "A family-owned olive grove transitioning to organic farming. We use traditional water harvesting techniques and managed grazing for sheep to naturally fertilize the soil, increasing its carbon sequestration capacity. The goal is to fund a new solar-powered well.",
        landArea: 50,
        areaUnit: 'dunum',
        cropType: "Olives",
        practices: [PRACTICES[3].id, PRACTICES[4].id], // Efficient irrigation, Managed grazing
        imageUrl: 'https://i.ibb.co/N1p29M1/jordan-olives.jpg',
        pricePerTon: 0.75,
    },
    {
        name: "Bomet Green Maize Farm",
        location: "Bomet County, Kenya",
        story: "As a smallholder farmer in a local cooperative, I use intercropping techniques with beans to improve soil nitrogen. Selling carbon credits will help me invest in a modern drip irrigation system, reducing water usage and increasing yield.",
        landArea: 2,
        areaUnit: 'hectare',
        cropType: "Maize and Beans (Intercropping)",
        practices: [PRACTICES[2].id, PRACTICES[1].id], // Cover cropping, Reduced fertilizer
        imageUrl: 'https://i.ibb.co/pnv1b9m/kenya-farm.jpg',
        pricePerTon: 0.60,
    },
    {
        name: "Punjab Wheat Collective",
        location: "Punjab, India",
        story: "We are part of a collective adopting no-till farming to combat soil erosion and reduce diesel consumption from tractors. The additional income from carbon credits helps us invest in better seeds and community resources like shared grain storage.",
        landArea: 5,
        areaUnit: 'hectare',
        cropType: "Wheat",
        practices: [PRACTICES[0].id, PRACTICES[2].id], // No-till, Cover cropping
        imageUrl: 'https://i.ibb.co/7Yg7k2D/punjab-wheat.jpg',
        pricePerTon: 0.55,
    },
    {
        name: "Ogun Cassava Fields",
        location: "Ogun State, Nigeria",
        story: "Focusing on sustainable cassava cultivation, my farm uses crop rotation with legumes to enrich the soil. We aim to prove that small-scale farming can be both profitable and a powerful tool against climate change, inspiring others in our community.",
        landArea: 3,
        areaUnit: 'hectare',
        cropType: "Cassava",
        practices: [PRACTICES[1].id, PRACTICES[3].id], // Reduced fertilizer, Efficient irrigation
        imageUrl: 'https://i.ibb.co/h7g4y7C/nigeria-cassava.jpg',
        pricePerTon: 0.65,
    }
];


export const farmDataService = {
    /**
     * Returns a random, high-quality farm data object for populating the form.
     */
    getRandomFarmData: (): SampleFarmData => {
        const randomIndex = Math.floor(Math.random() * sampleFarms.length);
        return sampleFarms[randomIndex];
    }
};
