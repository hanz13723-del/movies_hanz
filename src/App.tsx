import React, { useState, useEffect } from "react";
import { Drama, Episode, UserData, AdminAccount } from "./types";
import { DRAMAS } from "./data/dramas";
import Navigation from "./components/Navigation";
import Library from "./components/Library";
import DramaPlayer from "./components/DramaPlayer";
import AdminPanel from "./components/AdminPanel";
import { AnimatePresence, motion } from "motion/react";

const LOCAL_STORAGE_KEY = "shortdrama_drama_user_data";
const CHECKIN_STORAGE_KEY = "shortdrama_drama_last_checkin";

const INITIAL_USER_DATA: UserData = {
  coins: 150, // Decent starting coins to unlock ~5 locked episodes!
  unlockedEpisodes: {
    billionaire_double_life: [1],
    revenge_forgotten_queen: [1],
    secret_alpha_luna: [1],
    ceo_fake_engagement: [1]
  },
  watchHistory: [],
  favorites: [],
  likedEpisodes: []
};

const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: "admin_1",
    username: "hanz_admin",
    email: "hanz13723@gmail.com",
    password: "admin",
    role: "Super Admin",
    createdAt: "30/06/2026"
  },
  {
    id: "admin_2",
    username: "shortdrama_ceo",
    email: "ceo@shortdrama.com",
    password: "ceo",
    role: "Manager",
    createdAt: "30/06/2026"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"theater" | "library">("library");
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(null);

  // Dynamic content list (managed by admin panel)
  const [dramas, setDramas] = useState<Drama[]>(() => {
    const saved = localStorage.getItem("shortdrama_dramas");
    return saved ? JSON.parse(saved) : DRAMAS;
  });

  const [admins, setAdmins] = useState<AdminAccount[]>(() => {
    const saved = localStorage.getItem("shortdrama_admins");
    return saved ? JSON.parse(saved) : INITIAL_ADMINS;
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);

  // Drama player active states
  const [activeDrama, setActiveDrama] = useState<Drama>(() => {
    const saved = localStorage.getItem("shortdrama_dramas");
    const list = saved ? JSON.parse(saved) : DRAMAS;
    return list[0] || DRAMAS[0];
  });
  
  const [activeEpisode, setActiveEpisode] = useState<Episode>(() => {
    const saved = localStorage.getItem("shortdrama_dramas");
    const list = saved ? JSON.parse(saved) : DRAMAS;
    const firstDrama = list[0] || DRAMAS[0];
    return firstDrama?.episodes[0] || DRAMAS[0].episodes[0];
  });

  // Save dramas helper
  const saveDramas = (newDramas: Drama[]) => {
    setDramas(newDramas);
    localStorage.setItem("shortdrama_dramas", JSON.stringify(newDramas));

    // Also update active drama references if they are deleted or modified
    const currentActiveDramaInNew = newDramas.find(d => d.id === activeDrama.id);
    if (currentActiveDramaInNew) {
      setActiveDrama(currentActiveDramaInNew);
      const currentActiveEpisodeInNew = currentActiveDramaInNew.episodes.find(e => e.id === activeEpisode.id);
      if (currentActiveEpisodeInNew) {
        setActiveEpisode(currentActiveEpisodeInNew);
      } else {
        setActiveEpisode(currentActiveDramaInNew.episodes[0] || DRAMAS[0].episodes[0]);
      }
    } else if (newDramas.length > 0) {
      setActiveDrama(newDramas[0]);
      setActiveEpisode(newDramas[0].episodes[0]);
    }
  };

  // Save admins helper
  const saveAdmins = (newAdmins: AdminAccount[]) => {
    setAdmins(newAdmins);
    localStorage.setItem("shortdrama_admins", JSON.stringify(newAdmins));
  };

  // Admin login trigger
  const handleAdminLogin = (usernameOrEmail: string, passwordInput: string): boolean => {
    const matched = admins.find(
      a => (a.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
            a.email.toLowerCase() === usernameOrEmail.toLowerCase()) && 
           a.password === passwordInput
    );

    if (matched) {
      setCurrentAdmin(matched);
      setIsAdminMode(true);
      return true;
    }
    return false;
  };

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        setUserData(JSON.parse(savedData));
      } catch (err) {
        console.error("Gagal memuat data lokal:", err);
      }
    }

    const savedCheckIn = localStorage.getItem(CHECKIN_STORAGE_KEY);
    if (savedCheckIn) {
      setLastCheckInDate(savedCheckIn);
    }
  }, []);

  // Save user data to localStorage on changes
  const saveUserData = (newData: UserData) => {
    setUserData(newData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
  };

  // Interact: Play specific episode
  const handlePlayEpisode = (drama: Drama, episode: Episode) => {
    setActiveDrama(drama);
    setActiveEpisode(episode);
    setActiveTab("theater");

    // Add to watch history
    const isAlreadyWatched = userData.watchHistory.some(
      item => item.dramaId === drama.id && item.episodeId === episode.id
    );

    if (!isAlreadyWatched) {
      const updatedHistory = [
        { dramaId: drama.id, episodeId: episode.id, watchedAt: "Baru saja" },
        ...userData.watchHistory.map(h => ({ ...h, watchedAt: h.watchedAt === "Baru saja" ? "1 jam lalu" : h.watchedAt }))
      ].slice(0, 20); // Keep last 20 watch logs

      saveUserData({
        ...userData,
        watchHistory: updatedHistory
      });
    }
  };

  const handlePlayEpisodeById = (drama: Drama, episodeId: number) => {
    const epObj = drama.episodes.find(e => e.id === episodeId) || drama.episodes[0];
    handlePlayEpisode(drama, epObj);
  };

  // Interact: Unlock episode with coins
  const handleUnlockEpisode = (dramaId: string, episodeId: number, cost: number): boolean => {
    if (userData.coins < cost) {
      return false;
    }

    const updatedUnlocked = { ...userData.unlockedEpisodes };
    if (!updatedUnlocked[dramaId]) {
      updatedUnlocked[dramaId] = [1];
    }
    if (!updatedUnlocked[dramaId].includes(episodeId)) {
      updatedUnlocked[dramaId] = [...updatedUnlocked[dramaId], episodeId];
    }

    const newUserData = {
      ...userData,
      coins: userData.coins - cost,
      unlockedEpisodes: updatedUnlocked
    };

    saveUserData(newUserData);

    // Update active episode locked status in memory player if it's currently active
    if (activeDrama.id === dramaId && activeEpisode.id === episodeId) {
      setActiveEpisode({ ...activeEpisode, isLocked: false });
    }

    return true;
  };

  // Interact: Add custom coins (via rewards, ads, daily)
  const handleAddCoins = (amount: number) => {
    saveUserData({
      ...userData,
      coins: userData.coins + amount
    });
  };

  // Interact: Daily check-in
  const handleCheckIn = () => {
    const todayStr = new Date().toDateString();
    if (lastCheckInDate === todayStr) {
      alert("Anda sudah melakukan check-in hari ini!");
      return;
    }

    setLastCheckInDate(todayStr);
    localStorage.setItem(CHECKIN_STORAGE_KEY, todayStr);
    handleAddCoins(50);
    alert("Check-in sukses! +50 Koin telah dikreditkan ke dompet Anda.");
  };

  // Interact: Clear Watch History
  const handleClearHistory = () => {
    saveUserData({
      ...userData,
      watchHistory: []
    });
  };

  // Interact: Toggle Favorite series
  const toggleFavorite = (dramaId: string) => {
    const isFavorite = userData.favorites.includes(dramaId);
    let updatedFavs: string[];
    
    if (isFavorite) {
      updatedFavs = userData.favorites.filter(id => id !== dramaId);
      alert("Drama dihapus dari daftar simpan.");
    } else {
      updatedFavs = [...userData.favorites, dramaId];
      alert("Drama berhasil disimpan ke daftar tersimpan Anda!");
    }

    saveUserData({
      ...userData,
      favorites: updatedFavs
    });
  };

  // Interact: Like or Unlike episode
  const toggleLikeEpisode = (dramaId: string, episodeId: number) => {
    const likeKey = `${dramaId}_${episodeId}`;
    const isLiked = userData.likedEpisodes.includes(likeKey);
    let updatedLikes: string[];

    if (isLiked) {
      updatedLikes = userData.likedEpisodes.filter(key => key !== likeKey);
    } else {
      updatedLikes = [...userData.likedEpisodes, likeKey];
    }

    saveUserData({
      ...userData,
      likedEpisodes: updatedLikes
    });
  };

  // Find if active episode should look unlocked
  const getAugmentedActiveEpisode = (): Episode => {
    const unlockedList = userData.unlockedEpisodes[activeDrama.id] || [];
    const isUnlocked = unlockedList.includes(activeEpisode.id);
    return {
      ...activeEpisode,
      isLocked: activeEpisode.isLocked && !isUnlocked
    };
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "theater":
        return (
          <DramaPlayer
            activeDrama={activeDrama}
            activeEpisode={getAugmentedActiveEpisode()}
            onUnlockEpisode={handleUnlockEpisode}
            onEpisodeChange={handlePlayEpisode}
            coins={userData.coins}
            onAddCoins={handleAddCoins}
            likedEpisodes={userData.likedEpisodes}
            toggleLikeEpisode={toggleLikeEpisode}
          />
        );
      case "library":
        return (
          <Library
            dramas={dramas}
            onPlayEpisode={handlePlayEpisode}
            unlockedEpisodes={userData.unlockedEpisodes}
            favorites={userData.favorites}
            toggleFavorite={toggleFavorite}
            admins={admins}
            onAdminLogin={handleAdminLogin}
          />
        );
      default:
        return null;
    }
  };

  if (isAdminMode && currentAdmin) {
    return (
      <AdminPanel
        dramas={dramas}
        setDramas={saveDramas}
        admins={admins}
        setAdmins={saveAdmins}
        activeAdmin={currentAdmin}
        onLogout={() => {
          setIsAdminMode(false);
          setCurrentAdmin(null);
        }}
      />
    );
  }

  return (
    <div id="app-root-shell" className="min-h-screen bg-neutral-950 font-sans text-neutral-100 flex flex-col justify-between">
      
      {/* Scrollable primary visual body wrapper with fixed desktop bounds */}
      <main className="flex-1 w-full relative md:max-w-md md:mx-auto md:border-x md:border-neutral-900 md:shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            id={`screen-container-${activeTab}`}
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {renderActiveTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent global floating navigation bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        coins={userData.coins}
      />
    </div>
  );
}
