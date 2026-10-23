import { describe, expect, it } from 'vitest';
import {
  buildImportPreview,
  csvTemplate,
  MAX_IMPORT_ROWS,
  parseCsv,
  validateRecord,
} from './serviceImportService';
import { MOCK_SERVICES } from '../data/services';

const HEADER = 'name,shortDescription,category,officialSourceUrl';
const row = (name, category = 'Identity', url = 'https://example.gov.in') =>
  `${name},Short description for ${name},${category},${url}`;

const validJsonService = (overrides = {}) => ({
  name: 'Senior Citizen Card',
  shortDescription: 'Identity card for people aged 60 and above.',
  category: 'Identity',
  officialSources: [{ name: 'Social Justice Dept', url: 'https://socialjustice.gov.in' }],
  ...overrides,
});

describe('parseCsv', () => {
  it('handles quoted commas, escaped quotes, newlines inside quotes and CRLF', () => {
    const rows = parseCsv('a,b\r\n"x, y","say ""hi"""\r\n"line1\nline2",z\r\n');
    expect(rows.map((r) => r.cells)).toEqual([
      ['a', 'b'],
      ['x, y', 'say "hi"'],
      ['line1\nline2', 'z'],
    ]);
  });

  it('reports the line each row starts on, counting newlines inside quotes', () => {
    const rows = parseCsv('h1,h2\n"multi\nline",1\nnext,2\n');
    expect(rows.map((r) => r.line)).toEqual([1, 2, 4]);
  });

  it('strips a UTF-8 BOM and skips blank lines', () => {
    const rows = parseCsv('﻿name\n\nBirth\n\n');
    expect(rows.map((r) => r.cells)).toEqual([['name'], ['Birth']]);
  });

  it('throws on an unclosed quote', () => {
    expect(() => parseCsv('name\n"oops,1\n')).toThrow(/Unclosed quote/);
  });
});

describe('buildImportPreview with CSV', () => {
  it('accepts valid rows and splits pipe separated lists', () => {
    const csv = `${HEADER},eligibility,documents\n${row('Senior Card')},Aged 60+|Resident,Aadhaar|Photo\n`;
    const report = buildImportPreview(csv, { fileName: 'services.csv' });

    expect(report.fileErrors).toEqual([]);
    expect(report.valid).toHaveLength(1);
    const { service } = report.valid[0];
    expect(service.id).toBe('senior-card');
    expect(service.eligibility).toEqual(['Aged 60+', 'Resident']);
    expect(service.documents).toEqual(['Aadhaar', 'Photo']);
    expect(service.officialSources[0].url).toBe('https://example.gov.in');
    expect(service.steps).toEqual([]);
  });

  it('reports invalid rows with their spreadsheet row number and every problem', () => {
    const csv = `${HEADER},speedDays\n${row('Good One')},5\n,,Spaceships,not-a-url,-3\n`;
    const report = buildImportPreview(csv, { fileName: 'x.csv' });

    expect(report.valid).toHaveLength(1);
    expect(report.invalid).toHaveLength(1);
    const { row: rowNum, errors } = report.invalid[0];
    expect(rowNum).toBe(3);
    expect(errors).toEqual(
      expect.arrayContaining([
        'name is required',
        'shortDescription is required',
        expect.stringContaining('category "Spaceships"'),
        expect.stringContaining('not a valid http(s) link'),
        expect.stringContaining('speedDays'),
      ]),
    );
  });

  it('matches category, type, difficulty and feeType case-insensitively', () => {
    const csv = `${HEADER},type,difficulty,feeType\n${row('Card', 'identity')},online,EASY,Paid\n`;
    const { service } = buildImportPreview(csv, { fileName: 'x.csv' }).valid[0];
    expect(service).toMatchObject({ category: 'Identity', type: 'Online', difficulty: 'Easy', feeType: 'paid' });
  });

  it('accepts spaced or snake_case headers and warns about unknown columns', () => {
    const csv = `Name,short_description,Category,Official Source URL,colour\nCard,Desc,Identity,https://a.gov.in,blue\n`;
    const report = buildImportPreview(csv, { fileName: 'x.csv' });
    expect(report.valid).toHaveLength(1);
    expect(report.warnings).toContain('Unknown column "colour" was ignored');
  });

  it('warns that steps are JSON only instead of silently dropping them', () => {
    const csv = `${HEADER},steps\n${row('Card')},do things\n`;
    const report = buildImportPreview(csv, { fileName: 'x.csv' });
    expect(report.warnings[0]).toMatch(/only supported in JSON/);
  });

  it('requires a name column', () => {
    const report = buildImportPreview('title,category\nA,Identity\n', { fileName: 'x.csv' });
    expect(report.fileErrors[0]).toMatch(/"name" column/);
  });

  it('turns an unclosed quote into a file error instead of throwing', () => {
    const report = buildImportPreview(`${HEADER}\n"Broken,Desc,Identity,https://a.gov.in\n`, { fileName: 'x.csv' });
    expect(report.fileErrors[0]).toMatch(/Unclosed quote/);
  });
});

describe('buildImportPreview with JSON', () => {
  it('accepts an array or a { services } object, including steps', () => {
    const steps = [{ title: 'Apply', description: 'Fill the form' }];
    const asArray = buildImportPreview(JSON.stringify([validJsonService({ steps })]), { fileName: 'a.json' });
    const asObject = buildImportPreview(JSON.stringify({ services: [validJsonService()] }), { fileName: 'a.json' });

    expect(asArray.valid[0].service.steps).toEqual(steps);
    expect(asObject.valid).toHaveLength(1);
  });

  it('accepts the flat officialSourceUrl column in JSON too', () => {
    const svc = validJsonService({ officialSources: undefined, officialSourceUrl: 'https://a.gov.in' });
    const report = buildImportPreview(JSON.stringify([svc]), { fileName: 'a.json' });
    expect(report.valid[0].service.officialSources[0].url).toBe('https://a.gov.in');
  });

  it('reports malformed JSON as a file error', () => {
    const report = buildImportPreview('[{"name": "x",]', { fileName: 'a.json' });
    expect(report.fileErrors[0]).toMatch(/^Invalid JSON/);
    expect(report.valid).toEqual([]);
  });

  it('rejects JSON that is not a list of services', () => {
    const report = buildImportPreview('{"name": "x"}', { fileName: 'a.json' });
    expect(report.fileErrors[0]).toMatch(/array of services/);
  });

  it('detects JSON from content when the file has no extension', () => {
    const report = buildImportPreview(JSON.stringify([validJsonService()]), { fileName: 'export' });
    expect(report.format).toBe('json');
    expect(report.valid).toHaveLength(1);
  });

  it('flags bad nested values with the record number', () => {
    const bad = validJsonService({ steps: [{ title: 'Only title' }], eligibility: ['ok', 42], popularityScore: 150 });
    const report = buildImportPreview(JSON.stringify([validJsonService({ name: 'Fine' }), bad]), { fileName: 'a.json' });
    expect(report.invalid[0].row).toBe(2);
    expect(report.invalid[0].errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('steps'),
        expect.stringContaining('eligibility'),
        expect.stringContaining('popularityScore'),
      ]),
    );
  });

  it('warns about http sources and unknown fields but still accepts the record', () => {
    const svc = validJsonService({ officialSources: [{ url: 'http://old.gov.in' }], colour: 'red' });
    const { valid } = buildImportPreview(JSON.stringify([svc]), { fileName: 'a.json' });
    expect(valid[0].warnings).toEqual(['official source uses http instead of https', 'Unknown field "colour" was ignored']);
  });

  it('rejects non-http links such as javascript: URLs', () => {
    const svc = validJsonService({ officialSources: [{ url: 'javascript:alert(1)' }] });
    const { invalid } = buildImportPreview(JSON.stringify([svc]), { fileName: 'a.json' });
    expect(invalid[0].errors[0]).toMatch(/not a valid http\(s\) link/);
  });
});

describe('duplicate detection', () => {
  it('flags services that already exist by id or by normalized name', () => {
    const records = [
      validJsonService({ name: 'Brand New Service' }),
      validJsonService({ name: 'Something Else', id: 'birth-certificate' }),
      validJsonService({ name: '  aadhaar   CARD enrollment ' }),
    ];
    const report = buildImportPreview(JSON.stringify(records), { fileName: 'a.json', existingServices: MOCK_SERVICES });

    expect(report.valid.map((v) => v.service.name)).toEqual(['Brand New Service']);
    expect(report.duplicates.map((d) => d.row)).toEqual([2, 3]);
    expect(report.duplicates[0].reason).toMatch(/id "birth-certificate" already exists/);
    expect(report.duplicates[1].reason).toMatch(/Aadhaar Card Enrollment/);
  });

  it('flags repeats inside the same file and points at the first row', () => {
    const csv = `${HEADER}\n${row('Senior Card')}\n${row('senior-card!')}\n`;
    const report = buildImportPreview(csv, { fileName: 'x.csv' });
    expect(report.valid).toHaveLength(1);
    expect(report.duplicates[0]).toMatchObject({ row: 3, reason: 'same id as row 2 in this file' });
  });

  it('puts every record in exactly one bucket', () => {
    const csv = `${HEADER}\n${row('A')}\n${row('A')}\n,,,\n${row('B', 'Nope')}\n`;
    const report = buildImportPreview(csv, { fileName: 'x.csv' });
    expect(report.valid.length + report.invalid.length + report.duplicates.length).toBe(report.total);
  });
});

describe('limits and empty files', () => {
  it('rejects empty files', () => {
    expect(buildImportPreview('   ', { fileName: 'x.csv' }).fileErrors).toEqual(['The file is empty']);
    expect(buildImportPreview(`${HEADER}\n`, { fileName: 'x.csv' }).fileErrors[0]).toMatch(/No service records/);
  });

  it(`rejects files with more than ${MAX_IMPORT_ROWS} records`, () => {
    const rows = Array.from({ length: MAX_IMPORT_ROWS + 1 }, (_, i) => row(`Service ${i}`));
    const report = buildImportPreview(`${HEADER}\n${rows.join('\n')}`, { fileName: 'x.csv' });
    expect(report.fileErrors[0]).toMatch(/limit is 500/);
    expect(report.valid).toEqual([]);
  });

  it('rejects files over the size limit', () => {
    const report = buildImportPreview(`${HEADER}\n${'x'.repeat(1024 * 1024 + 10)}`, { fileName: 'x.csv' });
    expect(report.fileErrors[0]).toMatch(/larger than/);
  });
});

describe('validateRecord', () => {
  it('rejects non-object records', () => {
    expect(validateRecord('text').errors).toEqual(['Each record must be an object']);
    expect(validateRecord(null).errors).toEqual(['Each record must be an object']);
  });

  it('rejects ids that are not slugs and dates that are not real', () => {
    const { errors } = validateRecord(validJsonService({ id: 'Bad ID!', lastVerified: '2026-13-45' }));
    expect(errors).toEqual(expect.arrayContaining([expect.stringContaining('id "Bad ID!"'), expect.stringContaining('lastVerified')]));
  });
});

describe('csvTemplate', () => {
  it('produces a file that imports cleanly', () => {
    const report = buildImportPreview(csvTemplate(), { fileName: 'template.csv', existingServices: MOCK_SERVICES });
    expect(report.fileErrors).toEqual([]);
    expect(report.warnings).toEqual([]);
    expect(report.valid).toHaveLength(1);
  });
});

describe('stricter checks from the #81 review', () => {
  it('rejects calendar dates that do not exist', () => {
    for (const date of ['2026-02-30', '2026-04-31', '2025-02-29', '2026-00-10']) {
      const { errors } = validateRecord(validJsonService({ lastVerified: date }));
      expect(errors, date).toContainEqual(expect.stringContaining('lastVerified'));
    }
    expect(validateRecord(validJsonService({ lastVerified: '2024-02-29' })).errors).toEqual([]);
  });

  it('rejects lastVerified dates in the future', () => {
    const { errors } = validateRecord(validJsonService({ lastVerified: '2999-01-01' }));
    expect(errors).toContainEqual(expect.stringContaining('future'));
  });

  it('rejects a quote in the middle of an unquoted field instead of swallowing the next rows', () => {
    // Two stray quotes used to pair up and silently merge the rows between them.
    expect(() => parseCsv('name,desc\nTV 5" screen,ok\nnext,row\nTV 7" screen,ok\n')).toThrow(/line 2/);
  });

  it('rejects text after a closing quote', () => {
    expect(() => parseCsv('name\n"abc"def\n')).toThrow(/line 2/);
  });

  it('still accepts properly quoted fields next to each other', () => {
    expect(parseCsv('"a","b ""c""",d\n').map((r) => r.cells)).toEqual([['a', 'b "c"', 'd']]);
  });

  it('reports malformed quoting as a file error with the line number', () => {
    const report = buildImportPreview(`${HEADER}\n${row('Fine')}\nTV 5" screen,desc,Identity,https://a.gov.in\n`, { fileName: 'x.csv' });
    expect(report.fileErrors[0]).toMatch(/line 3/);
    expect(report.valid).toEqual([]);
  });

  it('never marks imported official sources as verified', () => {
    const fromJson = buildImportPreview(
      JSON.stringify([validJsonService({ officialSources: [{ url: 'https://a.gov.in', verified: true }] })]),
      { fileName: 'a.json' },
    );
    const fromCsv = buildImportPreview(`${HEADER}\n${row('Card')}\n`, { fileName: 'x.csv' });

    expect(fromJson.valid[0].service.officialSources[0].verified).toBe(false);
    expect(fromCsv.valid[0].service.officialSources[0].verified).toBe(false);
  });
});
