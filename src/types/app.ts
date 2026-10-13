export type SectionId = 'works' | 'proposals' | 'cats' | 'cursor';

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}
