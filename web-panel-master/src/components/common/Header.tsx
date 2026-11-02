import React from "react";
import {
  Trophy,
  PlayCircle,
  LayoutDashboard,
  Code,
  Settings,
  Clock,
  LogOut,
  User as UserIcon,
  RotateCcw,
  Flag,
} from "lucide-react";

import type { User } from "../../types";

type View =
  | "home"
  | "selection"
  | "quiz"
  | "admin"
  | "results"
  | "login"
  | "dashboard"
  | "coding";

interface HeaderProps {
  view: View;
  currentUser: User | null;
  isAdmin: boolean;
  isSubmitted: boolean;
  setView: (view: View) => void;
  handleLogout: () => void;
  handleRetake: () => void;
  resetQuiz: () => void;
  isTrialExpired: () => boolean;
}

const Header: React.FC<HeaderProps> = ({
  view,
  currentUser,
  isAdmin,
  isSubmitted,
  setView,
  handleLogout,
  handleRetake,
  resetQuiz,
  isTrialExpired,
}) => {
  const quizLocked = view === "quiz" && !isSubmitted;
  const trialExpired = isTrialExpired();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#1a1a1a]/50 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => view !== "quiz" && setView("home")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
            <Trophy className="h-6 w-6 text-white" />
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">
            ProQuiz Master
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {/* Quiz button: students and guests only */}
          {!isAdmin && (
            <button
              disabled={quizLocked || trialExpired}
              onClick={() => setView("home")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                view === "home" ||
                view === "selection" ||
                view === "quiz" ||
                view === "results"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5"
              } ${
                quizLocked || trialExpired
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              <PlayCircle size={18} />
              <span className="hidden sm:inline">Quiz</span>
            </button>
          )}

          {/* Dashboard button: students only */}
          {currentUser && !isAdmin && (
            <button
              disabled={quizLocked}
              onClick={() => setView("dashboard")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                view === "dashboard"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5"
              } ${quizLocked ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <LayoutDashboard size={18} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

          {/* Coding button: students only */}
          {currentUser && !isAdmin && (
            <button
              disabled={quizLocked || trialExpired}
              onClick={() => setView("coding")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                view === "coding"
                  ? "bg-orange-500 text-white"
                  : "text-gray-400 hover:bg-white/5"
              } ${
                quizLocked || trialExpired
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              <Code size={18} />
              <span className="hidden sm:inline">Coding</span>
            </button>
          )}

          {currentUser ? (
            <>
              {/* Admin button: admins only */}
              {isAdmin && (
                <button
                  disabled={quizLocked}
                  onClick={() => setView("admin")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                    view === "admin"
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5"
                  } ${quizLocked ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <Settings size={18} />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              {/* Trial badge: student enquiry accounts only */}
              {currentUser.membershipType === "enquiry" &&
                currentUser.role === "student" && (
                  <div
                    className={`mr-2 flex items-center gap-2 rounded-xl border px-4 py-2 ${
                      (currentUser.trialDurationDays || 10) -
                        Math.floor(
                          (new Date().getTime() -
                            new Date(currentUser.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24),
                        ) >
                      0
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                        : "border-red-500/20 bg-red-500/10 text-red-500"
                    }`}
                  >
                    <Clock size={14} />

                    <span className="hidden text-[10px] font-bold tracking-[0.1em] sm:inline">
                      {(currentUser.trialDurationDays || 10) -
                        Math.floor(
                          (new Date().getTime() -
                            new Date(currentUser.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24),
                        ) >
                      0
                        ? `Trial: ${
                            (currentUser.trialDurationDays || 10) -
                            Math.floor(
                              (new Date().getTime() -
                                new Date(currentUser.createdAt).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )
                          } Days Left`
                        : "Access Expired"}
                    </span>

                    <span className="text-[10px] font-bold sm:hidden">
                      {Math.max(
                        0,
                        (currentUser.trialDurationDays || 10) -
                          Math.floor(
                            (new Date().getTime() -
                              new Date(currentUser.createdAt).getTime()) /
                              (1000 * 60 * 60 * 24),
                          ),
                      )}
                      d
                    </span>
                  </div>
                )}

              {/* User profile */}
              <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-zinc-900/50 px-3 py-1.5">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="h-7 w-7 rounded-full border border-white/10 object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          currentUser.name,
                        )}&background=f97316&color=fff`;
                    }}
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <span className="hidden text-sm font-bold tracking-tight text-white/90 sm:inline">
                  {currentUser.name}
                </span>
              </div>

              {/* Logout */}
              <button
                disabled={quizLocked}
                onClick={handleLogout}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-red-400 transition-all hover:bg-red-500/10 ${
                  quizLocked ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            /* Login */
            <button
              disabled={quizLocked}
              onClick={() => setView("login")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                view === "login"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5"
              } ${quizLocked ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <UserIcon size={18} />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}

          {/* Quiz controls */}
          {view === "quiz" && (
            <>
              <button
                onClick={handleRetake}
                className="ml-4 flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600"
              >
                <RotateCcw size={18} />
                <span className="hidden sm:inline">Reset Quiz</span>
              </button>

              <button
                onClick={resetQuiz}
                className="group ml-2 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-red-500 shadow-lg transition-all hover:bg-red-500 hover:text-white hover:shadow-red-500/20"
              >
                <Flag size={18} />
                <span className="hidden sm:inline">Surrender</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
