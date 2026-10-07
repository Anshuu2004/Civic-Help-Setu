import { MOCK_SERVICES } from '../data/services';
import { FAQ_DATABASE } from '../data/faq_database';

export const askCivicAssistant = async (query) => {
  // Simulate network delay for AI processing
  await new Promise(resolve => setTimeout(resolve, 1000));

  const lowerQuery = query.toLowerCase();

  // 1. Try to find a direct match in the MOCK_SERVICES (Detailed Guides)
  const serviceMatch = MOCK_SERVICES.find(s => 
    lowerQuery.includes(s.name.toLowerCase()) || 
    lowerQuery.includes(s.id.toLowerCase()) ||
    lowerQuery.includes(s.category.toLowerCase()) ||
    (s.id === 'birth-certificate' && lowerQuery.includes('born')) ||
    (s.id === 'driving-license' && lowerQuery.includes('drive')) ||
    (s.id === 'pan-card' && lowerQuery.includes('tax')) ||
    (s.id === 'aadhaar-card' && lowerQuery.includes('lost'))
  );

  if (serviceMatch) {
    const suggestions = [
      `What are the fees for ${serviceMatch.name}?`,
      `How long does it take to process?`,
      `What documents do I need to prepare?`
    ];

    return {
      status: 'success',
      data: {
        title: serviceMatch.name,
        summary: serviceMatch.shortDescription,
        steps: serviceMatch.steps,
        officialSources: serviceMatch.officialSources,
      },
      serviceId: serviceMatch.id,
      suggestions: suggestions
    };
  }

  // 2. Fallback to our massive simulated FAQ_DATABASE using Keyword Scoring
  // This simulates the LLM answering 1000s of different variations of questions
  let bestMatch = null;
  let highestScore = 0;

  for (const faq of FAQ_DATABASE) {
    let score = 0;
    for (const keyword of faq.keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }

  // If we found a good match in the FAQ Database
  if (bestMatch && highestScore > 0) {
    return {
      status: 'success',
      data: {
        title: bestMatch.title,
        summary: bestMatch.summary,
        steps: [],
        officialSources: []
      },
      serviceId: null,
      suggestions: bestMatch.suggestions
    };
  }

  // 3. Absolute Fallback response if no match found anywhere
  return {
    status: 'success',
    data: {
      title: "I couldn't find specific information on that.",
      summary: "My knowledge base covers thousands of civic services, but I couldn't precisely match your query. Could you try rephrasing? For example, specify if you are looking for information about Passports, Taxes, Voter IDs, or Property Registration.",
      steps: [],
      officialSources: []
    },
    serviceId: null,
    suggestions: ["How to apply for a Passport?", "Check Aadhaar status", "Download Income Certificate"]
  };
};
