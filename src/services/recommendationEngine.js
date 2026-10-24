/**
 * Explainable Civic Service Recommendation Engine (#78)
 * Evaluates citizen preferences against structured service metadata using transparent,
 * deterministic ranking rules. Explains why each service is recommended and explicitly
 * discloses unknown, unmet, or unverifiable criteria.
 */

import { MOCK_SERVICES } from '../data/services.js';

export const RECOMMENDATION_DISCLAIMER =
  'Recommendation Disclaimer: Scores reflect preference and prerequisite alignment based on user-provided inputs. A high recommendation score does not constitute an official government eligibility decision.';

// Default configurable weights for the deterministic scoring model
export const DEFAULT_WEIGHTS = {
  intent: 0.35,      // Alignment with citizen's goals/needs
  documents: 0.25,   // Document readiness ratio
  eligibility: 0.20, // Eligibility criteria satisfaction
  speed: 0.10,       // Processing duration match
  fees: 0.10,        // Fee constraint match
};

// Intent mappings to service IDs or categories
export const INTENT_MAPPINGS = {
  travel_abroad: ['passport'],
  voting_election: ['voter-id'],
  tax_and_finance: ['pan-card', 'income-certificate'],
  identity_proof: ['aadhaar-card', 'pan-card', 'voter-id', 'passport'],
  birth_registration: ['birth-certificate'],
  food_subsidy: ['ration-card'],
  scholarship_aid: ['income-certificate', 'birth-certificate'],
};

/**
 * Normalizes user preferences with sensible defaults without assuming missing fields are met.
 * @param {Object} rawPreferences
 * @returns {Object} Normalized preference object
 */
export function normalizeUserPreferences(rawPreferences = {}) {
  return {
    intents: Array.isArray(rawPreferences.intents) ? rawPreferences.intents : [],
    category: rawPreferences.category || null,
    heldDocuments: Array.isArray(rawPreferences.heldDocuments)
      ? rawPreferences.heldDocuments.map((d) => d.toLowerCase().trim())
      : [],
    citizenship: rawPreferences.citizenship || null, // 'indian' | 'other' | null
    age: typeof rawPreferences.age === 'number' ? rawPreferences.age : null,
    maxTurnaroundDays: typeof rawPreferences.maxTurnaroundDays === 'number' ? rawPreferences.maxTurnaroundDays : null,
    feePreference: rawPreferences.feePreference || 'any', // 'free_only' | 'paid_acceptable' | 'any'
  };
}

/**
 * Evaluates document readiness by matching held documents against required documents.
 * @param {string[]} requiredDocs - Service document prerequisites
 * @param {string[]} heldDocs - Documents the citizen already has
 * @returns {Object} Document match metrics
 */
export function evaluateDocumentReadiness(requiredDocs = [], heldDocs = []) {
  if (!requiredDocs || requiredDocs.length === 0) {
    return {
      ratio: 1.0,
      matched: [],
      missing: [],
    };
  }

  const matched = [];
  const missing = [];

  for (const reqDoc of requiredDocs) {
    const reqLower = reqDoc.toLowerCase();
    // Check if any held document satisfies this requirement
    const hasMatch = heldDocs.some((held) => {
      const heldClean = held.toLowerCase();
      return (
        reqLower.includes(heldClean) ||
        (heldClean.includes('aadhaar') && reqLower.includes('aadhaar')) ||
        (heldClean.includes('pan') && reqLower.includes('pan')) ||
        (heldClean.includes('passport') && reqLower.includes('passport')) ||
        (heldClean.includes('voter') && reqLower.includes('voter')) ||
        (heldClean.includes('birth') && reqLower.includes('birth'))
      );
    });

    if (hasMatch) {
      matched.push(reqDoc);
    } else {
      missing.push(reqDoc);
    }
  }

  const ratio = requiredDocs.length > 0 ? matched.length / requiredDocs.length : 1.0;
  return { ratio, matched, missing };
}

/**
 * Evaluates a single service against user preferences and generates transparent explanations.
 *
 * @param {Object} service - Service item
 * @param {Object} preferences - Normalized user preferences
 * @param {Object} weights - Configurable scoring weights
 * @returns {Object} Evaluated recommendation result with explainability breakdown
 */
export function evaluateServiceRecommendation(service, preferences, weights = DEFAULT_WEIGHTS) {
  const matchedCriteria = [];
  const unmetRequirements = [];
  const unknownCriteria = [];

  let intentScore = 0;
  let docScore = 0;
  let eligibilityScore = 0;
  let speedScore = 1.0;
  let feeScore = 1.0;

  // 1. Intent Alignment
  const relatedIntents = preferences.intents.filter((intent) => {
    const mappedServices = INTENT_MAPPINGS[intent] || [];
    return mappedServices.includes(service.id);
  });

  if (relatedIntents.length > 0) {
    intentScore = 1.0;
    matchedCriteria.push(`Directly satisfies your selected goal: ${relatedIntents.join(', ').replace(/_/g, ' ')}`);
  } else if (preferences.category && service.category === preferences.category) {
    intentScore = 0.75;
    matchedCriteria.push(`Matches your preferred category: ${service.category}`);
  } else if (preferences.intents.length === 0 && !preferences.category) {
    // Neutral when no intent specified
    intentScore = 0.5;
  } else {
    intentScore = 0.1;
  }

  // 2. Document Readiness
  const docEvaluation = evaluateDocumentReadiness(service.documents || [], preferences.heldDocuments);
  docScore = docEvaluation.ratio;

  if (docEvaluation.matched.length > 0) {
    matchedCriteria.push(
      `You hold ${docEvaluation.matched.length} of ${service.documents?.length || 0} required documents (${docEvaluation.matched.slice(0, 2).join(', ')})`
    );
  }
  if (docEvaluation.missing.length > 0) {
    unmetRequirements.push(
      `Missing prerequisite document(s): ${docEvaluation.missing.slice(0, 2).join('; ')}`
    );
  }

  // 3. Eligibility Criteria Check
  if (service.eligibility && service.eligibility.length > 0) {
    // Age check
    if (service.id === 'voter-id') {
      if (preferences.age !== null) {
        if (preferences.age >= 18) {
          eligibilityScore = 1.0;
          matchedCriteria.push(`Meets minimum voting age requirement (Age ${preferences.age} >= 18)`);
        } else {
          eligibilityScore = 0.0;
          unmetRequirements.push(`Age requirement not met (Requires 18+, user indicated ${preferences.age})`);
        }
      } else {
        eligibilityScore = 0.5;
        unknownCriteria.push('Age requirement (18+) is unknown. Not assumed satisfied.');
      }
    } else if (service.id === 'passport' || service.id === 'ration-card') {
      // Citizenship check
      if (preferences.citizenship !== null) {
        if (preferences.citizenship === 'indian') {
          eligibilityScore = 1.0;
          matchedCriteria.push('Meets Indian citizenship prerequisite');
        } else {
          eligibilityScore = 0.2;
          unmetRequirements.push('Standard application requires Indian citizenship');
        }
      } else {
        eligibilityScore = 0.5;
        unknownCriteria.push('Citizenship criteria not specified. Official verification required.');
      }
    } else {
      eligibilityScore = 0.8;
      matchedCriteria.push('General resident eligibility applies');
    }
  } else {
    eligibilityScore = 0.7;
  }

  // 4. Processing Speed / Urgency
  const speedDays = service.speedDays || 30;
  if (preferences.maxTurnaroundDays !== null) {
    if (speedDays <= preferences.maxTurnaroundDays) {
      speedScore = 1.0;
      matchedCriteria.push(`Estimated duration (${speedDays} days) meets your urgency window (< ${preferences.maxTurnaroundDays} days)`);
    } else {
      speedScore = Math.max(0.2, (preferences.maxTurnaroundDays / speedDays));
      unmetRequirements.push(`Estimated duration (${speedDays} days) exceeds requested turnaround (${preferences.maxTurnaroundDays} days)`);
    }
  }

  // 5. Fee Constraints
  if (preferences.feePreference === 'free_only') {
    if (service.feeType === 'free') {
      feeScore = 1.0;
      matchedCriteria.push('Service is free of government application fees');
    } else {
      feeScore = 0.1;
      unmetRequirements.push(`Official fees apply (${service.fees || 'Paid'}), conflicting with your 'Free Only' preference`);
    }
  } else {
    feeScore = 1.0;
  }

  // Calculate Weighted Match Score
  const rawScore =
    intentScore * weights.intent +
    docScore * weights.documents +
    eligibilityScore * weights.eligibility +
    speedScore * weights.speed +
    feeScore * weights.fees;

  const matchPercentage = Math.round(Math.min(100, Math.max(0, rawScore * 100)));

  // Official verification is always required if missing documents exist or criteria are unknown
  const needsOfficialVerification =
    unmetRequirements.length > 0 ||
    unknownCriteria.length > 0 ||
    service.warnings?.length > 0;

  return {
    serviceId: service.id,
    serviceName: service.name,
    category: service.category,
    department: service.department,
    fees: service.fees,
    processingTime: service.processingTime,
    matchPercentage,
    scores: {
      intent: Number(intentScore.toFixed(2)),
      documents: Number(docScore.toFixed(2)),
      eligibility: Number(eligibilityScore.toFixed(2)),
      speed: Number(speedScore.toFixed(2)),
      fees: Number(feeScore.toFixed(2)),
    },
    matchedCriteria,
    unmetRequirements,
    unknownCriteria,
    needsOfficialVerification,
    disclaimer: RECOMMENDATION_DISCLAIMER,
  };
}

/**
 * Ranks all civic services according to user preferences and returns deterministic recommendations.
 *
 * @param {Object[]} servicesList - Collection of services (defaults to MOCK_SERVICES)
 * @param {Object} rawPreferences - Citizen preferences input
 * @param {Object} customWeights - Custom weight configuration
 * @returns {Object[]} Ranked recommendations with full explainability details
 */
export function rankCivicServices(servicesList = MOCK_SERVICES, rawPreferences = {}, customWeights = DEFAULT_WEIGHTS) {
  const preferences = normalizeUserPreferences(rawPreferences);
  const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

  const evaluated = servicesList.map((service) =>
    evaluateServiceRecommendation(service, preferences, weights)
  );

  // Deterministic multi-tier sort:
  // 1. matchPercentage descending
  // 2. popularityScore descending
  // 3. serviceId alphabetical ascending (strict tie-breaker)
  return evaluated.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    const servA = servicesList.find((s) => s.id === a.serviceId);
    const servB = servicesList.find((s) => s.id === b.serviceId);
    const popA = servA?.popularityScore || 50;
    const popB = servB?.popularityScore || 50;
    if (popB !== popA) {
      return popB - popA;
    }
    return a.serviceId.localeCompare(b.serviceId);
  });
}
