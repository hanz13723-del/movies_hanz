import React, { useState, useRef, useEffect } from "react";
import { Drama, Episode, Comment } from "../types";
import { MOCK_COMMENTS } from "../data/dramas";
import { 
  Play, Pause, Heart, MessageCircle, Share2, 
  ChevronLeft, ChevronUp, ChevronDown, Lock, Unlock,
  Coins, Volume2, VolumeX, MessageSquare, Send, CheckCircle2, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const formatVideoUrl = (url: string): string => {
  if (!url) return "";
  let formatted = url.trim();
  // Support converting doodstream download/detail links to direct embed player links
  if (formatted.includes("dood") || formatted.includes("d000d")) {
    formatted = formatted.replace(/\/d\//g, "/e/");
  }
  return formatted;
};

const isEmbedUrl = (url: string): boolean => {
  if (!url) return false;
  const lowercase = url.toLowerCase();
  return (
    lowercase.includes("dood") ||
    lowercase.includes("d000d") ||
    lowercase.includes("youtube.com") ||
    lowercase.includes("youtu.be") ||
    lowercase.includes("vimeo.com") ||
    lowercase.includes("embed") ||
    (!lowercase.endsWith(".mp4") && !lowercase.endsWith(".webm") && !lowercase.endsWith(".m3u8") && !lowercase.includes(".mp4?"))
  );
};

const parseDurationToSeconds = (durationStr: string): number => {
  if (!durationStr) return 90;
  const parts = durationStr.split(":");
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10);
    const secs = parseInt(parts[1], 10);
    if (!isNaN(mins) && !isNaN(secs)) {
      return mins * 60 + secs;
    }
  } else if (parts.length === 3) {
    const hrs = parseInt(parts[0], 10);
    const mins = parseInt(parts[1], 10);
    const secs = parseInt(parts[2], 10);
    if (!isNaN(hrs) && !isNaN(mins) && !isNaN(secs)) {
      return hrs * 3600 + mins * 60 + secs;
    }
  }
  return 90;
};

interface DramaPlayerProps {
  activeDrama: Drama;
  activeEpisode: Episode;
  onUnlockEpisode: (dramaId: string, episodeId: number, cost: number) => boolean;
  onEpisodeChange: (drama: Drama, episode: Episode) => void;
  coins: number;
  onAddCoins: (amount: number) => void;
  likedEpisodes: string[];
  toggleLikeEpisode: (dramaId: string, episodeId: number) => void;
  isDarkMode?: boolean;
  dramas?: Drama[];
}

export default function DramaPlayer({
  activeDrama,
  activeEpisode,
  onUnlockEpisode,
  onEpisodeChange,
  coins,
  onAddCoins,
  likedEpisodes,
  toggleLikeEpisode,
  isDarkMode = true,
  dramas = []
}: DramaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [heartCoords, setHeartCoords] = useState({ x: 0, y: 0 });
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(() => {
    const saved = localStorage.getItem("shortdrama_autoplay");
    return saved !== null ? saved === "true" : true;
  });

  const [isWatchingAll, setIsWatchingAll] = useState(false);

  useEffect(() => {
    if (activeEpisode.id !== 1) {
      setIsWatchingAll(true);
    } else {
      setIsWatchingAll(false);
    }
  }, [activeDrama.id, activeEpisode.id]);

  useEffect(() => {
    localStorage.setItem("shortdrama_autoplay", String(isAutoPlay));
  }, [isAutoPlay]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wasHoldingRef = useRef(false);

  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const lastWheelTimeRef = useRef<number>(0);

  // Is current episode unlocked?
  const isEpisodeLocked = false;

  const [hasInteracted, setHasInteracted] = useState(true);

  // Initialize/Load comments for this drama
  useEffect(() => {
    const textList = MOCK_COMMENTS[activeDrama.id] || [
      "Wah seru banget episodenya!",
      "Gak bisa brenti nonton short drama emang paling top!",
      "Aktingnya keren dan ceritanya antimainstream!"
    ];

    const parsedComments: Comment[] = textList.map((text, idx) => ({
      id: `comment-${idx}`,
      username: `@user_${Math.floor(Math.random() * 9000 + 1000)}`,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${idx + activeDrama.id}`,
      text,
      likes: Math.floor(Math.random() * 500 + 5),
      time: "2 jam yang lalu"
    }));

    setComments(parsedComments);
    setHasInteracted(true); // Ensure autoplay interaction is active for new episodes
    setIsPlaying(true);
    setIsFastForwarding(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
    }
  }, [activeDrama, activeEpisode]);

  // Video autoplay play/pause logic for standard native video elements
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && !isEpisodeLocked) {
        videoRef.current.play().catch(() => {
          // Fallback if browser blocks autoplay (unmuted)
          setIsMuted(true);
          videoRef.current?.play().catch(err => console.log("Autoplay blocked", err));
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, activeEpisode, isEpisodeLocked]);

  // Fallback autoplay countdown for third-party embeds (e.g. DoodStream, Youtube)
  useEffect(() => {
    if (!isPlaying || !isAutoPlay || !isEmbedUrl(activeEpisode.videoUrl) || isEpisodeLocked || !hasInteracted) {
      return;
    }
    
    const seconds = parseDurationToSeconds(activeEpisode.duration);
    // Auto play next episode after duration + a small loading/buffer margin of 3 seconds
    const timerId = setTimeout(() => {
      handleNextEpisode();
    }, (seconds + 3) * 1000);
    
    return () => clearTimeout(timerId);
  }, [isPlaying, isAutoPlay, activeEpisode, isEpisodeLocked, hasInteracted]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEpisodeLocked) return;
    if (e.button !== 0) return;

    // Capture initial coordinates for swipe detection
    touchStartYRef.current = e.clientY;
    touchStartXRef.current = e.clientX;

    wasHoldingRef.current = false;
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);

    holdTimeoutRef.current = setTimeout(() => {
      setIsFastForwarding(true);
      wasHoldingRef.current = true;
      if (videoRef.current) {
        videoRef.current.playbackRate = 2.0;
      }
    }, 250);
  };

  const handlePointerUpOrLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    // Swipe gesture check
    if (touchStartYRef.current !== null) {
      const deltaY = e.clientY - touchStartYRef.current;
      const deltaX = e.clientX - touchStartXRef.current!;
      
      // If vertical movement exceeds threshold (40px) and is primary direction
      if (Math.abs(deltaY) > 40 && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY < 0) {
          // Swiped up (drag finger up) -> Go to next episode
          handleNextEpisode();
        } else {
          // Swiped down (drag finger down) -> Go to previous episode
          handlePrevEpisode();
        }
        wasHoldingRef.current = true;
      }
      
      touchStartYRef.current = null;
      touchStartXRef.current = null;
    }

    if (isFastForwarding) {
      setIsFastForwarding(false);
      if (videoRef.current) {
        videoRef.current.playbackRate = 1.0;
      }
      wasHoldingRef.current = true;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    // Rate limit wheel scroll triggers to 800ms to avoid skipping multiple episodes in a single scroll roll
    if (now - lastWheelTimeRef.current < 800) {
      return;
    }

    if (Math.abs(e.deltaY) > 30) {
      if (e.deltaY > 0) {
        // Scrolled down -> Go to next episode
        handleNextEpisode();
      } else {
        // Scrolled up -> Go to previous episode
        handlePrevEpisode();
      }
      lastWheelTimeRef.current = now;
    }
  };

  const handleVideoTap = () => {
    if (isEpisodeLocked) return;
    
    if (wasHoldingRef.current) {
      wasHoldingRef.current = false;
      return;
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEpisodeLocked) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHeartCoords({ x, y });
    setShowHeartOverlay(true);

    const isLiked = likedEpisodes.includes(`${activeDrama.id}_${activeEpisode.id}`);
    if (!isLiked) {
      toggleLikeEpisode(activeDrama.id, activeEpisode.id);
    }

    setTimeout(() => {
      setShowHeartOverlay(false);
    }, 800);
  };

  const handleToggleLike = () => {
    toggleLikeEpisode(activeDrama.id, activeEpisode.id);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `comment-user-${Date.now()}`,
      username: "@Anda (Me)",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=me",
      text: commentText,
      likes: 0,
      time: "Baru saja"
    };

    setComments([newComment, ...comments]);
    setCommentText("");
  };

  const handleUnlock = () => {
    const success = onUnlockEpisode(activeDrama.id, activeEpisode.id, activeEpisode.coinsToUnlock);
    if (success) {
      setIsPlaying(true);
    } else {
      alert("Koin Anda tidak cukup! Kunjungi tab 'My Space' atau tonton iklan simulasi di bawah untuk menambah koin.");
    }
  };

  const handleShare = () => {
    const origin = window.location.origin + window.location.pathname;
    const shareUrl = `${origin}?drama=${activeDrama.id}&episode=${activeEpisode.id}`;
    
    try {
      navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => {
        setShowShareToast(false);
      }, 2500);
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setShowShareToast(true);
        setTimeout(() => {
          setShowShareToast(false);
        }, 2500);
      } catch (copyErr) {
        console.error("Gagal menyalin link:", copyErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleNextEpisode = () => {
    if (!isWatchingAll && dramas && dramas.length > 0) {
      const otherDramas = dramas.filter(d => d.id !== activeDrama.id);
      const pool = otherDramas.length > 0 ? otherDramas : dramas;
      const randomDrama = pool[Math.floor(Math.random() * pool.length)];
      const ep1 = randomDrama.episodes.find(e => e.id === 1) || randomDrama.episodes[0];
      if (ep1) {
        onEpisodeChange(randomDrama, ep1);
        return;
      }
    }

    const nextIdx = activeDrama.episodes.findIndex(ep => ep.id === activeEpisode.id) + 1;
    if (nextIdx < activeDrama.episodes.length) {
      onEpisodeChange(activeDrama, activeDrama.episodes[nextIdx]);
    } else {
      alert("Anda telah mencapai episode terakhir dari drama ini!");
    }
  };

  const handlePrevEpisode = () => {
    if (!isWatchingAll && dramas && dramas.length > 0) {
      const otherDramas = dramas.filter(d => d.id !== activeDrama.id);
      const pool = otherDramas.length > 0 ? otherDramas : dramas;
      const randomDrama = pool[Math.floor(Math.random() * pool.length)];
      const ep1 = randomDrama.episodes.find(e => e.id === 1) || randomDrama.episodes[0];
      if (ep1) {
        onEpisodeChange(randomDrama, ep1);
        return;
      }
    }

    const prevIdx = activeDrama.episodes.findIndex(ep => ep.id === activeEpisode.id) - 1;
    if (prevIdx >= 0) {
      onEpisodeChange(activeDrama, activeDrama.episodes[prevIdx]);
    }
  };

  const isLiked = likedEpisodes.includes(`${activeDrama.id}_${activeEpisode.id}`);

  return (
    <div id="player-container" className="relative h-screen bg-black text-neutral-100 flex flex-col justify-center items-center overflow-hidden">
      
      {/* Outer shell fitting portrait frame */}
      <div className="relative w-full h-full max-w-md bg-neutral-950 flex flex-col justify-center items-center shadow-2xl border-x border-neutral-900">
        
        {/* Top bar back overlay controls */}
        <div className="absolute top-4 left-4 right-4 z-40 flex justify-between items-center glass p-2.5 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-accent uppercase font-sans tracking-widest">
              SHORT DRAMA THEATER
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Auto-Play Toggle */}
            <button
              id="autoplay-toggle"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                isAutoPlay 
                  ? "bg-accent/15 border-accent/30 text-accent hover:bg-accent/20" 
                  : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
              }`}
              title={isAutoPlay ? "Auto-Play Aktif" : "Auto-Play Nonaktif"}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isAutoPlay ? "bg-accent animate-pulse" : "bg-neutral-500"}`} />
              Auto: {isAutoPlay ? "ON" : "OFF"}
            </button>

            <button 
              id="volume-toggle"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 glass rounded-full hover:bg-white/5 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-accent" />}
            </button>
          </div>
        </div>

        {/* Vertical Swiper arrows overlay */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
          <button
            id="prev-episode-button"
            onClick={handlePrevEpisode}
            disabled={isWatchingAll && activeDrama.episodes.findIndex(ep => ep.id === activeEpisode.id) === 0}
            className="p-2.5 glass hover:bg-white/5 disabled:opacity-30 transition-all shadow-md hover:border-accent/30"
            title="Episode Sebelumnya"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            id="next-episode-button"
            onClick={handleNextEpisode}
            disabled={isWatchingAll && activeDrama.episodes.findIndex(ep => ep.id === activeEpisode.id) === activeDrama.episodes.length - 1}
            className="p-2.5 glass hover:bg-white/5 disabled:opacity-30 transition-all shadow-md hover:border-accent/30"
            title="Episode Berikutnya"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Display */}
        <div 
          id="active-video-wrapper"
          className="relative w-full h-full flex items-center justify-center cursor-pointer select-none"
          onClick={handleVideoTap}
          onDoubleClick={handleDoubleTap}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUpOrLeave}
          onPointerLeave={handlePointerUpOrLeave}
          onWheel={handleWheel}
        >
          {!isEpisodeLocked ? (
            isEmbedUrl(activeEpisode.videoUrl) ? (
              <div className="relative w-full h-full overflow-hidden bg-neutral-950 flex items-center justify-center">
                {!hasInteracted ? (
                  /* Premium Click-to-Play Drama Poster Screen */
                  <div
                    className="absolute inset-0 z-30 flex flex-col justify-between p-6 transition-all duration-500"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.92)), url(${activeDrama.cover})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  >
                    {/* Header Details */}
                    <div className="pt-12 flex flex-col items-center text-center">
                      <span className="bg-accent/20 border border-accent/40 text-accent text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 backdrop-blur-md">
                        PREMIUM STREAMING
                      </span>
                      <h2 className="text-xl font-black uppercase tracking-tight text-white mb-1 drop-shadow-md">
                        {activeDrama.title}
                      </h2>
                      <p className="text-xs text-neutral-300 font-medium">
                        Episode {activeEpisode.id} • {activeEpisode.title}
                      </p>
                    </div>

                    {/* Central Golden Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHasInteracted(true);
                        setIsPlaying(true);
                      }}
                      className="mx-auto w-20 h-20 bg-accent hover:bg-accent-dark text-white rounded-full flex items-center justify-center shadow-2xl shadow-accent/40 border-4 border-white/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                    >
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </button>

                    {/* Bottom Metadata Info */}
                    <div className="pb-24 flex flex-col items-center text-center">
                      <p className="text-[10px] text-neutral-400 max-w-xs font-light mb-3">
                        Klik tombol di atas untuk memutar video drama eksklusif beresolusi HD tanpa iklan gangguan.
                      </p>
                      <div className="flex gap-4 items-center text-[10px] text-neutral-300 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                        <span className="font-semibold text-accent">Durasi: {activeEpisode.duration}</span>
                        <span className="h-3 w-[1px] bg-white/10" />
                        <span>Format: HD H.265</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Clean, Sandboxed and Scaled Iframe Player */
                  <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-black">
                    <iframe
                      id="active-embed-element"
                      src={formatVideoUrl(activeEpisode.videoUrl)}
                      title={activeEpisode.title}
                      className="w-[108%] h-[108%] scale-[1.08] border-0 absolute pointer-events-auto"
                      allowFullScreen
                      sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                      allow="autoplay; encrypted-media; picture-in-picture"
                    />

                    {/* Custom Corner Overlays to replace host elements & watermarks */}
                    {/* Top Right Corner Badge Mask */}
                    <div className="absolute top-16 right-3 z-30 pointer-events-none bg-neutral-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2 shadow-xl">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black tracking-widest text-neutral-200 uppercase font-mono">
                        SD STREAM PLAYER
                      </span>
                    </div>

                    {/* Bottom Right Corner watermark cover */}
                    <div className="absolute bottom-20 right-3 z-30 pointer-events-none bg-neutral-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center gap-1 shadow-lg">
                      <span className="text-[8px] font-bold tracking-wider text-neutral-400 uppercase font-mono">
                        SECURE HOSTING ACTIVE
                      </span>
                    </div>

                    {/* Top Left back overlay in case it covers standard elements */}
                    <div className="absolute top-16 left-3 z-30 pointer-events-none bg-neutral-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5 shadow-xl">
                      <span className="text-[9px] font-black text-accent uppercase tracking-wider font-sans">
                        EPISODE {activeEpisode.id}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <video
                id="active-video-element"
                ref={videoRef}
                src={activeEpisode.videoUrl}
                loop={!isAutoPlay}
                playsInline
                muted={isMuted}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onEnded={() => {
                  if (isAutoPlay) {
                    handleNextEpisode();
                  }
                }}
              />
            )
          ) : (
            // Episode Locked Screen Layer
            <div 
              id="locked-paywall-screen"
              className="absolute inset-0 bg-neutral-950 flex flex-col justify-center items-center p-6 text-center z-20"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url(${activeDrama.cover})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass rounded-3xl p-6 shadow-2xl max-w-xs flex flex-col items-center"
              >
                <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-black uppercase text-accent tracking-wide font-sans mb-2">
                  Episode {activeEpisode.id} Terkunci
                </h3>
                <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
                  Buka episode <span className="text-neutral-200 font-bold">"{activeEpisode.title}"</span> seharga <span className="text-accent font-bold">{activeEpisode.coinsToUnlock} Koin</span> untuk menyaksikan puncak drama cinta dan ketegangan!
                </p>

                <div className="w-full space-y-2.5">
                  <button
                    id="btn-unlock-coins"
                    onClick={(e) => { e.stopPropagation(); handleUnlock(); }}
                    className="w-full bg-accent hover:bg-accent-dark text-white font-black text-sm py-3 px-4 rounded-xl shadow-lg shadow-accent/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Unlock className="w-4 h-4 stroke-[2.5]" />
                    Buka dengan {activeEpisode.coinsToUnlock} Koin
                  </button>

                  <button
                    id="btn-claim-ads-coins"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onAddCoins(50);
                      alert("Hebat! Anda baru saja menonton iklan sponsor simulasi dan mendapatkan 50 Koin Gratis!");
                    }}
                    className="w-full glass text-accent hover:bg-white/5 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    Tonton Iklan (+50 Koin Gratis)
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Double-tap heart splash animation */}
          <AnimatePresence>
            {showHeartOverlay && (
              <motion.div
                key="heart-overlay"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [0.3, 1.2, 1], opacity: [0, 1, 0.9] }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute z-40 pointer-events-none"
                style={{ left: heartCoords.x - 40, top: heartCoords.y - 40 }}
              >
                <Heart className="w-20 h-20 text-red-500 fill-red-500 drop-shadow-xl" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tap Play/Pause Indicator Overlay */}
          <AnimatePresence>
            {!isPlaying && !isEpisodeLocked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="absolute bg-black/60 p-5 rounded-full z-10 pointer-events-none border border-neutral-800"
              >
                <Play className="w-8 h-8 text-accent fill-accent" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fast Forward 2x Speed HUD Overlay */}
          <AnimatePresence>
            {isFastForwarding && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md border border-accent/40 text-white px-4 py-2 rounded-full z-40 pointer-events-none flex items-center gap-2 shadow-lg"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-[11px] font-black tracking-widest uppercase text-accent font-sans">
                  2X PEMUTARAN CEPAT
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Share Toast Notification Overlay */}
          <AnimatePresence>
            {showShareToast && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-neutral-900/95 backdrop-blur-md border border-emerald-500/30 text-white px-4 py-3 rounded-2xl z-40 pointer-events-none flex items-center gap-2.5 shadow-xl shadow-black/50 min-w-[280px] justify-center"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-neutral-100 uppercase tracking-wide">
                    Tautan Disalin!
                  </span>
                  <span className="text-[9px] text-neutral-400">
                    Berhasil menyalin link Episode {activeEpisode.id}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom & Side Info Overlays */}
          {!isEpisodeLocked && (
            <>
              {/* Bottom Drama Info Description */}
              <div 
                id="drama-video-overlay-details"
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent z-10 flex flex-col pt-16 pointer-events-none"
              >
                <div className="pointer-events-auto animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-md font-extrabold uppercase tracking-widest shadow-md shadow-accent/15">
                      {activeDrama.category}
                    </span>
                    <button
                      id="btn-trigger-selector"
                      onClick={() => setShowEpisodeSelector(true)}
                      className="text-xs glass text-neutral-200 px-2.5 py-1 rounded-full flex items-center gap-1 hover:border-accent/20 transition-colors"
                    >
                      EP {activeEpisode.id} dari {activeDrama.episodesCount} <ChevronUp className="w-3 h-3 text-accent" />
                    </button>
                  </div>
                  
                  <h3 className="text-base font-black text-white tracking-wide uppercase font-sans mb-1 leading-snug">
                    {activeDrama.title}
                  </h3>
                  <h4 className="text-sm font-bold text-accent font-sans line-clamp-1 mb-2">
                    Ep {activeEpisode.id}: {activeEpisode.title}
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed font-light line-clamp-2 max-w-[85%]">
                    {activeDrama.description}
                  </p>

                  {/* Watch All Episodes / Series Mode Button */}
                  {!isWatchingAll ? (
                    <button
                      id="btn-tonton-semua"
                      onClick={() => {
                        setIsWatchingAll(true);
                        setShowEpisodeSelector(true);
                      }}
                      className="mt-3.5 w-full bg-gradient-to-r from-accent to-red-500 hover:from-accent/90 hover:to-red-600 text-white font-extrabold text-[11px] tracking-wider uppercase py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                      Tonton Semua Episode ({activeDrama.episodesCount})
                    </button>
                  ) : (
                    <button
                      id="btn-tonton-semua-active"
                      onClick={() => {
                        setIsWatchingAll(false);
                      }}
                      className="mt-3 w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10px] tracking-wider uppercase py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 hover:bg-emerald-500/20 transition-all duration-300 cursor-pointer animate-pulse"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Mode Seri: Aktif (Ganti ke Jelajah Acak)
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side Control Buttons Panel */}
              <div 
                id="floating-interaction-panel"
                className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-5"
              >
                {/* Character Avatar/Profile Bubble */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-accent overflow-hidden shadow-lg shadow-accent/20 active:scale-95 transition-transform bg-neutral-900">
                    <img
                      src={activeDrama.characters[0]?.avatar || activeDrama.cover}
                      alt="Cast avatar"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[9px] text-accent font-extrabold mt-1 uppercase tracking-tight glass px-1.5 py-0.5 rounded border border-accent/10">
                    AI Chat
                  </span>
                </div>

                {/* Like Button */}
                <button
                  id="action-like"
                  onClick={handleToggleLike}
                  className="flex flex-col items-center group active:scale-90 transition-transform"
                >
                  <div className={`p-3 rounded-full border shadow-xl transition-colors ${
                    isLiked 
                      ? "bg-accent/10 border-accent/30 text-accent" 
                      : "glass text-neutral-300 hover:text-white"
                  }`}>
                    <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${isLiked ? "fill-accent" : ""}`} />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-300 mt-1 shadow-sm">
                    {isLiked ? "Liked" : activeEpisode.likes}
                  </span>
                </button>

                {/* Comment Button */}
                <button
                  id="action-comment"
                  onClick={() => setShowComments(true)}
                  className="flex flex-col items-center group active:scale-90 transition-transform"
                >
                  <div className="p-3 rounded-full glass text-neutral-300 hover:text-white shadow-xl">
                    <MessageCircle className="w-5 h-5 group-hover:scale-110" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-300 mt-1">
                    {comments.length}
                  </span>
                </button>

                {/* Share Button */}
                <button
                  id="action-share"
                  onClick={handleShare}
                  className="flex flex-col items-center group active:scale-90 transition-transform"
                >
                  <div className="p-3 rounded-full glass text-neutral-300 hover:text-white shadow-xl">
                    <Share2 className="w-5 h-5 group-hover:scale-110" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-300 mt-1">
                    Share
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* BOTTOM DRAWER 1: Comments Sheet Overlay */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              id="comments-sheet-drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`absolute bottom-0 left-0 right-0 h-[65%] rounded-t-3xl z-50 flex flex-col shadow-2xl border-t border-x-0 border-b-0 transition-all duration-300 ${
                isDarkMode 
                  ? "bg-neutral-900/95 border-white/10 text-white" 
                  : "bg-white border-neutral-200 text-neutral-900"
              }`}
            >
              {/* Comment Header */}
              <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? "border-white/10" : "border-neutral-200"}`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 font-sans ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
                  <MessageSquare className="w-4 h-4 text-accent" /> Komentar ({comments.length})
                </h3>
                <button
                  id="close-comments"
                  onClick={() => setShowComments(false)}
                  className={`font-bold text-xs px-3 py-1 rounded-full border transition-all duration-300 ${
                    isDarkMode 
                      ? "text-neutral-400 hover:text-neutral-200 bg-white/5 border-white/10 hover:bg-white/10" 
                      : "text-neutral-600 hover:text-neutral-900 bg-neutral-100 border-neutral-200 hover:bg-neutral-200"
                  }`}
                >
                  Tutup
                </button>
              </div>

              {/* Comment Lists Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.avatar}
                      alt={comment.username}
                      className={`w-8 h-8 rounded-full border bg-neutral-950 ${isDarkMode ? "border-white/10" : "border-neutral-200"}`}
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className={`text-xs font-bold ${isDarkMode ? "text-neutral-300" : "text-neutral-800"}`}>{comment.username}</span>
                        <span className="text-[9px] text-neutral-500">{comment.time}</span>
                      </div>
                      <p className={`text-xs font-light leading-relaxed ${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Post Comment Input Bar */}
              <form onSubmit={handlePostComment} className={`p-4 border-t border-x-0 border-b-0 flex gap-2 rounded-t-2xl transition-colors duration-300 ${
                isDarkMode 
                  ? "bg-neutral-900 border-white/10" 
                  : "bg-neutral-50 border-neutral-200"
              }`}>
                <input
                  id="comment-input-field"
                  type="text"
                  placeholder="Ketik komentar romantis Anda..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className={`flex-1 border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-accent/50 transition-colors ${
                    isDarkMode 
                      ? "bg-white/5 border-white/10 text-neutral-100 placeholder:text-neutral-500" 
                      : "bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 shadow-sm"
                  }`}
                />
                <button
                  id="comment-submit"
                  type="submit"
                  className="bg-accent hover:bg-accent-dark text-white px-3.5 rounded-xl flex items-center justify-center transition-all font-bold shadow-md active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM DRAWER 2: Episode Selector List Drawer */}
        <AnimatePresence>
          {showEpisodeSelector && (
            <motion.div
              id="episodes-selector-drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`absolute bottom-0 left-0 right-0 h-[50%] rounded-t-3xl z-50 flex flex-col shadow-2xl border-t border-x-0 border-b-0 transition-all duration-300 ${
                isDarkMode 
                  ? "bg-neutral-900/95 border-white/10 text-white" 
                  : "bg-white border-neutral-200 text-neutral-900"
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? "border-white/10" : "border-neutral-200"}`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
                  Pilih Episode ({activeDrama.episodesCount})
                </h3>
                <button
                  id="close-episodes-selector"
                  onClick={() => setShowEpisodeSelector(false)}
                  className={`font-bold text-xs px-3 py-1 rounded-full border transition-all duration-300 ${
                    isDarkMode 
                      ? "text-neutral-400 hover:text-neutral-200 bg-white/5 border-white/10 hover:bg-white/10" 
                      : "text-neutral-600 hover:text-neutral-900 bg-neutral-100 border-neutral-200 hover:bg-neutral-200"
                  }`}
                >
                  Tutup
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {activeDrama.episodes.map((ep) => {
                  const isCurrent = ep.id === activeEpisode.id;
                  const isLocked = ep.isLocked;

                  return (
                    <div
                      id={`selector-row-${ep.id}`}
                      key={ep.id}
                      onClick={() => {
                        onEpisodeChange(activeDrama, ep);
                        setShowEpisodeSelector(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        isCurrent
                          ? "bg-accent/10 border-accent/40 text-accent"
                          : isDarkMode
                            ? "bg-white/5 border-white/5 hover:bg-white/10 text-neutral-300"
                            : "bg-neutral-100 border-neutral-200 hover:bg-neutral-200 text-neutral-700 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-extrabold w-5 ${isCurrent ? "text-accent" : "text-neutral-500"}`}>
                          {ep.id}
                        </span>
                        <div>
                          <p className={`text-xs font-bold ${isCurrent ? "text-accent font-black" : isDarkMode ? "text-neutral-200" : "text-neutral-800"}`}>
                            {ep.title}
                          </p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">Durasi: {ep.duration}</p>
                        </div>
                      </div>

                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                        Gratis
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
