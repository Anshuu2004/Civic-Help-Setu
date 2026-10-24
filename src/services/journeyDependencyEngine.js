/**
 * Multi-Service Application Journey Planner & Dependency Engine (#79)
 * Represents multi-step civic journeys as Directed Acyclic Graphs (DAGs),
 * resolves topological prerequisite ordering, detects circular dependencies,
 * and manages persistence of citizen journey progress.
 */

const STORAGE_PREFIX = 'civic_journey_progress_';

/**
 * Validates a journey definition for reference integrity and cycles.
 *
 * @param {Object} journey - Journey object containing id, title, and tasks array
 * @returns {Object} Validation result { isValid, errors, hasCycle, cyclePath }
 */
export function validateJourneyDefinition(journey) {
  if (!journey || typeof journey !== 'object') {
    return { isValid: false, errors: ['Journey definition is null or not an object'], hasCycle: false };
  }

  const tasks = Array.isArray(journey.tasks) ? journey.tasks : [];
  if (tasks.length === 0) {
    return { isValid: false, errors: ['Journey contains no tasks'], hasCycle: false };
  }

  const errors = [];
  const taskIds = new Set(tasks.map((t) => t.id));

  // Check for duplicate task IDs
  const seenIds = new Set();
  for (const task of tasks) {
    if (!task.id) {
      errors.push('Task is missing an ID');
      continue;
    }
    if (seenIds.has(task.id)) {
      errors.push(`Duplicate task ID detected: ${task.id}`);
    }
    seenIds.add(task.id);

    // Check that all declared prerequisites exist in the journey
    const prerequisites = Array.isArray(task.prerequisites) ? task.prerequisites : [];
    for (const prereqId of prerequisites) {
      if (!taskIds.has(prereqId)) {
        errors.push(`Task "${task.id}" references non-existent prerequisite: "${prereqId}"`);
      }
      if (prereqId === task.id) {
        errors.push(`Task "${task.id}" cannot depend on itself (self-cycle)`);
      }
    }
  }

  // Check for circular dependencies using DFS graph cycle detection
  const cycleDetection = detectCyclesInTasks(tasks);
  if (cycleDetection.hasCycle) {
    errors.push(`Circular dependency detected in tasks: ${cycleDetection.cyclePath.join(' -> ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    hasCycle: cycleDetection.hasCycle,
    cyclePath: cycleDetection.cyclePath || [],
  };
}

/**
 * Detects cycles in task dependencies using depth-first search graph coloring.
 * @param {Object[]} tasks - List of tasks
 * @returns {Object} { hasCycle: boolean, cyclePath: string[] }
 */
export function detectCyclesInTasks(tasks = []) {
  const adjList = new Map();
  for (const t of tasks) {
    adjList.set(t.id, Array.isArray(t.prerequisites) ? t.prerequisites : []);
  }

  // 0: unvisited, 1: visiting (in current recursion stack), 2: visited
  const state = new Map();
  const parent = new Map();
  let cycleNodes = null;

  function dfs(node, pathStack = []) {
    state.set(node, 1);
    pathStack.push(node);

    const neighbors = adjList.get(node) || [];
    for (const neighbor of neighbors) {
      if (!adjList.has(neighbor)) continue; // Handled by reference validation

      if (state.get(neighbor) === 1) {
        // Cycle detected!
        const cycleStartIndex = pathStack.indexOf(neighbor);
        cycleNodes = [...pathStack.slice(cycleStartIndex), neighbor];
        return true;
      }

      if (!state.get(neighbor)) {
        if (dfs(neighbor, pathStack)) {
          return true;
        }
      }
    }

    pathStack.pop();
    state.set(node, 2);
    return false;
  }

  for (const task of tasks) {
    if (!state.get(task.id)) {
      if (dfs(task.id, [])) {
        return { hasCycle: true, cyclePath: cycleNodes };
      }
    }
  }

  return { hasCycle: false, cyclePath: [] };
}

/**
 * Resolves a valid topological ordering of tasks (Kahn's Algorithm).
 * Tasks with 0 prerequisites come first; dependent tasks follow after their prerequisites.
 *
 * @param {Object[]} tasks - Array of task definitions
 * @returns {Object[]} Ordered list of tasks in executable sequence
 * @throws {Error} If circular dependency is present or input is invalid
 */
export function resolveTaskOrder(tasks = []) {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];

  const validation = validateJourneyDefinition({ id: 'dynamic', tasks });
  if (!validation.isValid) {
    throw new Error(`Cannot resolve task order: ${validation.errors.join('; ')}`);
  }

  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  // inDegree: number of unresolved prerequisites this task has
  const inDegree = new Map();
  // graph: prereqId -> list of tasks that depend on it
  const dependentsGraph = new Map();

  for (const task of tasks) {
    inDegree.set(task.id, (task.prerequisites || []).length);
    if (!dependentsGraph.has(task.id)) {
      dependentsGraph.set(task.id, []);
    }
  }

  for (const task of tasks) {
    for (const prereqId of task.prerequisites || []) {
      if (!dependentsGraph.has(prereqId)) {
        dependentsGraph.set(prereqId, []);
      }
      dependentsGraph.get(prereqId).push(task.id);
    }
  }

  // Queue of tasks ready to execute (in-degree === 0)
  const queue = [];
  for (const [taskId, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(taskId);
    }
  }

  const orderedTasks = [];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const task = taskMap.get(currentId);
    if (task) {
      orderedTasks.push(task);
    }

    const dependents = dependentsGraph.get(currentId) || [];
    for (const depId of dependents) {
      const updatedDegree = inDegree.get(depId) - 1;
      inDegree.set(depId, updatedDegree);
      if (updatedDegree === 0) {
        queue.push(depId);
      }
    }
  }

  if (orderedTasks.length !== tasks.length) {
    throw new Error('Graph dependency resolution failed: unexpected remaining dependencies');
  }

  return orderedTasks;
}

/**
 * Calculates real-time journey progress and determines which tasks are currently actionable.
 *
 * @param {Object} journey - Journey object
 * @param {string[]} completedTaskIds - Set or array of completed task IDs
 * @returns {Object} Progress summary
 */
export function computeJourneyProgress(journey, completedTaskIds = []) {
  if (!journey || !Array.isArray(journey.tasks)) {
    return {
      totalTasks: 0,
      completedCount: 0,
      percentComplete: 0,
      orderedTasks: [],
      nextActionableTasks: [],
      estimatedRemainingDays: 0,
      isFullyComplete: false,
    };
  }

  const orderedTasks = resolveTaskOrder(journey.tasks);
  const completedSet = new Set(completedTaskIds);

  let remainingDays = 0;
  const nextActionableTasks = [];
  const taskStatusMap = {};

  for (const task of orderedTasks) {
    const isCompleted = completedSet.has(task.id);
    const prereqs = task.prerequisites || [];
    const allPrereqsMet = prereqs.every((p) => completedSet.has(p));

    let status = 'locked';
    if (isCompleted) {
      status = 'completed';
    } else if (allPrereqsMet) {
      status = 'actionable';
      nextActionableTasks.push(task);
      remainingDays += (task.estimatedDays || 7);
    } else {
      status = 'locked';
      remainingDays += (task.estimatedDays || 7);
    }

    taskStatusMap[task.id] = {
      task,
      status,
      isCompleted,
      allPrereqsMet,
      unmetPrerequisites: prereqs.filter((p) => !completedSet.has(p)),
    };
  }

  const completedCount = completedSet.size;
  const totalTasks = orderedTasks.length;
  const percentComplete = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return {
    journeyId: journey.id,
    journeyTitle: journey.title,
    totalTasks,
    completedCount,
    percentComplete,
    orderedTasks: orderedTasks.map((t) => ({
      ...t,
      ...taskStatusMap[t.id],
    })),
    nextActionableTasks,
    estimatedRemainingDays: remainingDays,
    isFullyComplete: completedCount === totalTasks && totalTasks > 0,
  };
}

/**
 * Storage helpers for persisting journey state across browser sessions.
 */
function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  // In-memory fallback for test environments without window.localStorage
  if (!globalThis.__mockJourneyStorage) {
    globalThis.__mockJourneyStorage = new Map();
  }
  return {
    getItem: (key) => globalThis.__mockJourneyStorage.get(key) || null,
    setItem: (key, val) => globalThis.__mockJourneyStorage.set(key, String(val)),
    removeItem: (key) => globalThis.__mockJourneyStorage.delete(key),
  };
}

/**
 * Persists user completion status for a journey.
 * @param {string} journeyId
 * @param {string[]} completedTaskIds
 */
export function saveJourneyProgress(journeyId, completedTaskIds = []) {
  if (!journeyId) return false;
  const storage = getStorage();
  const payload = {
    journeyId,
    completedTaskIds,
    lastUpdated: new Date().toISOString(),
  };
  storage.setItem(`${STORAGE_PREFIX}${journeyId}`, JSON.stringify(payload));
  return true;
}

/**
 * Retrieves persisted completion status for a journey.
 * @param {string} journeyId
 * @returns {string[]} Completed task IDs
 */
export function loadJourneyProgress(journeyId) {
  if (!journeyId) return [];
  const storage = getStorage();
  try {
    const raw = storage.getItem(`${STORAGE_PREFIX}${journeyId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.completedTaskIds) ? parsed.completedTaskIds : [];
  } catch {
    return [];
  }
}

/**
 * Clears saved progress for a journey.
 * @param {string} journeyId
 */
export function resetJourneyProgress(journeyId) {
  if (!journeyId) return false;
  const storage = getStorage();
  storage.removeItem(`${STORAGE_PREFIX}${journeyId}`);
  return true;
}
