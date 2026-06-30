import React from "react";
import { Clapperboard, Compass, Sparkles, User } from "lucide-react";

interface NavigationProps {
  activeTab: "theater" | "library";
  setActiveTab: (tab: "theater" | "library") => void;
  coins: number;
}

export default function Navigation({ activeTab, setActiveTab, coins }: NavigationProps) {
  const tabs = [
    { id: "theater", label: "Theater", icon: Clapperboard },
    { id: "library", label: "Library", icon: Compass },
  ] as const;

  return (
    <nav 
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-50 glass py-2 px-4 pb-safe md:max-w-md md:mx-auto md:rounded-t-2xl md:shadow-2xl"
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
                  : "text-neutral-500 hover:text-neutral-300"
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
      </div>
    </nav>
  );
}
