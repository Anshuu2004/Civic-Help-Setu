import { MOCK_SERVICES } from '../data/services';

// In a real production app, this would call your backend which then calls OpenAI.
// For the MVP, we simulate the AI extracting intent and returning a structured guide,
// or we make a direct call if an API key is strictly provided for testing (not recommended for production).

export const askCivicAssistant = async (query) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const lowerQuery = query.toLowerCase();

  // Find a matching service from our mock data
  const match = MOCK_SERVICES.find(s => 
    lowerQuery.includes(s.name.toLowerCase()) || 
    lowerQuery.includes(s.id.toLowerCase()) ||
    lowerQuery.includes(s.category.toLowerCase()) ||
    (s.id === 'birth-certificate' && lowerQuery.includes('born')) ||
    (s.id === 'driving-license' && lowerQuery.includes('drive')) ||
    (s.id === 'pan-card' && lowerQuery.includes('tax')) ||
    (s.id === 'aadhaar-card' && lowerQuery.includes('lost')) // mock matching for the user example
  );

  if (match) {
    return {
      status: 'success',
      data: {
        title: match.name,
        summary: match.shortDescription,
        eligibility: match.eligibility,
        documents: match.documents,
        steps: match.steps,
        fees: match.fees,
        processingTime: match.processingTime,
        officialSources: match.officialSources,
        warnings: match.warnings,
        lastVerified: match.lastVerified
      },
      serviceId: match.id
    };
  }

  // Fallback response if no match
  return {
    status: 'success',
    data: {
      title: "I couldn't find a specific guide for that.",
      summary: "It looks like we don't have a structured guide for your exact request yet. Could you please provide more details, or try asking about Identity Documents, Certificates, Transport, or Welfare schemes?",
      eligibility: [],
      documents: [],
      steps: [],
      fees: "",
      processingTime: "",
      officialSources: [],
      warnings: ["This is an AI response. Always verify with official authorities."],
      lastVerified: new Date().toISOString().split('T')[0]
    },
    serviceId: null
  };
};
