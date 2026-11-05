import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { AVATAR_LIST } from "../../constants";

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSelect: (url: string) => void;
}

export default function AvatarSelectionModal({
  isOpen,
  onClose,
  currentAvatar,
  onSelect,
}: AvatarSelectionModalProps) {
  const [selected, setSelected] = React.useState(currentAvatar);

  // Keep the selection synchronized with the current profile avatar.
  React.useEffect(() => {
    if (isOpen) {
      setSelected(currentAvatar);
    }
  }, [isOpen, currentAvatar]);

  const handleConfirm = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#0D0D0D] border border-zinc-800 rounded-[2.5rem] shadow-2xl z-[201] overflow-hidden"
          >
            <div className="flex flex-col h-[75vh]">
              {/* Header */}
              <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Choose Your Avatar
                  </h2>

                  <p className="text-zinc-500 text-sm font-semibold">
                    Select a professional identity from our collection.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-500 hover:text-white transition-all"
                  aria-label="Close avatar modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Current Selection Preview */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-36 h-36 rounded-[2.5rem] bg-zinc-900 border-2 border-orange-500 p-0.5 shadow-2xl shadow-orange-500/20">
                    <img
                      src={selected}
                      alt="Current Selection"
                      className="w-full h-full object-cover rounded-[2.4rem]"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                    Active Preview
                  </span>
                </div>

                {/* Avatar Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-4">
                  {AVATAR_LIST.map((url, index) => (
                    <motion.div
                      key={url}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "aspect-square rounded-2xl bg-zinc-900 border-2 cursor-pointer transition-all overflow-hidden group/avatar-item",
                        selected === url
                          ? "border-orange-500 ring-4 ring-orange-500/10"
                          : "border-zinc-800 hover:border-zinc-700",
                      )}
                      onClick={() => setSelected(url)}
                    >
                      <img
                        src={url}
                        alt={`Avatar ${index + 1}`}
                        className={cn(
                          "w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500",
                          selected === url && "opacity-100",
                        )}
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-zinc-800 bg-zinc-900/20 flex justify-end gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-300 transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirm}
                  className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
