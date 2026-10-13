import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Project } from '../types/app';
import type { Shape } from '../types/shape';
import { STARTER_SHAPES } from '../constants/shapes';
import { IMAGE_CASCADE_STEP, IMAGE_CASCADE_STEPS, IMAGE_SIZE } from '../constants/tools';
import { uid } from '../utils/id';
import {
  LEGACY_DOCUMENT_KEY,
  LEGACY_VIEWPORT_KEY,
  PROJECTS_KEY,
  cancelScheduledSave,
  parseDocument,
  projectDocumentKey,
  projectViewportKey,
  readItem,
  removeItem,
  saveDocument,
  scheduleSave,
  writeItem,
} from '../utils/storage';

interface StoredProjects {
  projects: Project[];
  activeId: string;
}

function isProject(value: unknown): value is Project {
  if (typeof value !== 'object' || value === null) return false;
  const project = value as Partial<Project>;
  return (
    typeof project.id === 'string' &&
    typeof project.name === 'string' &&
    typeof project.createdAt === 'number' &&
    typeof project.updatedAt === 'number'
  );
}

function makeProject(name: string, shapes: Shape[]): Project {
  const now = Date.now();
  const project: Project = { id: uid(), name, createdAt: now, updatedAt: now };
  saveDocument(projectDocumentKey(project.id), { shapes, selectedId: null });
  return project;
}

function readProjects(): StoredProjects {
  const parsed = readItem(PROJECTS_KEY);
  if (typeof parsed === 'object' && parsed !== null) {
    const record = parsed as { projects?: unknown; activeId?: unknown };
    if (Array.isArray(record.projects)) {
      const projects = record.projects.filter(isProject);
      if (projects.length > 0) {
        const candidate = record.activeId;
        const activeId =
          typeof candidate === 'string' && projects.some((project) => project.id === candidate)
            ? candidate
            : projects[0].id;
        return { projects, activeId };
      }
    }
  }

  // Первый запуск (или повреждённое хранилище): заводим работу и переносим в неё
  // данные старой одно-документной версии, если они сохранились.
  const legacy = parseDocument(readItem(LEGACY_DOCUMENT_KEY), STARTER_SHAPES);
  const project = makeProject('Моя первая работа', legacy.shapes);
  const legacyViewport = readItem(LEGACY_VIEWPORT_KEY);
  if (legacyViewport !== null) {
    writeItem(projectViewportKey(project.id), legacyViewport);
  }
  return { projects: [project], activeId: project.id };
}

export interface UseProjectsResult {
  projects: Project[];
  activeId: string;
  activeProject: Project | null;
  createProject: (name: string, shapes?: Shape[]) => string;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  selectProject: (id: string) => void;
  addImageToProject: (id: string, src: string) => void;
  touchProject: (id: string) => void;
}

export function useProjects(): UseProjectsResult {
  const [state, setState] = useState<StoredProjects>(readProjects);

  useEffect(() => {
    scheduleSave(PROJECTS_KEY, () => writeItem(PROJECTS_KEY, state));
  }, [state]);

  const createProject = useCallback((name: string, shapes: Shape[] = []): string => {
    const project = makeProject(name.trim() || 'Новая работа', shapes);
    setState((prev) => ({ projects: [project, ...prev.projects], activeId: project.id }));
    return project.id;
  }, []);

  const deleteProject = useCallback((id: string) => {
    cancelScheduledSave(projectDocumentKey(id));
    cancelScheduledSave(projectViewportKey(id));
    removeItem(projectDocumentKey(id));
    removeItem(projectViewportKey(id));
    setState((prev) => {
      const projects = prev.projects.filter((project) => project.id !== id);
      if (projects.length === 0) {
        const fresh = makeProject('Новая работа', []);
        return { projects: [fresh], activeId: fresh.id };
      }
      const activeId = prev.activeId === id ? projects[0].id : prev.activeId;
      return { projects, activeId };
    });
  }, []);

  const renameProject = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((project) =>
        project.id === id ? { ...project, name: trimmed } : project,
      ),
    }));
  }, []);

  const selectProject = useCallback((id: string) => {
    setState((prev) =>
      prev.projects.some((project) => project.id === id) ? { ...prev, activeId: id } : prev,
    );
  }, []);

  const addImageToProject = useCallback((id: string, src: string) => {
    const doc = parseDocument(readItem(projectDocumentKey(id)), []);
    const images = doc.shapes.filter((shape) => shape.kind === 'image').length;
    const step = (images % IMAGE_CASCADE_STEPS) * IMAGE_CASCADE_STEP;
    const shape: Shape = {
      id: uid(),
      kind: 'image',
      x: -IMAGE_SIZE / 2 + step,
      y: -IMAGE_SIZE / 2 + step,
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
      fill: '#ffffff',
      src,
    };
    saveDocument(projectDocumentKey(id), { shapes: [...doc.shapes, shape], selectedId: shape.id });
    setState((prev) => ({
      activeId: id,
      projects: prev.projects.map((project) =>
        project.id === id ? { ...project, updatedAt: Date.now() } : project,
      ),
    }));
  }, []);

  const touchProject = useCallback((id: string) => {
    setState((prev) => {
      const current = prev.projects.find((project) => project.id === id);
      if (!current) return prev;
      const now = Date.now();
      if (now - current.updatedAt < 2000) return prev;
      return {
        ...prev,
        projects: prev.projects.map((project) =>
          project.id === id ? { ...project, updatedAt: now } : project,
        ),
      };
    });
  }, []);

  const activeProject = useMemo(
    () => state.projects.find((project) => project.id === state.activeId) ?? null,
    [state.projects, state.activeId],
  );

  return {
    projects: state.projects,
    activeId: state.activeId,
    activeProject,
    createProject,
    deleteProject,
    renameProject,
    selectProject,
    addImageToProject,
    touchProject,
  };
}
