import { useCallback, useState } from 'react';
import { TopNav } from './components/TopNav';
import { WorksSection } from './components/WorksSection';
import { ProposalsSection } from './components/ProposalsSection';
import { CatsSection } from './components/CatsSection';
import { CursorSection } from './components/CursorSection';
import { Landing } from './components/Landing';
import { buildTemplate } from './constants/templates';
import { useCursor } from './hooks/useCursor';
import { useProjects } from './hooks/useProjects';
import type { Template } from './constants/templates';
import type { SectionId } from './types/app';

export default function App() {
  const [entered, setEntered] = useState(false);
  const [section, setSection] = useState<SectionId>('works');
  const { cursorId, setCursorId } = useCursor();
  const projects = useProjects();

  const useTemplate = useCallback(
    (template: Template) => {
      projects.createProject(template.name, buildTemplate(template));
      setSection('works');
    },
    [projects],
  );

  const addCatToCanvas = useCallback(
    (src: string) => {
      projects.addImageToProject(projects.activeId, src);
      setSection('works');
    },
    [projects],
  );

  return (
    <div className="app-shell flex h-full w-full flex-col bg-app text-zinc-100">
      {entered ? (
        <>
          <TopNav section={section} onSelect={setSection} onHome={() => setEntered(false)} />
          <main className="min-h-0 flex-1 overflow-hidden">
            {section === 'works' && <WorksSection projects={projects} />}
            {section === 'proposals' && <ProposalsSection onUse={useTemplate} />}
            {section === 'cats' && <CatsSection onAdd={addCatToCanvas} />}
            {section === 'cursor' && <CursorSection cursorId={cursorId} onSelect={setCursorId} />}
          </main>
        </>
      ) : (
        <main className="min-h-0 flex-1 overflow-hidden">
          <Landing onEnter={() => setEntered(true)} />
        </main>
      )}
    </div>
  );
}
