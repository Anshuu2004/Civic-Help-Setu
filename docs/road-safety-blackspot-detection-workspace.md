# Road-Safety Blackspot Detection & Evidence Review Dashboard (#769)

## 1. Problem Statement & Indian Civic Context
Road crashes in India account for over 150,000 fatalities annually, representing a severe public health and infrastructure crisis. The **Ministry of Road Transport and Highways (MoRTH)** and the **Indian Road Congress (IRC SP:88 - Road Safety Audit Manual)** define a road blackspot as:
> *"A road location or 500-meter corridor where either 5 road accidents involving fatalities/grievous injuries, or 10 fatalities, have occurred during the last 3 calendar years."*

Municipal corporations, state public works departments (PWD), and national highway authorities frequently struggle with:
1. Fragmented crash reporting across traffic police jurisdictions and civic engineering departments.
2. Incomplete traffic volume exposure data (Average Daily Traffic - ADT), causing planners to conflate raw accident frequency with true exposure risk.
3. Lack of transparent evidence tracking linking physical road defects (e.g., non-functional lighting, missing pedestrian refuges, acute blind curves) to countermeasure engineering.
4. Ad-hoc, unmonitored interventions without documented pre- and post-intervention crash reduction measurements.

Civic Help Setu introduces this dedicated **Road-Safety Blackspot Detection & Evidence Review Dashboard** as a high-integrity analytics workspace that bridges public data, citizen hazard reporting, multidisciplinary site inspections, and accountable engineering countermeasures.

---

## 2. Core Invariants & Ethical Guardrails

### Invariant 1: Non-Fault Attribution Mandate
The platform strictly analyzes spatial, infrastructure, geometric, and aggregate exposure factors.
> **Ethical Guardrail:** *Civic Help Setu never infers individual fault, driver liability, or personal responsibility. All automated prioritization requires human site inspection and multidisciplinary engineering review before executing civic interventions.*

### Invariant 2: Explainable, Versioned AI & Deterministic Fallback
Every automated risk run records:
- `rulesetVersion`: e.g. `MoRTH-IRC-SP88-v1.2`.
- `runTimestamp`: ISO timestamp of model execution.
- Factor contribution breakdown (frequency points, severity weighting, infrastructure hazard penalty, exposure adjustment).
- Deterministic execution: If external model services are unavailable, the local mathematical scoring engine functions completely offline without degradation.

### Invariant 3: Human Oversight of the Finite State Machine
No automated algorithm may mark an intervention completed or dismiss a candidate blackspot autonomously. An authorized safety auditor or engineer must inspect the site, enter findings, and record justification for any transition.

### Invariant 4: Privacy & Public Data Minimization
- Only aggregated crash figures are published.
- Victim personal details, names, vehicle registration numbers, and medical reports are completely excluded from the schema.
- Citizen hazard reports are sanitized via `sanitizePlainText` and scrubbed for PII (phone numbers, Aadhaar, PAN, emails) via `minimizeForExternal`.

---

## 3. Data Schema & Normalized Entities

Defined in `src/data/roadSafetyContract.js`:

| Entity | Primary Attributes | Constraints & Purpose |
| :--- | :--- | :--- |
| **`RoadSegment`** | `id`, `code`, `name`, `jurisdiction` (state, district, ward, zone), `startCoords`, `endCoords`, `lengthMeters`, `roadType`, `speedLimitKmph`, `carriagewayWidthMeters`, `surfaceType`, `medianPresent`. | Normalized road corridor reference. |
| **`CrashAggregate`** | `id`, `segmentId`, `periodStart`, `periodEnd`, `fatalCount`, `severeInjuryCount`, `minorInjuryCount`, `propertyDamageCount`, `totalCrashes`, `trafficVolumeADT`, `exposureDenominator`, `sourceAgency`, `sourceNoticeUrl`. | Foreign key to `RoadSegment`. Verified government statistics. |
| **`HazardReport`** | `id`, `segmentId`, `hazardType`, `severity`, `description`, `locationHint`, `reporterRole`, `reportedAt`, `status`. | Citizen and patrol reports. Rate-limited and sanitized. |
| **`RoadFeature`** | `id`, `segmentId`, `lightingQuality`, `crossingType`, `speedCalming`, `pedestrianFootpath`, `blindCurve`, `surfaceCondition`, `lastAuditedAt`. | Physical environment audit. |
| **`RiskRun`** | `id`, `runTimestamp`, `rulesetVersion`, `featureWindowStart`, `featureWindowEnd`, `totalSegmentsEvaluated`, `algorithmWeights`, `executedBy`. | Audit record of the calculation run. |
| **`ReviewCase`** | `id`, `segmentId`, `riskRunId`, `compositeRiskScore`, `severityWeightedFrequency`, `exposureRatePerMillionVkm`, `confidenceLevel`, `exposureUncertainty`, `primaryRiskFactors`, `status`, `assignedOfficer`, `reviewNotes`, `inspectionRecords`, `interventionRecords`. | Core review unit governed by the State Machine. |
| **`InterventionRecord`**| `id`, `reviewCaseId`, `segmentId`, `interventionType`, `description`, `targetCompletionDate`, `completedDate`, `costEstimateInr`, `contractor`, `outcomeEvaluation`. | Countermeasure tracking and before/after verification. |

---

## 4. Mathematical Formulations

### 1. MoRTH Weighted Crash Severity ($F$)
Following standard Indian highway safety severity weighting:
$$F = (5.0 \times \text{Fatal}) + (3.0 \times \text{Severe Injury}) + (1.0 \times \text{Minor Injury}) + (0.2 \times \text{Property Damage})$$

### 2. Exposure-Adjusted Crash Rate ($R$)
When average daily traffic (ADT) or million vehicle-kilometers (MVKM) is available:
$$R = \frac{F}{\text{Exposure Denominator (MVKM)}}$$
If exposure census is unavailable:
- Rate is flagged as `null`.
- `exposureUncertainty` is set to `true`.
- The UI explicitly renders an *"Uncertain (Estimated Baseline)"* warning rather than fabricating precision.

### 3. Infrastructure Hazard Penalty ($H$)
Evaluated out of 30 points:
- Unlit night corridor: $+8$
- Poor illumination: $+5$
- No pedestrian crossing on high-speed ($\ge 60$ km/h) road: $+8$
- Uncontrolled zebra crossing on $\ge 70$ km/h road: $+6$
- Blind curve / sightline obstruction: $+5$
- Deteriorated pavement / potholes: $+5$
- Absence of speed calming on $\ge 65$ km/h road: $+4$
- Active citizen hazard reports: $+2$ each (up to $+6$)

### 4. Composite Risk Score ($S$)
Normalized to a 0–100 scale:
$$S = (w_{\text{freq}} \times N_{\text{freq}}) + (w_{\text{sev}} \times N_{\text{sev}}) + (w_{\text{infra}} \times N_{\text{infra}}) + (w_{\text{expo}} \times N_{\text{expo}})$$
Default weights: $w_{\text{freq}} = 0.35$, $w_{\text{sev}} = 0.35$, $w_{\text{infra}} = 0.20$, $w_{\text{expo}} = 0.10$.

---

## 5. Domain State Machine

```
[Candidate Hotspot]
       │
       ├──► [Inspection Scheduled] ──► [Site Inspected] ──► [Intervention Planned]
       │            │                         │                     │
       │            ▼                         ▼                     ▼
       │      [Deferred]              [Deferred]             [In Progress]
       │            ▲                         ▲                     │
       ▼            │                         │                     ▼
[Dismissed / FP] ───┴─────────────────────────┴────────────── [Monitoring]
                                                                    │
                                                                    ▼
                                                               [Resolved]
```

Allowed transitions are strictly validated in `src/services/roadSafetyBlackspotService.js` via `ALLOWED_STATE_TRANSITIONS`. Invalid transitions throw `Error: Invalid state transition`.

---

## 6. Access Control & Permissions

Registered in `src/services/accessControl.js`:
- `'roadSafety.review'`: Required for transitioning review cases, documenting site inspections, and recording countermeasures. Restricted to `admin` / certified safety officers.
- `'roadSafety.admin'`: Required for configuring algorithm factor weights and executing automated risk assessment runs.
- **Public / Citizen Access:** Anyone can view public corridors and submit hazard reports, guarded by anti-abuse rate limits (maximum 5 submissions per 15-minute window).

---

## 7. Testing & Verification Guide

Run targeted unit and component tests:
```bash
# Service layer & math logic tests
npx vitest run src/services/roadSafetyBlackspotService.test.js

# UI & Component modal workflow tests
npx vitest run src/pages/RoadSafetyDashboard.test.jsx

# Access control integration tests
npx vitest run src/services/accessControl.test.js

# Build production bundle
npm run build
```

