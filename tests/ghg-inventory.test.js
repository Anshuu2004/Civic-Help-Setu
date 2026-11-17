import { describe, it, expect, beforeEach } from 'vitest';
import {
  createGhgInventoryHandler,
  generateGhgReceiptCode,
  GHG_SUBMISSION_QUEUE,
  resetGhgSubmissionQueueForTests,
  validateGhgSubmissionPayload,
} from '../api/_lib/handlers/ghg-inventory.js';
import { createRateLimiter } from '../api/_lib/abuseGuard.js';

const VALID_TOKEN = 'valid-session-token-123456';

const operator = {
  id: 'user_operator',
  role: 'staff',
  ghgRole: 'operator',
  jurisdictionIds: ['WARD-042'],
};

const payload = (overrides = {}) => ({
  periodId: 'PER-2026-27',
  jurisdictionId: 'WARD-042',
  department: 'Solid Waste Management',
  title: 'FY 2026-27 landfill gate correction',
  idempotencyKey: 'ghg-queue-key-0001',
  correctionNotes: 'Gate total reconciled with the weighbridge log.',
  records: [
    {
      sourceId: 'SRC-WST-01',
      quantity: 7_900,
      unit: 't',
      dataQuality: 'measured',
      correctionNotes: 'Corrected gate total.',
      sourceDocument: {
        name: 'landfill-gate-fy2627.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 400_000,
        sha256: 'a'.repeat(64),
      },
    },
  ],
  ...overrides,
});

const buildHandler = ({
  actor = operator,
  verify = async (token) => {
    if (token !== VALID_TOKEN) throw new Error('invalid');
    return { userId: 'user_operator' };
  },
  resolve = async () => actor,
  summary = async ({ jurisdictionId }) => ({
    available: true,
    summary: {
      periodLabel: 'FY 2025-26',
      jurisdictionName: 'Ward 42 — Indiranagar',
      totals: { tCO2e: 5790.14, measuredTCO2e: 5790.14, estimatedTCO2e: 0 },
    },
    periods: [{ id: 'PER-2025-26', label: 'FY 2025-26' }],
    jurisdictionId,
  }),
  ipLimiter = createRateLimiter({ limit: 100, windowMs: 60_000 }),
} = {}) =>
  createGhgInventoryHandler({
    verifySession: verify,
    resolveActor: resolve,
    getPublishedSummary: summary,
    ipLimiter,
  });

const post = (handler, body = payload(), headers = {}) =>
  handler({
    method: 'POST',
    headers: { 'x-vercel-forwarded-for': '203.0.113.10', ...headers },
    body,
  });

describe('api/ghg-inventory (#753)', () => {
  beforeEach(() => {
    resetGhgSubmissionQueueForTests();
  });

  it('serves the approved public projection over GET without internal identifiers', async () => {
    const handler = buildHandler();
    const response = await handler({
      method: 'GET',
      headers: {},
      query: { jurisdictionId: 'ward-042' },
    });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.available).toBe(true);
    expect(response.body.summary.totals.tCO2e).toBe(5790.14);
    expect(JSON.stringify(response.body)).not.toMatch(/SUB-|ACT-|SRC-|EFV-/);
    expect(response.headers['Cache-Control']).toBe('no-store');
  });

  it('does not leak an unapproved projection when no public summary provider is configured', async () => {
    const handler = createGhgInventoryHandler({
      verifySession: async () => ({ userId: 'user_operator' }),
      resolveActor: async () => operator,
      ipLimiter: createRateLimiter({ limit: 100, windowMs: 60_000 }),
    });
    const response = await handler({ method: 'GET', headers: {}, query: {} });

    expect(response.status).toBe(200);
    expect(response.body.available).toBe(false);
    expect(response.body.disclosure).toContain('after a reviewer approves the period');
  });

  it('rejects unsupported methods with a 405 and an Allow header', async () => {
    const handler = buildHandler();
    const response = await handler({ method: 'DELETE', headers: {}, body: null });

    expect(response.status).toBe(405);
    expect(response.body.error).toBe('method_not_allowed');
    expect(response.headers.Allow).toBe('GET, POST');
  });

  it('requires authentication before validation or queueing', async () => {
    const handler = buildHandler();
    const missing = await post(handler, payload(), { authorization: '' });
    expect(missing.status).toBe(401);
    expect(missing.body.error).toBe('authentication_required');
    expect(GHG_SUBMISSION_QUEUE).toHaveLength(0);

    const invalid = await post(handler, payload(), { authorization: 'Bearer expired-token-12345' });
    expect(invalid.status).toBe(401);
    expect(invalid.body.error).toBe('invalid_token');
    expect(GHG_SUBMISSION_QUEUE).toHaveLength(0);
  });

  it('returns 503 when the server-side session verifier is not configured', async () => {
    const handler = createGhgInventoryHandler({
      ipLimiter: createRateLimiter({ limit: 100, windowMs: 60_000 }),
    });
    const response = await post(handler);
    expect(response.status).toBe(503);
    expect(response.body.error).toBe('auth_not_configured');
  });

  it('rejects a verified role that is not an operator or administrator', async () => {
    const handler = buildHandler({
      actor: { id: 'citizen_1', role: 'citizen', ghgRole: 'citizen', jurisdictionIds: ['WARD-042'] },
    });
    const response = await post(handler, payload(), { authorization: `Bearer ${VALID_TOKEN}` });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('forbidden_role');
    expect(GHG_SUBMISSION_QUEUE).toHaveLength(0);
  });

  it('rejects a jurisdiction outside the verified account assignment', async () => {
    const handler = buildHandler({
      actor: { ...operator, jurisdictionIds: ['WARD-084'] },
    });
    const response = await post(handler, payload(), { authorization: `Bearer ${VALID_TOKEN}` });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('jurisdiction_forbidden');
    expect(response.body.details.some((message) => message.includes('not assigned'))).toBe(true);
    expect(GHG_SUBMISSION_QUEUE).toHaveLength(0);
  });

  it('allows an administrator without a narrow assignment to submit any jurisdiction', async () => {
    const handler = buildHandler({
      actor: { id: 'admin_1', role: 'admin', ghgRole: 'admin', jurisdictionIds: [] },
    });
    const response = await post(
      handler,
      payload({ jurisdictionId: 'WARD-084' }),
      { authorization: `Bearer ${VALID_TOKEN}` }
    );

    expect(response.status).toBe(202);
    expect(response.body.receipt.jurisdictionId).toBe('WARD-084');
  });

  it('queues a valid submission with metadata-only documents and a stable receipt code', async () => {
    const handler = buildHandler();
    const response = await post(handler, payload(), { authorization: `Bearer ${VALID_TOKEN}` });

    expect(response.status).toBe(202);
    expect(response.body.ok).toBe(true);
    expect(response.body.receipt.status).toBe('queued_for_review');
    expect(response.body.receipt.recordCount).toBe(1);
    expect(response.body.receipt.receiptCode).toMatch(/^GHG-[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(response.body.help).toContain('does not affect published totals until a reviewer approves');
    expect(GHG_SUBMISSION_QUEUE).toHaveLength(1);

    const queued = GHG_SUBMISSION_QUEUE[0];
    expect(queued.sourceDocument).toBeUndefined();
    expect(queued.records[0].sourceDocument.storage).toBe('metadata_only');
    expect(queued.records[0].sourceDocument.sha256).toBe('a'.repeat(64));
    expect(queued.verifiedRole).toBe('operator');
    expect(JSON.stringify(queued)).not.toContain('fileData');
    expect(JSON.stringify(queued)).not.toContain(VALID_TOKEN);
  });

  it('replays an idempotent request instead of queueing a duplicate', async () => {
    const handler = buildHandler();
    const first = await post(handler, payload(), { authorization: `Bearer ${VALID_TOKEN}` });
    const second = await post(handler, payload(), { authorization: `Bearer ${VALID_TOKEN}` });

    expect(first.status).toBe(202);
    expect(second.status).toBe(200);
    expect(second.body.replayed).toBe(true);
    expect(second.body.receipt.submissionId).toBe(first.body.receipt.submissionId);
    expect(second.body.receipt.receiptCode).toBe(first.body.receipt.receiptCode);
    expect(GHG_SUBMISSION_QUEUE).toHaveLength(1);
  });

  it('validates the payload on the trusted boundary and returns stable field errors', () => {
    const missing = validateGhgSubmissionPayload({}, operator);
    expect(missing.some((message) => message.includes('periodId'))).toBe(true);
    expect(missing.some((message) => message.includes('records'))).toBe(true);

    const badUnit = validateGhgSubmissionPayload(
      payload({ records: [{ sourceId: 'SRC-WST-01', quantity: 1, unit: 'bogus', dataQuality: 'measured' }] }),
      operator
    );
    expect(badUnit.some((message) => message.includes('unit must be one of'))).toBe(true);

    const duplicate = validateGhgSubmissionPayload(
      payload({
        records: [
          { sourceId: 'SRC-WST-01', quantity: 1, unit: 't', dataQuality: 'measured' },
          { sourceId: 'SRC-WST-01', quantity: 2, unit: 't', dataQuality: 'measured' },
        ],
      }),
      operator
    );
    expect(duplicate.some((message) => message.includes('repeats a source'))).toBe(true);

    const countedTwice = validateGhgSubmissionPayload(
      payload({
        records: [
          {
            sourceId: 'SRC-WST-01',
            quantity: 1,
            unit: 't',
            dataQuality: 'measured',
            sourceDocument: { name: 'x.pdf', fileData: 'JVBERi0xLjQK' },
          },
        ],
      }),
      operator
    );
    expect(countedTwice.some((message) => message.includes('metadata only'))).toBe(true);

    const residentData = validateGhgSubmissionPayload(
      payload({ correctionNotes: 'Call the resident on 9876543210 before publishing.' }),
      operator
    );
    expect(residentData.some((message) => message.includes('phone number'))).toBe(true);

    const undeclaredAttachment = validateGhgSubmissionPayload(
      payload({ attachment: { name: 'receipt.pdf', data: 'AAA' } }),
      operator
    );
    expect(undeclaredAttachment.some((message) => message.includes('Attachments are not accepted'))).toBe(true);
  });

  it('returns 422 for an invalid payload and does not queue it', async () => {
    const handler = buildHandler();
    const response = await post(
      handler,
      payload({ records: [] }),
      { authorization: `Bearer ${VALID_TOKEN}` }
    );

    expect(response.status).toBe(422);
    expect(response.body.error).toBe('validation_failed');
    expect(response.body.details.some((message) => message.includes('records'))).toBe(true);
    expect(GHG_SUBMISSION_QUEUE).toHaveLength(0);
  });

  it('returns 400 for malformed JSON before validation', async () => {
    const handler = buildHandler();
    const response = await post(handler, '{"periodId":', { authorization: `Bearer ${VALID_TOKEN}` });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('validation_failed');
    expect(response.body.details[0]).toContain('Malformed JSON');
  });

  it('rejects an oversized payload before authentication', async () => {
    const handler = buildHandler();
    const oversized = payload({ correctionNotes: 'x'.repeat(300 * 1024) });
    const response = await post(handler, oversized, {});

    expect(response.status).toBe(413);
    expect(response.body.error).toBe('payload_too_large');
    expect(GHG_SUBMISSION_QUEUE).toHaveLength(0);
  });

  it('rate limits repeated submissions for the same verified address', async () => {
    const handler = buildHandler({
      ipLimiter: createRateLimiter({ limit: 1, windowMs: 60_000 }),
    });
    const first = await post(handler, payload(), { authorization: `Bearer ${VALID_TOKEN}` });
    const second = await post(
      handler,
      payload({ idempotencyKey: 'ghg-queue-key-0002' }),
      { authorization: `Bearer ${VALID_TOKEN}` }
    );

    expect(first.status).toBe(202);
    expect(second.status).toBe(429);
    expect(second.body.error).toBe('rate_limited');
    expect(second.headers['Retry-After']).toBeTruthy();
    expect(GHG_SUBMISSION_QUEUE).toHaveLength(1);
  });

  it('generates a deterministic receipt code from jurisdiction, key and time', () => {
    const first = generateGhgReceiptCode('WARD-042', 'key-0001', '2026-11-17T00:00:00.000Z');
    const same = generateGhgReceiptCode('WARD-042', 'key-0001', '2026-11-17T00:00:00.000Z');
    const other = generateGhgReceiptCode('WARD-042', 'key-0002', '2026-11-17T00:00:00.000Z');

    expect(first).toBe(same);
    expect(first).not.toBe(other);
    expect(first).toMatch(/^GHG-[0-9A-F]{4}-[0-9A-F]{4}$/);
  });
});
