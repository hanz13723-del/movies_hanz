import React, { useState, useEffect } from "react";
import { Drama, Episode, AdminAccount } from "../types";
import { Search, Flame, Star, Play, Eye, ChevronLeft, Lock, Unlock, Film, Shield, Mail, Key, UserCheck, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LibraryProps {
  dramas: Drama[];
  onPlayEpisode: (drama: Drama, episode: Episode) => void;
  unlockedEpisodes: Record<string, number[]>;
  favorites: string[];
  toggleFavorite: (dramaId: string) => void;
  admins: AdminAccount[];
  onAdminLogin: (username: string, pass: string) => boolean;
  isDarkMode?: boolean;
}

export default function Library({ dramas, onPlayEpisode, unlockedEpisodes, favorites, toggleFavorite, admins, onAdminLogin, isDarkMode = true }: LibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDrama, setSelectedDrama] = useState<Drama | null>(null);
  
  // Skeleton loading states
  const [isGridLoading, setIsGridLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Simulated content refresh timer on query or category change
  useEffect(() => {
    setIsGridLoading(true);
    const timer = setTimeout(() => {
      setIsGridLoading(false);
    }, 450); // Premium brief transition delay
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  // States for Admin Login Modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const categories = ["All", "CEO/Billionaire", "Romance", "Werewolf", "Revenge"];

  // Filter dramas
  const filteredDramas = dramas.filter((drama) => {
    const matchesSearch = drama.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          drama.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || drama.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Hot trending drama for hero section
  const heroDrama = dramas[0];

  const handleOpenDetails = (drama: Drama) => {
    setSelectedDrama(drama);
  };

  const handleCloseDetails = () => {
    setSelectedDrama(null);
  };

  return (
    <div id="library-root" className={`min-h-screen ${isDarkMode ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"} pb-28 transition-colors duration-300`}>
      <AnimatePresence mode="wait">
        {!selectedDrama ? (
          <motion.div
            id="library-main-view"
            key="library-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-4 max-w-md mx-auto"
          >
            {/* Header branding */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-light to-accent-dark font-sans">
                  SHORT DRAMA
                </span>
                <span className="text-xs bg-accent/10 text-accent px-2.5 py-0.5 rounded-full font-semibold border border-accent/20">
                  LITE
                </span>
              </div>
              <div className="flex gap-2 items-center text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-accent fill-accent" /> Hot Dramas
                </span>
                <button
                  id="btn-admin-portal"
                  onClick={() => setShowAdminModal(true)}
                  className="p-1.5 bg-white/5 hover:bg-accent/20 hover:text-accent rounded-full border border-white/5 transition-all cursor-pointer ml-1"
                  title="Portal Administrator"
                >
                  <Shield className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-5" id="search-container">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                id="search-input"
                type="text"
                placeholder="Cari drama terpanas di Short Drama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border rounded-full py-2.5 pl-10 pr-4 text-sm transition-all placeholder:text-neutral-500 ${
                  isDarkMode 
                    ? "bg-white/5 border-white/10 text-neutral-100 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20" 
                    : "bg-white border-neutral-200 text-neutral-900 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 shadow-sm"
                }`}
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none" id="category-chips">
              {categories.map((category) => (
                <button
                  id={`category-chip-${category.replace("/", "-")}`}
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 border ${
                    selectedCategory === category
                      ? "bg-accent text-white font-bold border-accent shadow-lg shadow-accent/25"
                      : isDarkMode
                        ? "bg-white/5 border-white/10 text-neutral-400 hover:text-neutral-200"
                        : "bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 shadow-sm"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Hero Banner (Only shown when filter is All and search is empty) */}
            {selectedCategory === "All" && searchQuery === "" && heroDrama && (
              isGridLoading ? (
                <div className="relative h-60 rounded-3xl overflow-hidden mb-6 border border-white/5 bg-neutral-900/40 shimmer animate-shimmer" />
              ) : (
                <motion.div
                  id="hero-banner"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative h-60 rounded-3xl overflow-hidden mb-6 group cursor-pointer border border-white/10 shadow-2xl"
                  onClick={() => handleOpenDetails(heroDrama)}
                >
                  <img
                    src={heroDrama.cover}
                    alt={heroDrama.title}
                    onLoad={() => setLoadedImages(prev => ({ ...prev, [`hero-${heroDrama.id}`]: true }))}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                      loadedImages[`hero-${heroDrama.id}`] ? "opacity-100" : "opacity-0"
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  {!loadedImages[`hero-${heroDrama.id}`] && (
                    <div className="absolute inset-0 shimmer animate-shimmer bg-neutral-900/40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                  
                  {/* Hero Badges */}
                  <span className="absolute top-3 left-3 bg-accent text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                    🔥 Trending #1
                  </span>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold text-accent tracking-wider">
                        {heroDrama.category}
                      </span>
                      <span className="text-neutral-400 text-xs">•</span>
                      <span className="flex items-center gap-0.5 text-xs text-accent font-bold">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        {heroDrama.rating}
                      </span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight leading-tight mb-1 text-white uppercase font-sans">
                      {heroDrama.title}
                    </h3>
                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed font-light">
                      {heroDrama.description}
                    </p>
                  </div>
                </motion.div>
              )
            )}

            {/* Drama List Heading */}
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 font-sans ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
              <Film className="w-4 h-4 text-accent" />
              {selectedCategory === "All" ? "Rekomendasi Teratas" : `${selectedCategory} Series`}
            </h4>

            {/* Grid Catalog */}
            {isGridLoading ? (
              <div className="grid grid-cols-2 gap-4" id="drama-catalog-skeletons">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={`skeleton-${i}`}
                    className={`rounded-2xl overflow-hidden flex flex-col border ${
                      isDarkMode 
                        ? "bg-neutral-900/40 border-white/5 shimmer animate-shimmer" 
                        : "bg-white border-neutral-200 shadow-sm"
                    }`}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900/40 shimmer animate-shimmer" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-white/10 rounded-md w-3/4 shimmer animate-shimmer" />
                      <div className="flex justify-between items-center pt-1">
                        <div className="h-3 bg-white/10 rounded-md w-1/3 shimmer animate-shimmer" />
                        <div className="h-3 bg-white/10 rounded-md w-1/4 shimmer animate-shimmer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4" id="drama-catalog-grid">
                {filteredDramas.map((drama) => (
                  <motion.div
                    id={`drama-card-${drama.id}`}
                    key={drama.id}
                    onClick={() => handleOpenDetails(drama)}
                    whileTap={{ scale: 0.98 }}
                    className={`rounded-2xl overflow-hidden group cursor-pointer flex flex-col border transition-all duration-300 ${
                      isDarkMode 
                        ? "bg-neutral-900/40 border-white/5 hover:border-accent/40" 
                        : "bg-white border-neutral-200 hover:border-accent/40 shadow-sm"
                    }`}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900/40">
                      <img
                        src={drama.cover}
                        alt={drama.title}
                        onLoad={() => setLoadedImages(prev => ({ ...prev, [drama.id]: true }))}
                        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                          loadedImages[drama.id] ? "opacity-100" : "opacity-0"
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      {!loadedImages[drama.id] && (
                        <div className="absolute inset-0 shimmer animate-shimmer bg-neutral-900/40" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent" />
                      
                      {/* View Count Overlay */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-neutral-200 font-semibold bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                        <Eye className="w-3 h-3 text-neutral-400" />
                        {drama.views} Views
                      </div>

                      {/* Category Label */}
                      <span className="absolute top-2 left-2 text-[9px] font-black bg-neutral-950/80 text-accent border border-accent/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {drama.category.split("/")[0]}
                      </span>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h5 className={`font-bold text-sm line-clamp-1 group-hover:text-accent transition-colors uppercase tracking-tight ${isDarkMode ? "text-neutral-100" : "text-neutral-800"}`}>
                        {drama.title}
                      </h5>
                      <div className="flex justify-between items-center mt-1.5 text-[11px] text-neutral-400">
                        <span className={`font-semibold ${isDarkMode ? "text-neutral-300" : "text-neutral-600"}`}>
                          {drama.episodesCount} Episodes
                        </span>
                        <span className="flex items-center gap-0.5 text-accent font-bold">
                          <Star className="w-2.5 h-2.5 fill-accent text-accent" />
                          {drama.rating}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredDramas.length === 0 && (
                  <div id="no-drama-found" className="col-span-2 text-center py-12 text-neutral-500">
                    <p className="text-sm">Tidak ada drama yang cocok dengan pencarian.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* Drama Detail Screen */
          <motion.div
            id="drama-detail-view"
            key="drama-details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className={`min-h-screen ${isDarkMode ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"} max-w-md mx-auto relative pb-28 transition-colors duration-300`}
          >
            {/* Header Hero Area */}
            <div className="relative h-[400px] w-full" id="detail-hero">
              <img
                src={selectedDrama.cover}
                alt={selectedDrama.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/45 to-transparent" />
              
              {/* Top Bar Floating Controls */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <button
                  id="detail-back-button"
                  onClick={handleCloseDetails}
                  className="glass p-2.5 rounded-full hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-neutral-200" />
                </button>
                <button
                  id="detail-favorite-button"
                  onClick={() => toggleFavorite(selectedDrama.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    favorites.includes(selectedDrama.id)
                      ? "bg-accent text-white shadow-lg shadow-accent/20"
                      : "glass text-neutral-200"
                  }`}
                >
                  {favorites.includes(selectedDrama.id) ? "★ Tersimpan" : "☆ Simpan"}
                </button>
              </div>

              {/* Title Block Overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="flex justify-center items-center gap-3 mb-2 text-xs">
                  <span className="bg-accent text-white px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {selectedDrama.category}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="flex items-center gap-1 font-bold text-accent">
                    <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                    {selectedDrama.rating} Rating
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight leading-tight uppercase font-sans mb-1 text-white">
                  {selectedDrama.title}
                </h2>
                <p className="text-xs text-neutral-400 tracking-wider">
                  {selectedDrama.views} Penonton • {selectedDrama.episodesCount} Episode Lengkap
                </p>
              </div>
            </div>

            {/* Description & Cast Content */}
            <div className="p-4 space-y-6">
              {/* Synopsis */}
              <div id="detail-synopsis">
                <h3 className="text-sm font-bold uppercase text-accent tracking-wider mb-2 font-sans">
                  Sinopsis Cerita
                </h3>
                <p className={`text-sm leading-relaxed font-light ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
                  {selectedDrama.description}
                </p>
              </div>

              {/* Characters / Cast */}
              <div id="detail-cast">
                <h3 className="text-sm font-bold uppercase text-accent tracking-wider mb-3 font-sans">
                  Pemeran Utama
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                  {selectedDrama.characters.map((char) => (
                    <div key={char.id} className={`flex items-center gap-3 p-2.5 rounded-2xl min-w-[200px] border ${
                      isDarkMode 
                        ? "bg-white/5 border-white/5" 
                        : "bg-white border-neutral-200 shadow-sm"
                    }`}>
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className={`w-11 h-11 rounded-xl object-cover border ${isDarkMode ? "border-white/10" : "border-neutral-200"}`}
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isDarkMode ? "text-neutral-100" : "text-neutral-800"}`}>{char.name}</p>
                        <p className="text-[10px] text-accent font-medium truncate">{char.role}</p>
                        <p className={`text-[9px] truncate mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>Aktor: {char.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Episodes List */}
              <div id="detail-episodes">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold uppercase text-accent tracking-wider font-sans">
                    Daftar Episode ({selectedDrama.episodesCount})
                  </h3>
                  <span className="text-xs text-neutral-400 font-medium">Mainkan Berurutan</span>
                </div>

                <div className="space-y-3">
                  {selectedDrama.episodes.map((episode) => {
                    // Check if episode is unlocked (Episode 1 is always unlocked, or if listed in unlocked list)
                    const isUnlocked = !episode.isLocked || (unlockedEpisodes[selectedDrama.id] || []).includes(episode.id);

                    return (
                      <div
                        id={`episode-row-${episode.id}`}
                        key={episode.id}
                        onClick={() => onPlayEpisode(selectedDrama, episode)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer group transition-all ${
                          isDarkMode 
                            ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-accent/30" 
                            : "bg-white border-neutral-200 hover:bg-neutral-50 hover:border-accent/30 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Play or status index indicator */}
                          <div className={`relative flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border group-hover:bg-accent group-hover:border-accent transition-colors ${
                            isDarkMode 
                              ? "bg-white/5 border-white/10 text-neutral-300" 
                              : "bg-neutral-100 border-neutral-200 text-neutral-600"
                          }`}>
                            <span className="text-xs font-bold tracking-wider group-hover:hidden text-neutral-400">
                              {episode.id}
                            </span>
                            <Play className="w-4 h-4 text-white hidden group-hover:block fill-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-bold line-clamp-1 group-hover:text-accent transition-colors ${isDarkMode ? "text-neutral-200" : "text-neutral-800"}`}>
                              {episode.title}
                            </h4>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              Durasi: {episode.duration} • 👍 {episode.likes} Suka
                            </p>
                          </div>
                        </div>

                        {/* Episode info container only */}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Portal Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            id="admin-portal-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[999]"
          >
            <motion.div
              id="admin-portal-modal-content"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-neutral-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm relative space-y-4 shadow-2xl"
            >
              {/* Close Button */}
              <button
                id="close-admin-portal-modal"
                onClick={() => {
                  setShowAdminModal(false);
                  setLoginError("");
                }}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-100 p-1.5 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1.5 pb-2 border-b border-white/5">
                <div className="w-12 h-12 bg-accent/15 rounded-2xl flex items-center justify-center text-accent mx-auto mb-1">
                  <Shield className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-sm font-black uppercase text-neutral-200 tracking-wider font-sans">
                  Portal Administrator Short Drama
                </h3>
                <p className="text-[10px] text-neutral-500 font-light leading-relaxed">
                  Gunakan kredensial admin Anda untuk mengelola katalog drama, episode, dan akun.
                </p>
              </div>

              <form
                id="admin-modal-login-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!usernameInput || !passwordInput) {
                    setLoginError("Semua field wajib diisi!");
                    return;
                  }
                  const success = onAdminLogin(usernameInput, passwordInput);
                  if (success) {
                    setLoginError("");
                    setShowAdminModal(false);
                  } else {
                    setLoginError("Username/Email atau Sandi salah!");
                  }
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-accent" /> Username / Email
                  </label>
                  <input
                    id="admin-modal-username-input"
                    type="text"
                    placeholder="Masukkan username atau email admin"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1 flex items-center gap-1">
                    <Key className="w-3 h-3 text-accent" /> Sandi Lewat (Password)
                  </label>
                  <input
                    id="admin-modal-password-input"
                    type="password"
                    placeholder="Masukkan sandi masuk admin"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>

                {loginError && (
                  <div className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/10 p-2.5 rounded-xl flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  id="admin-modal-submit-login-btn"
                  type="submit"
                  className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-accent/15 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" /> Masuk Portal Admin
                </button>
              </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
