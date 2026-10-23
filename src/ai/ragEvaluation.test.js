import { describe, it, expect, beforeEach } from 'vitest';
import { ragIndex, tokenizeText, chunkService } from './ragIngestionService';
import { retrieveGroundedChunks, MIN_CONFIDENCE_THRESHOLD } from './sourceGroundedRetriever';
import { askGroundedCivicAssistant, MANDATORY_LEGAL_DISCLAIMER } from './groundedCivicAssistant';

describe('Source-Grounded Retrieval and Civic Assistant Evaluation (#77)', () => {
  beforeEach(() => {
    // Re-index standard knowledge base before tests
    ragIndex.buildIndex();
  });

  describe('Document Ingestion and Tokenization', () => {
    it('tokenizes text, removes punctuation and filters English stop words', () => {
      const text = 'What are the official documents required for a Passport application?';
      const tokens = tokenizeText(text);

      expect(tokens).toContain('official');
      expect(tokens).toContain('documents');
      expect(tokens).toContain('required');
      expect(tokens).toContain('passport');
      expect(tokens).toContain('application');
      expect(tokens).not.toContain('what');
      expect(tokens).not.toContain('are');
      expect(tokens).not.toContain('the');
      expect(tokens).not.toContain('for');
    });

    it('chunks services into structured sections with source metadata', () => {
      const mockService = {
        id: 'test-voter-id',
        name: 'Voter ID Card',
        shortDescription: 'National electoral photo identity card',
        category: 'Elections',
        department: 'Election Commission of India',
        eligibility: ['Indian citizen aged 18 or above'],
        documents: ['Age proof (Birth cert / 10th marksheet)', 'Address proof'],
        steps: [{ title: 'Fill Form 6', description: 'Submit via NVSP portal' }],
        fees: 'Free of cost',
        processingTime: '15-30 days',
        officialSources: [{ name: 'ECI Portal', url: 'https://voters.eci.gov.in', verified: true }],
        lastVerified: '2024-03-15',
      };

      const chunks = chunkService(mockService);
      expect(chunks.length).toBeGreaterThanOrEqual(5);

      const sectionTypes = chunks.map((c) => c.sectionType);
      expect(sectionTypes).toContain('overview');
      expect(sectionTypes).toContain('eligibility');
      expect(sectionTypes).toContain('documents');
      expect(sectionTypes).toContain('procedure');
      expect(sectionTypes).toContain('fees_timeline');

      for (const chunk of chunks) {
        expect(chunk.serviceId).toBe('test-voter-id');
        expect(chunk.officialSource.url).toBe('https://voters.eci.gov.in');
        expect(chunk.lastVerified).toBe('2024-03-15');
      }
    });

    it('dynamically re-indexes knowledge base when service content changes', () => {
      const initialStats = ragIndex.getStats();

      const newService = {
        id: 'new-space-mission-pass',
        name: 'Space Mission Observation Pass',
        shortDescription: 'ISRO launch viewing gallery pass registration',
        category: 'Science',
        department: 'ISRO',
        fees: 'Free',
        processingTime: 'Instant',
        officialSources: [{ name: 'ISRO Portal', url: 'https://lvg.shar.gov.in', verified: true }],
      };

      ragIndex.buildIndex([newService], []);
      const newStats = ragIndex.getStats();

      expect(newStats.totalChunks).toBeLessThan(initialStats.totalChunks);

      // Verify immediate retrievability of the newly indexed service
      const res = retrieveGroundedChunks('ISRO launch viewing pass');
      expect(res.grounded).toBe(true);
      expect(res.primaryServiceId).toBe('new-space-mission-pass');

      // Restore full index for subsequent tests
      ragIndex.buildIndex();
    });
  });

  describe('Retrieval Relevance and Scoring', () => {
    beforeEach(() => {
      ragIndex.buildIndex();
    });

    it('retrieves relevant chunks for standard civic service queries', () => {
      const result = retrieveGroundedChunks('What documents are required for Aadhaar card?');

      expect(result.grounded).toBe(true);
      expect(result.confidenceScore).toBeGreaterThanOrEqual(MIN_CONFIDENCE_THRESHOLD);
      expect(result.retrievedChunks.length).toBeGreaterThan(0);

      const docChunk = result.retrievedChunks.find((c) => c.sectionType === 'documents');
      expect(docChunk).toBeDefined();
      expect(docChunk.content.toLowerCase()).toContain('proof');
    });

    it('rejects unsupported, fictitious, or out-of-scope inquiries', () => {
      const unsupportedQuery = 'How do I claim my free government Ferrari and Bitcoin tokens?';
      const result = retrieveGroundedChunks(unsupportedQuery);

      expect(result.grounded).toBe(false);
      expect(result.confidenceScore).toBeLessThan(MIN_CONFIDENCE_THRESHOLD);
    });

    it('correctly associates official government portal source URLs', () => {
      const result = retrieveGroundedChunks('New Passport application process');

      expect(result.grounded).toBe(true);
      expect(result.sources.length).toBeGreaterThan(0);

      const sourceUrls = result.sources.map((s) => s.url);
      expect(sourceUrls.some((url) => url.includes('.gov.in') || url.includes('.nic.in'))).toBe(true);
    });
  });

  describe('Grounded Civic Assistant Output & Legal Disclosures', () => {
    beforeEach(() => {
      ragIndex.buildIndex();
    });
    it('generates grounded answers with sources and legal disclaimers', async () => {
      const response = await askGroundedCivicAssistant('How much are the fees for Birth Certificate?');

      expect(response.status).toBe('success');
      expect(response.grounded).toBe(true);
      expect(response.data.disclaimer).toBe(MANDATORY_LEGAL_DISCLAIMER);
      expect(response.data.officialSources.length).toBeGreaterThan(0);
      expect(response.retrievedChunks.length).toBeGreaterThan(0);
    });

    it('explicitly discloses when a user inquiry has no verified official source', async () => {
      const response = await askGroundedCivicAssistant('Can I get subsidized luxury airline tickets?');

      expect(response.status).toBe('unsupported');
      expect(response.grounded).toBe(false);
      expect(response.data.title).toContain('No Verified Government Source Found');
      expect(response.data.missingInformationNotice).toContain('Missing or unsupported claims');
      expect(response.data.disclaimer).toBe(MANDATORY_LEGAL_DISCLAIMER);
    });

    it('safely handles empty queries', async () => {
      const response = await askGroundedCivicAssistant('   ');

      expect(response.status).toBe('error');
      expect(response.grounded).toBe(false);
      expect(response.data.title).toBe('Empty Query');
    });
  });
});
