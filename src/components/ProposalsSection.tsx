import type { Template, TemplateShape } from '../constants/templates';
import { TEMPLATES } from '../constants/templates';

function TemplatePreview({ layout }: { layout: TemplateShape[] }) {
  const minX = Math.min(...layout.map((item) => item.x));
  const minY = Math.min(...layout.map((item) => item.y));
  const maxX = Math.max(...layout.map((item) => item.x + item.w));
  const maxY = Math.max(...layout.map((item) => item.y + item.h));
  const pad = 10;
  const viewBox = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;

  return (
    <svg viewBox={viewBox} className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {layout.map((item, index) =>
        item.kind === 'ellipse' ? (
          <ellipse
            key={index}
            cx={item.x + item.w / 2}
            cy={item.y + item.h / 2}
            rx={item.w / 2}
            ry={item.h / 2}
            fill={item.fill}
          />
        ) : (
          <rect key={index} x={item.x} y={item.y} width={item.w} height={item.h} rx={4} fill={item.fill} />
        ),
      )}
    </svg>
  );
}

interface ProposalsSectionProps {
  onUse: (template: Template) => void;
}

export function ProposalsSection({ onUse }: ProposalsSectionProps) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-1 text-sm font-semibold text-zinc-100">Предложения дизайнов</div>
      <p className="mb-4 max-w-2xl text-xs text-zinc-500">
        Готовые заготовки, с которых удобно начать работу вне дома. Открывай в редакторе и дорабатывай —
        это создаст новую работу в разделе «Ваши работы».
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => (
          <article
            key={template.id}
            className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-surface"
          >
            <div className="aspect-[4/3] bg-preview p-4">
              <TemplatePreview layout={template.layout} />
            </div>
            <div className="flex flex-1 flex-col gap-2 border-t border-zinc-800 p-3">
              <div className="text-sm font-medium text-zinc-100">{template.name}</div>
              <p className="flex-1 text-xs text-zinc-500">{template.caption}</p>
              <button
                type="button"
                onClick={() => onUse(template)}
                className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600"
              >
                Открыть в редакторе
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
