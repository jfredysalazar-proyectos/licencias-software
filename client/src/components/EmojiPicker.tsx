import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";

const EMOJI_CATEGORIES = {
  "Destacados": ["⭐", "✨", "🔥", "💎", "🏆", "👑", "💯", "🎯", "🚀", "⚡"],
  "Tecnología": ["💻", "🖥️", "⌨️", "🖱️", "💾", "💿", "📀", "🔌", "🔋", "📱", "📲", "☎️", "📞", "📟", "📠", "📡", "🖨️", "⏰", "⏱️", "⏲️"],
  "Seguridad": ["🔒", "🔐", "🔑", "🛡️", "🔰", "⚠️", "🚨", "🚧", "🔓", "🔏"],
  "Oficina": ["📝", "📄", "📃", "📑", "📊", "📈", "📉", "📋", "📌", "📍", "📎", "🖇️", "📏", "📐", "✂️", "🗂️", "🗃️", "🗄️", "📂", "📁"],
  "Diseño": ["🎨", "🖌️", "🖍️", "✏️", "✒️", "🖊️", "🖋️", "📐", "📏", "🎭", "🖼️", "🎬", "🎞️", "📷", "📸", "📹", "📽️", "🎥"],
  "Educación": ["📚", "📖", "📕", "📗", "📘", "📙", "📓", "📔", "📒", "🎓", "🏫", "🏛️", "✏️", "📝", "🔬", "🔭", "📡"],
  "Entretenimiento": ["🎮", "🎯", "🎲", "🎰", "🎳", "🎺", "🎸", "🎹", "🎤", "🎧", "🎬", "🎭", "🎪", "🎨", "🎬", "📺", "📻", "📀", "💿"],
  "Símbolos": ["✅", "✔️", "❌", "❎", "⭕", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "💚", "💙", "💜", "🖤", "🤍", "🤎"],
  "Números": ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"],
  "Flechas": ["⬆️", "⬇️", "⬅️", "➡️", "↗️", "↘️", "↙️", "↖️", "↕️", "↔️", "🔄", "🔃", "🔁", "🔂"],
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Destacados");
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10"
          title="Insertar emoji"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col">
          {/* Category tabs */}
          <div className="flex overflow-x-auto border-b bg-muted/50 p-1 gap-1">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="p-3 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES].map(
                (emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl hover:bg-muted rounded p-1 transition-colors cursor-pointer"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Footer with tip */}
          <div className="border-t bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              💡 Los emojis harán que tus productos destaquen en el listado
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
