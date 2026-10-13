import { useState } from 'react';
import { buildImageUrl, randomSeed } from '../utils/aiImage';

interface CatMeme {
  title: string;
  prompt: string;
}

const CATS: CatMeme[] = [
  { title: 'Кот, который всё видел', prompt: 'surreal funny cat meme, wide eyes, ironic, studio lighting, high detail' },
  { title: 'Кот в отпуске', prompt: 'cat wearing tiny sunglasses, chill on a beach, meme, high detail' },
  { title: 'Кот-батон', prompt: 'chonky cat loafing, funny meme, soft light, high detail' },
  { title: 'Кот-дизайнер дедлайнит', prompt: 'cat typing on a laptop, focused, meme, office, high detail' },
  { title: 'Кот на корпоративе', prompt: 'cat with party hat and confetti, celebration meme, high detail' },
  { title: 'Кот после правок клиента', prompt: 'cat dramatically crying, funny meme, dramatic lighting, high detail' },
  { title: 'Кот-император', prompt: 'cat as a medieval king with a crown, meme, oil painting, high detail' },
  { title: 'Созвон в 9 утра', prompt: 'two cats, one serious one silly, meme, high detail' },
  { title: 'Ушёл в работу с головой', prompt: 'cat stuck inside a box, only head visible, funny meme, high detail' },
  { title: 'Кот и его кактус', prompt: 'cat next to a tiny cactus, unbothered, meme, high detail' },
  { title: 'Пятница, 18:00', prompt: 'cat staring at a monitor with despair, funny meme, high detail' },
  { title: 'Кот на переговорах', prompt: 'cat wearing a necktie, business, meme, high detail' },
];

const CAT_IMAGE_SIZE = 512;

interface CatCardProps {
  title: string;
  url: string;
  onAdd: (src: string) => void;
  onShuffle: () => void;
}

function CatCard({ title, url, onAdd, onShuffle }: CatCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-surface">
      <div className="relative aspect-square bg-zinc-900">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-zinc-800" />}
        <img
          src={url}
          alt={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2.5">
        <div className="flex-1 text-xs font-medium text-zinc-200">{title}</div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onAdd(url)}
            className="flex-1 rounded-md bg-blue-500 px-2 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-blue-600"
          >
            На холст
          </button>
          <button
            type="button"
            onClick={onShuffle}
            title="Ещё котика"
            className="rounded-md bg-zinc-800 px-2 py-1.5 text-[11px] text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Ещё
          </button>
        </div>
      </div>
    </div>
  );
}

interface CatsSectionProps {
  onAdd: (src: string) => void;
}

export function CatsSection({ onAdd }: CatsSectionProps) {
  const [seeds, setSeeds] = useState<number[]>(() => CATS.map(() => randomSeed()));

  const shuffleAll = () => setSeeds(CATS.map(() => randomSeed()));
  const shuffleOne = (index: number) =>
    setSeeds((prev) => prev.map((seed, i) => (i === index ? randomSeed() : seed)));

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-zinc-100">Котики для расслабона</div>
        <button
          type="button"
          onClick={shuffleAll}
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
        >
          Перемешать всех
        </button>
      </div>
      <p className="mb-4 max-w-2xl text-xs text-zinc-500">
        Раздел для отвлечения: мемные котики генерируются нейросетью прямо в браузере. Понравившегося можно
        отправить на холст кнопкой «На холст».
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CATS.map((cat, index) => (
          <CatCard
            key={`${cat.title}-${seeds[index]}`}
            title={cat.title}
            url={buildImageUrl(cat.prompt, CAT_IMAGE_SIZE, seeds[index])}
            onAdd={onAdd}
            onShuffle={() => shuffleOne(index)}
          />
        ))}
      </div>
    </div>
  );
}
