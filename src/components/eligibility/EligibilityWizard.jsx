import { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import { getEligibilityRuleForService } from '../../data/eligibilityRules';
import EligibilityBadge from './EligibilityBadge';

const EligibilityWizard = ({ serviceId, staticCriteria = [], onApplyClick }) => {
  const rule = getEligibilityRuleForService(serviceId);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  // If no dynamic rule exists, show fallback structured checklist
  if (!rule) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {staticCriteria.map((item, idx) => (
            <li key={idx} style={{ listStyleType: 'disc' }}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  const questions = rule.questions;
  const currentQuestion = questions[currentStep];

  const handleSelectOption = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Evaluate all answers
      const evalResult = rule.evaluate(answers);
      setResult(evalResult);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
    setCurrentStep(0);
  };

  return (
    <div
      className="card"
      style={{
        padding: '2rem',
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-light)',
        borderRadius: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-main)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Interactive Assessment
          </span>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '0.2rem' }}>
            Check If You Qualify
          </h3>
        </div>
        <EligibilityBadge status={result ? result.status : 'not-checked'} size="large" />
      </div>

      {result ? (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '1rem',
              background:
                result.status === 'eligible'
                  ? 'rgba(16, 185, 129, 0.1)'
                  : result.status === 'conditional'
                  ? 'rgba(245, 158, 11, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${
                result.status === 'eligible'
                  ? 'rgba(16, 185, 129, 0.25)'
                  : result.status === 'conditional'
                  ? 'rgba(245, 158, 11, 0.25)'
                  : 'rgba(239, 68, 68, 0.25)'
              }`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {result.status === 'eligible' && <CheckCircle2 size={24} color="var(--success, #10b981)" />}
              {result.status === 'conditional' && <AlertTriangle size={24} color="var(--warning, #f59e0b)" />}
              {result.status === 'ineligible' && <XCircle size={24} color="var(--error, #ef4444)" />}
              <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {result.title}
              </h4>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.975rem', lineHeight: '1.6' }}>
              {result.message}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}
            >
              <RotateCcw size={16} /> Retake Assessment
            </button>

            {result.status === 'eligible' && onApplyClick && (
              <button
                type="button"
                onClick={onApplyClick}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem' }}
              >
                <span>Proceed to Fast-Track Apply</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(((currentStep + 1) / questions.length) * 100)}% Complete</span>
          </div>

          <div style={{ width: '100%', height: '4px', background: 'var(--border-light)', borderRadius: '99px', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div
              style={{
                width: `${((currentStep + 1) / questions.length) * 100}%`,
                height: '100%',
                background: 'var(--accent-main)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* Question Prompt */}
          <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            {currentQuestion.prompt}
          </h4>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {currentQuestion.options.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.value)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '0.875rem',
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--glass-bg-subtle)',
                    border: isSelected ? '1px solid var(--accent-main)' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: isSelected ? '5px solid var(--accent-main)' : '2px solid var(--text-tertiary)',
                      background: isSelected ? 'var(--bg-main)' : 'transparent',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: isSelected ? '600' : '500',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="btn btn-secondary"
              style={{
                padding: '0.6rem 1.25rem',
                fontSize: '0.875rem',
                opacity: currentStep === 0 ? 0.3 : 1,
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <ArrowLeft size={16} /> Previous
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="btn btn-primary"
              style={{
                padding: '0.6rem 1.5rem',
                fontSize: '0.95rem',
                opacity: !answers[currentQuestion.id] ? 0.4 : 1,
                cursor: !answers[currentQuestion.id] ? 'not-allowed' : 'pointer',
              }}
            >
              <span>{currentStep === questions.length - 1 ? 'Analyze Eligibility' : 'Next Step'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EligibilityWizard;
