import React from "react";
import { Clapperboard, Compass, Sun, Moon } from "lucide-react";

interface NavigationProps {
  activeTab: "theater" | "library";
  setActiveTab: (tab: "theater" | "library") => void;
  coins: number;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function Navigation({ activeTab, setActiveTab, coins, isDarkMode, toggleTheme }: NavigationProps) {
  const tabs = [
    { id: "theater", label: "Theater", icon: Clapperboard },
    { id: "library", label: "Library", icon: Compass },
  ] as const;

  return (
    <nav 
      id="bottom-navigation-bar"
      className={`fixed bottom-0 left-0 right-0 z-50 py-2 px-4 pb-safe md:max-w-md md:mx-auto md:rounded-t-2xl md:shadow-2xl transition-all duration-300 ${
        isDarkMode 
          ? "bg-neutral-900/90 border-t border-white/5 backdrop-blur-md text-neutral-100" 
          : "bg-white/90 border-t border-neutral-200 backdrop-blur-md text-neutral-800 shadow-md"
      }`}
    >
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              id={`nav-tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-300 relative ${
                isActive 
                  ? "text-accent font-medium scale-105" 
                  : isDarkMode 
                    ? "text-neutral-500 hover:text-neutral-300" 
                    : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 transition-transform duration-300 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
              </div>
              <span className="text-[10px] tracking-wide uppercase font-sans">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-[2px] bg-accent rounded-full" />
              )}
            </button>
          );
        })}

        {/* Global Theme Toggle Button */}
        <button
          id="nav-theme-toggle"
          onClick={toggleTheme}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-300 relative ${
            isDarkMode 
              ? "text-neutral-500 hover:text-neutral-300" 
              : "text-neutral-400 hover:text-neutral-600"
          }`}
          title={isDarkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
        >
          <div className="relative">
            {isDarkMode ? (
              <Sun className="w-5 h-5 mb-0.5 stroke-[2] text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 mb-0.5 stroke-[2] text-indigo-600" />
            )}
          </div>
          <span className="text-[10px] tracking-wide uppercase font-sans">
            {isDarkMode ? "Light" : "Dark"}
          </span>
        </button>
      </div>
    </nav>
  );
}
