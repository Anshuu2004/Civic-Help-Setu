import { describe, it, expect, beforeEach } from 'vitest';
import {
  resolveTaskOrder,
  validateJourneyDefinition,
  detectCyclesInTasks,
  computeJourneyProgress,
  saveJourneyProgress,
  loadJourneyProgress,
  resetJourneyProgress,
} from './journeyDependencyEngine.js';
import { CIVIC_JOURNEY_TEMPLATES } from '../data/civicJourneyTemplates.js';

describe('Multi-Service Journey Planner & Dependency Engine (#79)', () => {
  beforeEach(() => {
    resetJourneyProgress('test-journey');
    resetJourneyProgress('overseas-higher-education');
  });

  describe('Validation and Graph Integrity', () => {
    it('validates standard templates without any integrity errors', () => {
      for (const journey of CIVIC_JOURNEY_TEMPLATES) {
        const validation = validateJourneyDefinition(journey);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
        expect(validation.hasCycle).toBe(false);
      }
    });

    it('detects missing or invalid prerequisite task references', () => {
      const invalidJourney = {
        id: 'bad-journey',
        title: 'Bad Prereq',
        tasks: [
          { id: 'task-1', title: 'Task 1', prerequisites: ['non-existent-task-id'] },
        ],
      };

      const validation = validateJourneyDefinition(invalidJourney);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some((e) => e.includes('non-existent prerequisite'))).toBe(true);
    });

    it('detects immediate circular dependencies (A -> B -> A)', () => {
      const cyclicJourney = {
        id: 'cycle-journey',
        title: 'Cycle Journey',
        tasks: [
          { id: 'task-a', title: 'Task A', prerequisites: ['task-b'] },
          { id: 'task-b', title: 'Task B', prerequisites: ['task-a'] },
        ],
      };

      const validation = validateJourneyDefinition(cyclicJourney);
      expect(validation.isValid).toBe(false);
      expect(validation.hasCycle).toBe(true);
      expect(validation.cyclePath.length).toBeGreaterThanOrEqual(2);
      expect(() => resolveTaskOrder(cyclicJourney.tasks)).toThrow(/Cannot resolve task order/);
    });

    it('detects indirect 3-step circular dependencies (A -> B -> C -> A)', () => {
      const tasks = [
        { id: 'node-1', prerequisites: ['node-3'] },
        { id: 'node-2', prerequisites: ['node-1'] },
        { id: 'node-3', prerequisites: ['node-2'] },
      ];

      const cycle = detectCyclesInTasks(tasks);
      expect(cycle.hasCycle).toBe(true);
      expect(cycle.cyclePath).toBeDefined();
    });

    it('detects self-referencing circular dependency', () => {
      const selfLoopJourney = {
        id: 'loop-journey',
        title: 'Self loop',
        tasks: [{ id: 'task-self', title: 'Self', prerequisites: ['task-self'] }],
      };

      const validation = validateJourneyDefinition(selfLoopJourney);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some((e) => e.includes('cannot depend on itself'))).toBe(true);
    });
  });

  describe('Topological Task Ordering', () => {
    it('orders tasks such that prerequisites strictly precede dependent tasks', () => {
      const journey = CIVIC_JOURNEY_TEMPLATES[0]; // overseas education
      const ordered = resolveTaskOrder(journey.tasks);

      expect(ordered).toHaveLength(journey.tasks.length);

      const positionMap = new Map();
      ordered.forEach((task, index) => {
        positionMap.set(task.id, index);
      });

      // Verify for every task, all prerequisites appear BEFORE it in ordered list
      for (const task of ordered) {
        const taskPos = positionMap.get(task.id);
        for (const prereqId of task.prerequisites || []) {
          const prereqPos = positionMap.get(prereqId);
          expect(prereqPos).toBeLessThan(taskPos);
        }
      }

      // In Overseas Education: Birth Certificate must come before Aadhaar, which comes before Passport
      expect(positionMap.get('task-birth-cert')).toBeLessThan(positionMap.get('task-aadhaar-update'));
      expect(positionMap.get('task-aadhaar-update')).toBeLessThan(positionMap.get('task-passport'));
    });

    it('safely handles empty or null task lists', () => {
      expect(resolveTaskOrder([])).toEqual([]);
      expect(resolveTaskOrder(null)).toEqual([]);
    });
  });

  describe('Progress Calculation and Actionable Steps', () => {
    it('marks 0-prerequisite tasks as actionable initially when no tasks are completed', () => {
      const journey = CIVIC_JOURNEY_TEMPLATES[0];
      const progress = computeJourneyProgress(journey, []);

      expect(progress.percentComplete).toBe(0);
      expect(progress.completedCount).toBe(0);
      expect(progress.isFullyComplete).toBe(false);

      // Only task-birth-cert has 0 prerequisites, so only it is actionable
      expect(progress.nextActionableTasks.map((t) => t.id)).toEqual(['task-birth-cert']);

      // Dependent tasks are locked
      const passportStatus = progress.orderedTasks.find((t) => t.id === 'task-passport');
      expect(passportStatus.status).toBe('locked');
      expect(passportStatus.unmetPrerequisites.length).toBeGreaterThan(0);
    });

    it('unlocks subsequent dependent tasks when prerequisites are completed', () => {
      const journey = CIVIC_JOURNEY_TEMPLATES[0];

      // Mark birth cert as completed
      const progress1 = computeJourneyProgress(journey, ['task-birth-cert']);
      expect(progress1.percentComplete).toBe(25);
      expect(progress1.nextActionableTasks.map((t) => t.id)).toContain('task-aadhaar-update');

      // Mark all prerequisites for passport as completed
      const progressAll = computeJourneyProgress(journey, [
        'task-birth-cert',
        'task-aadhaar-update',
        'task-pan-card',
        'task-passport',
      ]);
      expect(progressAll.percentComplete).toBe(100);
      expect(progressAll.isFullyComplete).toBe(true);
      expect(progressAll.nextActionableTasks).toHaveLength(0);
    });
  });

  describe('State Persistence Lifecycle', () => {
    it('persists, retrieves, and resets journey progress', () => {
      const journeyId = 'test-journey';
      const completed = ['task-birth-cert', 'task-aadhaar-update'];

      saveJourneyProgress(journeyId, completed);
      const loaded = loadJourneyProgress(journeyId);
      expect(loaded).toEqual(completed);

      resetJourneyProgress(journeyId);
      expect(loadJourneyProgress(journeyId)).toEqual([]);
    });
  });
});
