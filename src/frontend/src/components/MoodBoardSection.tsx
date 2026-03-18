import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";

const STORAGE_KEY = "socialFusionMoodBoard";

function loadMoodBoard(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return [];
}

function saveMoodBoard(imgs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(imgs));
  } catch {}
}

export default function MoodBoardSection() {
  const [images, setImages] = useState<string[]>(loadMoodBoard);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || images.length >= 9) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setImages((prev) => {
        const next = [...prev, url].slice(0, 9);
        saveMoodBoard(next);
        return next;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemove = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      saveMoodBoard(next);
      return next;
    });
  };

  return (
    <div className="mt-4 px-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest">
          Mood Board 🎨
        </h3>
        {images.length < 9 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-pink-400 text-xs flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAdd}
      />
      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full h-24 rounded-2xl border-2 border-dashed border-pink-500/30 bg-pink-500/5 flex flex-col items-center justify-center gap-2"
        >
          <span className="text-2xl">🖼️</span>
          <p className="text-white/30 text-xs">Tap to add mood board photos</p>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {images.map((src, i) => (
            <div
              key={`mb-${src.slice(-8)}-${i}`}
              className="relative aspect-square rounded-xl overflow-hidden"
            >
              <img
                src={src}
                alt={`mood ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {images.length < 9 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-white/15 bg-white/5 flex items-center justify-center"
            >
              <Plus className="w-5 h-5 text-white/30" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
