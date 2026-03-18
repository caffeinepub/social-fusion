import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Camera, Image, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const GRADIENT_OPTIONS = [
  { id: "g1", from: "#ff0080", to: "#7c3aed", label: "Neon" },
  { id: "g2", from: "#f97316", to: "#ec4899", label: "Sunset" },
  { id: "g3", from: "#06b6d4", to: "#3b82f6", label: "Ocean" },
  { id: "g4", from: "#10b981", to: "#06b6d4", label: "Mint" },
  { id: "g5", from: "#fbbf24", to: "#f97316", label: "Gold" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function StoryCreatorSheet({ open, onClose }: Props) {
  const [text, setText] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_OPTIONS[0]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
  };

  const handleShare = () => {
    toast.success("Story shared! ✨");
    setText("");
    setPreviewImage(null);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        data-ocid="story.sheet"
        className="bg-[#0f0f1a] border-white/10 text-white rounded-t-3xl max-h-[90dvh] overflow-y-auto px-4 pb-8"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-white text-lg font-bold">
            Create Story
          </SheetTitle>
        </SheetHeader>

        {/* Preview panel */}
        <div
          className="relative w-full aspect-[9/16] max-h-52 rounded-2xl overflow-hidden mb-4 border border-white/10"
          style={{
            background: previewImage
              ? undefined
              : `linear-gradient(135deg, ${selectedGradient.from}, ${selectedGradient.to})`,
            boxShadow: `0 0 30px ${selectedGradient.from}40`,
          }}
        >
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {text && (
            <div className="absolute inset-0 flex items-end justify-center pb-6 px-4">
              <p
                className="text-white font-bold text-xl text-center leading-snug drop-shadow-2xl"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
              >
                {text}
              </p>
            </div>
          )}
          {!previewImage && !text && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white/30" />
            </div>
          )}
        </div>

        {/* Gradient picker */}
        <div className="mb-4">
          <Label className="text-white/50 text-xs mb-2 block">Background</Label>
          <div className="flex gap-2">
            {GRADIENT_OPTIONS.map((g) => (
              <button
                key={g.id}
                type="button"
                data-ocid="story.toggle"
                onClick={() => setSelectedGradient(g)}
                className="w-10 h-10 rounded-full shrink-0 transition-transform active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                  outline:
                    selectedGradient.id === g.id ? "2px solid white" : "none",
                  outlineOffset: "2px",
                }}
                title={g.label}
              />
            ))}
          </div>
        </div>

        {/* Text overlay input */}
        <div className="mb-4">
          <Label className="text-white/50 text-xs mb-2 block">
            Text Overlay
          </Label>
          <Input
            data-ocid="story.input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add text to your story..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>

        {/* Media buttons */}
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            data-ocid="story.upload_button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-white/60 text-sm hover:bg-white/10 transition-colors"
          >
            <Image className="w-4 h-4" />
            Photo
          </button>
          <button
            type="button"
            data-ocid="story.secondary_button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-white/60 text-sm hover:bg-white/10 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Camera
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Share button */}
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            data-ocid="story.submit_button"
            onClick={handleShare}
            className="w-full h-12 rounded-2xl text-white font-bold text-base border-0"
            style={{
              background: `linear-gradient(135deg, ${selectedGradient.from}, ${selectedGradient.to})`,
              boxShadow: `0 4px 20px ${selectedGradient.from}60`,
            }}
          >
            ✨ Share Story
          </Button>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
