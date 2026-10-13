import { useState } from 'react';
import type { UseProjectsResult } from '../hooks/useProjects';
import { formatRelative } from '../utils/time';

interface ProjectsRailProps {
  projects: UseProjectsResult;
}

export function ProjectsRail({ projects }: ProjectsRailProps) {
  const { projects: list, activeId, createProject, selectProject, renameProject, deleteProject } = projects;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setDraft(name);
  };

  const commit = () => {
    if (editingId) renameProject(editingId, draft);
    setEditingId(null);
  };

  const handleRemove = (id: string, name: string) => {
    if (window.confirm(`Удалить работу «${name}»? Это действие нельзя отменить.`)) {
      deleteProject(id);
    }
  };

  return (
    <aside className="flex shrink-0 flex-col border-b border-zinc-800 bg-rail md:h-full md:w-56 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Ваши работы</span>
        <button
          type="button"
          title="Новая работа"
          onClick={() => createProject('Новая работа')}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-800 text-zinc-300 transition-colors hover:bg-blue-500 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:overflow-y-auto md:pb-3">
        {list.map((project) => {
          const active = project.id === activeId;
          const editing = project.id === editingId;
          return (
            <div
              key={project.id}
              className={`group relative min-w-[9.5rem] shrink-0 rounded-lg border p-2 md:min-w-0 ${
                active ? 'border-blue-500/60 bg-blue-500/10' : 'border-transparent hover:bg-zinc-800'
              }`}
            >
              {editing ? (
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commit();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="w-full rounded-md border border-zinc-600 bg-zinc-900 px-1.5 py-1 text-xs text-zinc-100 outline-none focus:border-blue-500"
                />
              ) : (
                <>
                  <button
                    type="button"
                    className="block w-full pr-10 text-left"
                    onClick={() => selectProject(project.id)}
                  >
                    <div className={`truncate text-xs font-medium ${active ? 'text-blue-200' : 'text-zinc-200'}`}>
                      {project.name}
                    </div>
                    <div className="text-[10px] text-zinc-500">{formatRelative(project.updatedAt)}</div>
                  </button>
                  <div className="absolute right-1 top-1 flex gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                    <button
                      type="button"
                      title="Переименовать"
                      onClick={() => startEdit(project.id, project.name)}
                      className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-700 hover:text-zinc-100"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M4 20h4L19 9l-4-4L4 16v4z" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Удалить"
                      onClick={() => handleRemove(project.id, project.name)}
                      className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-red-500/80 hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
