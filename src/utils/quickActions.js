// Intent-based shortcuts shown on the home page. Every `to` must be a path
// that is registered in src/App.jsx (checked by QuickActionPanel.test.jsx).
export const QUICK_ACTIONS = [
  { id: 'find-service', to: '/services', label: 'Find the right service', hint: 'Browse step-by-step guides for any government service.' },
  { id: 'check-eligibility', to: '/eligibility', label: 'Check if I qualify', hint: 'Answer a few questions to see which schemes you may be eligible for.' },
  { id: 'locate-office', to: '/nearby', label: 'Find an office near me', hint: 'Locate government offices around your location.' },
  { id: 'track-application', to: '/track', label: 'Track my application', hint: 'Follow the progress of an application you have made.' },
  { id: 'continue-saved', to: '/saved', label: 'Continue where I left off', hint: 'Return to the services you saved. Requires sign in.' },
  { id: 'keep-documents', to: '/vault', label: 'Keep my documents ready', hint: 'Open your document vault. Requires sign in.' },
];
