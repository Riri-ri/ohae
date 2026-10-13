import { Editor } from './Editor';
import { ProjectsRail } from './ProjectsRail';
import type { UseProjectsResult } from '../hooks/useProjects';

interface WorksSectionProps {
  projects: UseProjectsResult;
}

export function WorksSection({ projects }: WorksSectionProps) {
  const { activeProject, touchProject } = projects;
  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <ProjectsRail projects={projects} />
      <div className="min-h-0 min-w-0 flex-1">
        {activeProject && (
          <Editor
            key={activeProject.id}
            projectId={activeProject.id}
            onSaved={() => touchProject(activeProject.id)}
          />
        )}
      </div>
    </div>
  );
}
