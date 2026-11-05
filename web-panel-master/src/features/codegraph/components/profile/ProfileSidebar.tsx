import React from "react";
import { ArrowLeft, Camera, Pencil, Eye } from "lucide-react";
import { cn } from "../../lib/utils";
import type { UserProfile } from "../../types";

interface ProfileSidebarProps {
  profileData: UserProfile;
  mode: "preview" | "edit";
  onBack: () => void;
  onToggleMode: () => void;
  onOpenAvatarModal: () => void;
}

export default function ProfileSidebar({
  profileData,
  mode,
  onBack,
  onToggleMode,
  onOpenAvatarModal,
}: ProfileSidebarProps) {
  return (
    <aside className="w-full md:w-72 bg-[#0D0D0D] border-b md:border-b-0 md:border-r border-zinc-800 p-8 flex flex-col items-center space-y-10 sticky top-0 md:h-screen">
      {/* Dashboard Button */}
      <button
        onClick={onBack}
        className="self-start flex items-center gap-3 text-zinc-500 hover:text-orange-500 transition-all duration-300 group"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />

        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
          Dashboard
        </span>
      </button>

      {/* User Profile */}
      <div className="flex flex-col items-center space-y-6 w-full pt-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-36 h-36 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-2xl shadow-orange-500/5 group-hover:border-orange-500/30 transition-all duration-500">
            <img
              src={profileData.avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Change Avatar Button */}
          {mode === "edit" && (
            <button
              onClick={onOpenAvatarModal}
              className="absolute -bottom-2 -right-2 w-11 h-11 bg-orange-600 hover:bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-600/20 transition-all hover:scale-110 active:scale-95 border-4 border-[#0D0D0D]"
              aria-label="Change avatar"
            >
              <Camera size={18} />
            </button>
          )}
        </div>

        {/* Name and Email */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {profileData.name}
          </h2>

          <p className="text-[11px] font-bold text-zinc-600 tracking-tight leading-none truncate max-w-[200px]">
            {profileData.email}
          </p>
        </div>

        {/* Preview / Edit Toggle */}
        <button
          onClick={onToggleMode}
          className={cn(
            "w-full py-3 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold transition-all active:scale-[0.98] border",
            mode === "preview"
              ? "bg-orange-500/10 border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white"
              : "bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800",
          )}
        >
          {mode === "preview" ? <Pencil size={16} /> : <Eye size={16} />}

          {mode === "preview" ? "Edit Details" : "View Preview"}
        </button>
      </div>
    </aside>
  );
}
