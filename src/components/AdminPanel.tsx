import React, { useState } from "react";
import { Drama, Episode, AdminAccount } from "../types";
import { 
  LayoutDashboard, Film, Tv, Users, Settings, 
  Plus, Edit, Trash2, LogOut, ArrowLeft, Save, 
  X, Unlock, Lock, ShieldCheck, TrendingUp, Coins, 
  Eye, Star, Sparkles, Database, Mail, UserCheck, 
  MessageSquare, Heart, RefreshCw, AlertTriangle, Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminPanelProps {
  dramas: Drama[];
  setDramas: (newDramas: Drama[]) => void;
  admins: AdminAccount[];
  setAdmins: (newAdmins: AdminAccount[]) => void;
  onLogout: () => void;
  activeAdmin: AdminAccount;
}

export default function AdminPanel({
  dramas,
  setDramas,
  admins,
  setAdmins,
  onLogout,
  activeAdmin
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "dramas" | "episodes" | "admins" | "settings">("dashboard");
  
  // States for Drama Management
  const [editingDrama, setEditingDrama] = useState<Drama | null>(null);
  const [isAddingDrama, setIsAddingDrama] = useState(false);
  const [dramaForm, setDramaForm] = useState({
    title: "",
    description: "",
    cover: "",
    category: "CEO/Billionaire" as Drama["category"],
    views: "1.0M",
    rating: 4.8,
    char1Name: "",
    char1Role: "",
    char1Actor: "",
    char1Avatar: "",
    char2Name: "",
    char2Role: "",
    char2Actor: "",
    char2Avatar: ""
  });

  // States for Episode Management
  const [selectedDramaIdForEpisodes, setSelectedDramaIdForEpisodes] = useState<string>(dramas[0]?.id || "");
  const [editingEpisode, setEditingEpisode] = useState<{ dramaId: string; episode: Episode } | null>(null);
  const [isAddingEpisode, setIsAddingEpisode] = useState(false);
  const [episodeForm, setEpisodeForm] = useState({
    title: "",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-looking-seriously-at-camera-40153-large.mp4",
    isLocked: true,
    coinsToUnlock: 30,
    duration: "01:30"
  });

  // States for Admin Account Management
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [adminForm, setAdminForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Content Editor" as AdminAccount["role"]
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Simulated trend data for SVG Chart
  const revenueTrend = [
    { day: "Sen", coins: 1420, views: 5200 },
    { day: "Sel", coins: 1850, views: 6100 },
    { day: "Rab", coins: 2100, views: 7300 },
    { day: "Kam", coins: 1650, views: 6800 },
    { day: "Jum", coins: 2400, views: 8900 },
    { day: "Sab", coins: 3100, views: 12400 },
    { day: "Min", coins: 3800, views: 14500 }
  ];

  // Helper stats
  const totalDramas = dramas.length;
  const totalEpisodes = dramas.reduce((acc, d) => acc + d.episodes.length, 0);
  const totalViews = dramas.reduce((acc, d) => {
    const cleanNum = parseFloat(d.views.replace("M", ""));
    return acc + (isNaN(cleanNum) ? 0 : cleanNum);
  }, 0).toFixed(1) + "M";

  const totalUnlocksCost = dramas.reduce((acc, d) => {
    return acc + d.episodes.reduce((eAcc, ep) => eAcc + (ep.isLocked ? ep.coinsToUnlock : 0), 0);
  }, 0);

  // Drama form handlers
  const handleSaveDrama = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dramaForm.title || !dramaForm.description) {
      alert("Judul dan Sinopsis harus diisi!");
      return;
    }

    const defaultCover = dramaForm.cover || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600";
    
    const charactersList = [
      {
        id: "char_1_" + Date.now(),
        name: dramaForm.char1Name || "Karakter Utama Pria",
        role: dramaForm.char1Role || "CEO / Billionaire",
        actor: dramaForm.char1Actor || "Aktor Utama",
        avatar: dramaForm.char1Avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300"
      },
      {
        id: "char_2_" + Date.now(),
        name: dramaForm.char2Name || "Karakter Utama Wanita",
        role: dramaForm.char2Role || "Wanita Tangguh",
        actor: dramaForm.char2Actor || "Aktris Utama",
        avatar: dramaForm.char2Avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300"
      }
    ];

    if (editingDrama) {
      // Edit mode
      const updatedDramas = dramas.map(d => {
        if (d.id === editingDrama.id) {
          return {
            ...d,
            title: dramaForm.title,
            description: dramaForm.description,
            cover: defaultCover,
            category: dramaForm.category,
            views: dramaForm.views,
            rating: Number(dramaForm.rating),
            characters: charactersList
          };
        }
        return d;
      });
      setDramas(updatedDramas);
      setEditingDrama(null);
      alert(`Drama "${dramaForm.title}" berhasil diperbarui!`);
    } else {
      // Add mode
      const newDrama: Drama = {
        id: "drama_" + Date.now(),
        title: dramaForm.title,
        description: dramaForm.description,
        cover: defaultCover,
        category: dramaForm.category,
        views: dramaForm.views,
        rating: Number(dramaForm.rating),
        episodesCount: 1,
        characters: charactersList,
        episodes: [
          {
            id: 1,
            title: "Episode Perdana: Pertemuan Tak Terduga",
            videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-businessman-in-suit-walking-down-hallway-40158-large.mp4",
            isLocked: false,
            coinsToUnlock: 0,
            duration: "01:20",
            likes: "10K",
            commentsCount: 24
          }
        ]
      };
      setDramas([newDrama, ...dramas]);
      setIsAddingDrama(false);
      alert(`Drama "${dramaForm.title}" berhasil ditambahkan dengan Episode 1 gratis!`);
    }

    // Reset Form
    resetDramaForm();
  };

  const handleEditDramaClick = (drama: Drama) => {
    setEditingDrama(drama);
    setIsAddingDrama(false);
    setDramaForm({
      title: drama.title,
      description: drama.description,
      cover: drama.cover,
      category: drama.category,
      views: drama.views,
      rating: drama.rating,
      char1Name: drama.characters[0]?.name || "",
      char1Role: drama.characters[0]?.role || "",
      char1Actor: drama.characters[0]?.actor || "",
      char1Avatar: drama.characters[0]?.avatar || "",
      char2Name: drama.characters[1]?.name || "",
      char2Role: drama.characters[1]?.role || "",
      char2Actor: drama.characters[1]?.actor || "",
      char2Avatar: drama.characters[1]?.avatar || ""
    });
  };

  const handleDeleteDrama = (dramaId: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus seluruh drama "${title}"? Tindakan ini tidak bisa dibatalkan.`)) {
      const updatedDramas = dramas.filter(d => d.id !== dramaId);
      setDramas(updatedDramas);
      if (selectedDramaIdForEpisodes === dramaId && updatedDramas.length > 0) {
        setSelectedDramaIdForEpisodes(updatedDramas[0].id);
      }
      alert(`Drama "${title}" telah dihapus.`);
    }
  };

  const resetDramaForm = () => {
    setDramaForm({
      title: "",
      description: "",
      cover: "",
      category: "CEO/Billionaire",
      views: "1.2M",
      rating: 4.8,
      char1Name: "",
      char1Role: "",
      char1Actor: "",
      char1Avatar: "",
      char2Name: "",
      char2Role: "",
      char2Actor: "",
      char2Avatar: ""
    });
  };

  // Episode Form handlers
  const handleSaveEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!episodeForm.title) {
      alert("Judul episode harus diisi!");
      return;
    }

    const activeDramaObj = dramas.find(d => d.id === selectedDramaIdForEpisodes);
    if (!activeDramaObj) return;

    if (editingEpisode) {
      // Edit mode
      const updatedEpisodes = activeDramaObj.episodes.map(ep => {
        if (ep.id === editingEpisode.episode.id) {
          return {
            ...ep,
            title: episodeForm.title,
            videoUrl: episodeForm.videoUrl,
            isLocked: episodeForm.isLocked,
            coinsToUnlock: episodeForm.isLocked ? Number(episodeForm.coinsToUnlock) : 0,
            duration: episodeForm.duration
          };
        }
        return ep;
      });

      const updatedDramas = dramas.map(d => {
        if (d.id === selectedDramaIdForEpisodes) {
          return {
            ...d,
            episodes: updatedEpisodes
          };
        }
        return d;
      });

      setDramas(updatedDramas);
      setEditingEpisode(null);
      alert("Episode berhasil diperbarui!");
    } else {
      // Add mode
      const nextId = activeDramaObj.episodes.length > 0 
        ? Math.max(...activeDramaObj.episodes.map(e => e.id)) + 1 
        : 1;

      const newEp: Episode = {
        id: nextId,
        title: episodeForm.title,
        videoUrl: episodeForm.videoUrl,
        isLocked: episodeForm.isLocked,
        coinsToUnlock: episodeForm.isLocked ? Number(episodeForm.coinsToUnlock) : 0,
        duration: episodeForm.duration,
        likes: "0",
        commentsCount: 0
      };

      const updatedDramas = dramas.map(d => {
        if (d.id === selectedDramaIdForEpisodes) {
          const newEpList = [...d.episodes, newEp];
          return {
            ...d,
            episodes: newEpList,
            episodesCount: newEpList.length
          };
        }
        return d;
      });

      setDramas(updatedDramas);
      setIsAddingEpisode(false);
      alert(`Episode ${nextId} "${episodeForm.title}" berhasil ditambahkan!`);
    }

    resetEpisodeForm();
  };

  const handleEditEpisodeClick = (dramaId: string, episode: Episode) => {
    setEditingEpisode({ dramaId, episode });
    setIsAddingEpisode(false);
    setEpisodeForm({
      title: episode.title,
      videoUrl: episode.videoUrl,
      isLocked: episode.isLocked,
      coinsToUnlock: episode.coinsToUnlock,
      duration: episode.duration
    });
  };

  const handleDeleteEpisode = (dramaId: string, episodeId: number, title: string) => {
    if (confirm(`Hapus Episode ${episodeId} "${title}"?`)) {
      const updatedDramas = dramas.map(d => {
        if (d.id === dramaId) {
          const newEpList = d.episodes.filter(ep => ep.id !== episodeId);
          // Re-index remaining episodes to keep sequence consecutive
          const reindexedEpList = newEpList.map((ep, idx) => ({
            ...ep,
            id: idx + 1
          }));
          return {
            ...d,
            episodes: reindexedEpList,
            episodesCount: reindexedEpList.length
          };
        }
        return d;
      });
      setDramas(updatedDramas);
      alert("Episode berhasil dihapus.");
    }
  };

  const resetEpisodeForm = () => {
    setEpisodeForm({
      title: "",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-looking-seriously-at-camera-40153-large.mp4",
      isLocked: true,
      coinsToUnlock: 30,
      duration: "01:30"
    });
  };

  // Admin Account Handlers
  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.username || !adminForm.email) {
      alert("Nama dan Email wajib diisi!");
      return;
    }

    if (editingAdmin) {
      const updated = admins.map(a => {
        if (a.id === editingAdmin.id) {
          return {
            ...a,
            username: adminForm.username,
            email: adminForm.email,
            role: adminForm.role
          };
        }
        return a;
      });
      setAdmins(updated);
      setEditingAdmin(null);
      alert(`Akun admin "${adminForm.username}" berhasil diperbarui!`);
    } else {
      const newAdmin: AdminAccount = {
        id: "admin_" + Date.now(),
        username: adminForm.username,
        email: adminForm.email,
        password: adminForm.password || "admin123",
        role: adminForm.role,
        createdAt: new Date().toLocaleDateString("id-ID")
      };
      setAdmins([...admins, newAdmin]);
      setIsAddingAdmin(false);
      alert(`Admin baru "${adminForm.username}" berhasil terdaftar! Password default: admin123`);
    }

    setAdminForm({ username: "", email: "", password: "", role: "Content Editor" });
  };

  const handleEditAdminClick = (admin: AdminAccount) => {
    setEditingAdmin(admin);
    setIsAddingAdmin(false);
    setAdminForm({
      username: admin.username,
      email: admin.email,
      password: "",
      role: admin.role
    });
  };

  const handleDeleteAdmin = (adminId: string, username: string) => {
    if (adminId === activeAdmin.id) {
      alert("Anda tidak bisa menghapus akun Anda sendiri yang sedang aktif!");
      return;
    }
    if (admins.length <= 1) {
      alert("Minimal harus ada satu akun administrator sistem!");
      return;
    }

    if (confirm(`Yakin ingin mencabut akses admin dari "${username}"?`)) {
      setAdmins(admins.filter(a => a.id !== adminId));
      alert(`Akun admin "${username}" telah dihapus.`);
    }
  };

  // Filter dramas list based on search
  const filteredDramas = dramas.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDramaObj = dramas.find(d => d.id === selectedDramaIdForEpisodes);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row w-full font-sans">
      
      {/* SIDEBAR NAVIGATION - DESKTOP */}
      <aside className="w-full md:w-64 bg-neutral-900/90 border-r border-white/5 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Admin Header Branding */}
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light uppercase">
                Melolo Admin
              </h2>
              <span className="text-[10px] text-neutral-400 bg-white/5 px-2 py-0.5 rounded font-mono">
                Control Suite v2.0
              </span>
            </div>
          </div>

          {/* Logged in Admin Profile */}
          <div className="p-4 mx-3 my-4 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/5">
            <div className="w-10 h-10 bg-accent/20 border border-accent/30 rounded-full flex items-center justify-center font-bold text-accent">
              {activeAdmin.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{activeAdmin.username}</p>
              <p className="text-[9px] text-accent font-mono uppercase tracking-wider">{activeAdmin.role}</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveSubTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "dashboard"
                  ? "bg-accent text-white shadow-md shadow-accent/15"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ringkasan Dashboard</span>
            </button>
            <button
              onClick={() => setActiveSubTab("dramas")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "dramas"
                  ? "bg-accent text-white shadow-md shadow-accent/15"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Kelola Seri Drama</span>
            </button>
            <button
              onClick={() => setActiveSubTab("episodes")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "episodes"
                  ? "bg-accent text-white shadow-md shadow-accent/15"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Kelola Episode</span>
            </button>
            <button
              onClick={() => setActiveSubTab("admins")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "admins"
                  ? "bg-accent text-white shadow-md shadow-accent/15"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Kelola Akun Admin</span>
            </button>
            <button
              onClick={() => setActiveSubTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "settings"
                  ? "bg-accent text-white shadow-md shadow-accent/15"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan Sistem</span>
            </button>
          </nav>
        </div>

        {/* Bottom Area - Return to web app / logout */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-neutral-300 hover:text-white transition-all border border-white/5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ke Web Melolo</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-black transition-all border border-red-500/10 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi Admin</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE CONTENT */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
        
        {/* Top welcome status bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight font-sans">
              {activeSubTab === "dashboard" && "Dashboard Ringkasan"}
              {activeSubTab === "dramas" && "Kelola Konten Seri Drama"}
              {activeSubTab === "episodes" && "Kelola Episode Drama"}
              {activeSubTab === "admins" && "Manajemen Akun Administrator"}
              {activeSubTab === "settings" && "Konfigurasi Sistem Utama"}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Mengontrol jalannya platform teater drama digital Melolo Lite secara real-time.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-neutral-400">Sistem Berjalan Normal (Cloud)</span>
          </div>
        </header>

        {/* SUBTAB CONTENT 1: DASHBOARD RINGKASAN */}
        {activeSubTab === "dashboard" && (
          <div className="space-y-8">
            
            {/* Quick Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="glass p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Total Seri Drama</p>
                    <h3 className="text-2xl font-black text-white mt-1">{totalDramas}</h3>
                  </div>
                  <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-xl text-accent">
                    <Film className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 mt-4">Katalog aktif di aplikasi user</p>
              </div>

              <div className="glass p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Total Video Episode</p>
                    <h3 className="text-2xl font-black text-white mt-1">{totalEpisodes}</h3>
                  </div>
                  <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-xl text-accent">
                    <Tv className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 mt-4">Rata-rata {(totalEpisodes / Math.max(1, totalDramas)).toFixed(1)} ep per drama</p>
              </div>

              <div className="glass p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Penayangan User</p>
                    <h3 className="text-2xl font-black text-white mt-1">{totalViews}</h3>
                  </div>
                  <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-xl text-accent">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 mt-4">Simulasi total views user</p>
              </div>

              <div className="glass p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Akun Admin Aktif</p>
                    <h3 className="text-2xl font-black text-white mt-1">{admins.length}</h3>
                  </div>
                  <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-xl text-accent">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 mt-4">Mempunyai hak akses pengeditan</p>
              </div>

            </div>

            {/* Custom SVG Trend Graph & Activity Log */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Graphic Chart representation inside 2cols */}
              <div className="lg:col-span-2 glass p-6 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-neutral-200">
                      Grafik Aktivitas Sistem (7 Hari Terakhir)
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Simulasi perputaran Koin & Penayangan Video</p>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-accent font-bold">
                      <span className="w-2.5 h-2.5 bg-accent rounded-full inline-block" /> Top-Up Koin
                    </span>
                    <span className="flex items-center gap-1.5 text-neutral-400 font-semibold">
                      <span className="w-2.5 h-2.5 bg-neutral-600 rounded-full inline-block" /> Views (Ratusan)
                    </span>
                  </div>
                </div>

                {/* SVG CUSTOM DRAWN AREA CHART */}
                <div className="w-full h-56 flex items-end justify-between px-2 pt-4 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5 border-y border-neutral-100 py-4" />
                  
                  {/* Visual path elements mapped inside SVG container */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF3B5C" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#FF3B5C" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Fill Area */}
                    <path
                      d="M 5,90 L 5,60 L 20,50 L 35,40 L 50,55 L 65,35 L 80,25 L 95,15 L 95,90 Z"
                      fill="url(#chart-grad)"
                      stroke="none"
                    />
                    {/* Stroke Line */}
                    <path
                      d="M 5,60 L 20,50 L 35,40 L 50,55 L 65,35 L 80,25 L 95,15"
                      fill="none"
                      stroke="#FF3B5C"
                      strokeWidth="2.5"
                    />
                  </svg>

                  {/* Intersecting bar display elements */}
                  {revenueTrend.map((t, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full z-10 group cursor-pointer relative">
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-neutral-900 border border-white/10 px-2.5 py-1.5 rounded-lg text-center shadow-2xl transition-all duration-300 pointer-events-none z-50">
                        <p className="text-[9px] text-neutral-400 uppercase font-bold">{t.day} Hari</p>
                        <p className="text-xs font-black text-accent">{t.coins} Koin</p>
                        <p className="text-[9px] text-white">Views: {t.views}</p>
                      </div>
                      
                      {/* Pointer Dot */}
                      <div className="w-2.5 h-2.5 bg-accent border-2 border-neutral-950 rounded-full group-hover:scale-150 transition-transform shadow shadow-accent/50 mb-1" />
                      
                      {/* Grid Day labels */}
                      <span className="text-[10px] text-neutral-400 font-bold mt-2">{t.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent User Actions / Moderation */}
              <div className="glass p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-neutral-200 mb-4 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-accent" /> Moderasi Komentar
                  </h3>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[11px] leading-relaxed relative group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-accent">Guest_User_#1337</span>
                        <span className="text-[9px] text-neutral-500 font-mono">1 jam lalu</span>
                      </div>
                      <p className="text-neutral-300">"Alexander keren banget, aslinya kaya tapi pura-pura miskin! Seru gilaaa."</p>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[11px] leading-relaxed relative group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-accent">Cinta_Drama_99</span>
                        <span className="text-[9px] text-neutral-500 font-mono">3 jam lalu</span>
                      </div>
                      <p className="text-neutral-300">"Adik Elena kejam sekali dibuang ke jurang. Gak sabar nunggu episode 3 kebuka!"</p>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[11px] leading-relaxed relative group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-accent">Wibu_Billionaire</span>
                        <span className="text-[9px] text-neutral-500 font-mono">Kemarin</span>
                      </div>
                      <p className="text-neutral-300">"Koinnya habis gan, untung ada wheel of fortune dapet koin gratis."</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button 
                    onClick={() => alert("Seluruh data laporan komentar bersih. Sistem spam-filter AI aktif!")}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl text-xs font-bold transition-all border border-white/5"
                  >
                    Tinjau Semua Komentar
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SUBTAB CONTENT 2: DRAMA MANAGEMENT */}
        {activeSubTab === "dramas" && (
          <div className="space-y-6">
            
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Cari drama berdasarkan judul..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-neutral-100 focus:outline-none focus:border-accent/50"
                />
              </div>

              <button
                onClick={() => {
                  setEditingDrama(null);
                  resetDramaForm();
                  setIsAddingDrama(true);
                }}
                className="w-full sm:w-auto bg-accent hover:bg-accent-dark text-white font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Tambah Seri Drama Baru
              </button>
            </div>

            {/* Drama Add/Edit Form Overlay Modal */}
            <AnimatePresence>
              {(isAddingDrama || editingDrama) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 15 }}
                    className="bg-neutral-900 border border-white/10 rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
                  >
                    <button
                      onClick={() => {
                        setIsAddingDrama(false);
                        setEditingDrama(null);
                      }}
                      className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <h2 className="text-base font-black uppercase text-white mb-6 flex items-center gap-2">
                      <Film className="w-5 h-5 text-accent" />
                      {editingDrama ? `Edit Drama: ${editingDrama.title}` : "Tambah Seri Drama Baru"}
                    </h2>

                    <form onSubmit={handleSaveDrama} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Judul Drama</label>
                          <input
                            type="text"
                            value={dramaForm.title}
                            onChange={(e) => setDramaForm({ ...dramaForm, title: e.target.value })}
                            className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent"
                            placeholder="Contoh: My Sweet CEO Husband"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Kategori / Genre</label>
                          <select
                            value={dramaForm.category}
                            onChange={(e) => setDramaForm({ ...dramaForm, category: e.target.value as Drama["category"] })}
                            className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent"
                          >
                            <option value="CEO/Billionaire">CEO/Billionaire</option>
                            <option value="Romance">Romance</option>
                            <option value="Werewolf">Werewolf</option>
                            <option value="Revenge">Revenge</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Rating (1.0 - 5.0)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={dramaForm.rating}
                            onChange={(e) => setDramaForm({ ...dramaForm, rating: Number(e.target.value) })}
                            className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Jumlah Simulasi Penonton (Views)</label>
                          <input
                            type="text"
                            value={dramaForm.views}
                            onChange={(e) => setDramaForm({ ...dramaForm, views: e.target.value })}
                            className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent"
                            placeholder="Contoh: 2.5M atau 850K"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Cover Image URL</label>
                          <input
                            type="url"
                            value={dramaForm.cover}
                            onChange={(e) => setDramaForm({ ...dramaForm, cover: e.target.value })}
                            className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent"
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Sinopsis Cerita</label>
                          <textarea
                            rows={3}
                            value={dramaForm.description}
                            onChange={(e) => setDramaForm({ ...dramaForm, description: e.target.value })}
                            className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent resize-none leading-relaxed"
                            placeholder="Tulis ringkasan alur cerita konflik..."
                            required
                          />
                        </div>
                      </div>

                      {/* Cast configuration section inside drama form */}
                      <div className="border-t border-white/5 pt-4 space-y-4">
                        <h4 className="text-xs font-black uppercase text-accent">Pengaturan Pemeran Utama</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl">
                          {/* Cast 1 */}
                          <div className="space-y-3">
                            <h5 className="text-[11px] font-bold text-neutral-300">Pemeran 1 (Utama Pria/Wanita)</h5>
                            <input
                              type="text"
                              value={dramaForm.char1Name}
                              onChange={(e) => setDramaForm({ ...dramaForm, char1Name: e.target.value })}
                              placeholder="Nama Karakter (Contoh: Alexander)"
                              className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-neutral-200 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={dramaForm.char1Role}
                              onChange={(e) => setDramaForm({ ...dramaForm, char1Role: e.target.value })}
                              placeholder="Peran Karakter (Contoh: CEO Dingin)"
                              className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-neutral-200 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={dramaForm.char1Actor}
                              onChange={(e) => setDramaForm({ ...dramaForm, char1Actor: e.target.value })}
                              placeholder="Nama Aktor Asli (Contoh: Reza Rahadian)"
                              className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-neutral-200 focus:outline-none"
                            />
                          </div>

                          {/* Cast 2 */}
                          <div className="space-y-3">
                            <h5 className="text-[11px] font-bold text-neutral-300">Pemeran 2 (Pasangan)</h5>
                            <input
                              type="text"
                              value={dramaForm.char2Name}
                              onChange={(e) => setDramaForm({ ...dramaForm, char2Name: e.target.value })}
                              placeholder="Nama Karakter (Contoh: Alesha)"
                              className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-neutral-200 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={dramaForm.char2Role}
                              onChange={(e) => setDramaForm({ ...dramaForm, char2Role: e.target.value })}
                              placeholder="Peran Karakter (Contoh: Istri Kontrak)"
                              className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-neutral-200 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={dramaForm.char2Actor}
                              onChange={(e) => setDramaForm({ ...dramaForm, char2Actor: e.target.value })}
                              placeholder="Nama Aktor Asli (Contoh: Chelsea Islan)"
                              className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-neutral-200 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingDrama(false);
                            setEditingDrama(null);
                          }}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl text-xs font-bold transition-all"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-accent/20 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          Simpan Drama
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List Table of Dramas */}
            <div className="glass rounded-3xl overflow-hidden border border-white/5">
              <div className="p-5 border-b border-white/5 bg-white/2">
                <h3 className="text-xs font-black uppercase text-neutral-300 tracking-wider">
                  Daftar Seri Drama Aktif ({filteredDramas.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-neutral-900/50 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6">Cover / Seri Drama</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Penonton</th>
                      <th className="p-4">Total Ep</th>
                      <th className="p-4 pr-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredDramas.map((drama) => (
                      <tr key={drama.id} className="hover:bg-white/2 text-xs text-neutral-300 group transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-4">
                            <img
                              src={drama.cover}
                              alt={drama.title}
                              className="w-10 h-14 object-cover rounded-xl border border-white/10 flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <h5 className="font-extrabold text-white text-sm line-clamp-1 group-hover:text-accent transition-colors uppercase tracking-tight">
                                {drama.title}
                              </h5>
                              <p className="text-[10px] text-neutral-500 line-clamp-1 mt-1 leading-relaxed">
                                {drama.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-accent/10 border border-accent/20 text-accent font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">
                            {drama.category}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-amber-500 flex items-center gap-1 mt-4">
                          <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                          {drama.rating}
                        </td>
                        <td className="p-4 font-mono font-medium text-neutral-400">
                          {drama.views}
                        </td>
                        <td className="p-4 font-bold text-neutral-200">
                          {drama.episodes.length} Episodes
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedDramaIdForEpisodes(drama.id);
                                setActiveSubTab("episodes");
                              }}
                              title="Kelola Episode Seri Ini"
                              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
                            >
                              <Tv className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEditDramaClick(drama)}
                              title="Edit Drama"
                              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-accent transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDrama(drama.id, drama.title)}
                              title="Hapus Drama"
                              className="p-2 bg-red-500/5 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {filteredDramas.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-neutral-500">
                          Tidak ada seri drama yang sesuai kata kunci.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB CONTENT 3: EPISODE MANAGEMENT */}
        {activeSubTab === "episodes" && (
          <div className="space-y-6">
            
            {/* Drama selector controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5">
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Pilih Seri Drama untuk Dikelola</label>
                <select
                  value={selectedDramaIdForEpisodes}
                  onChange={(e) => setSelectedDramaIdForEpisodes(e.target.value)}
                  className="bg-neutral-950 border border-white/10 rounded-xl py-2 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent font-bold w-full sm:w-80"
                >
                  {dramas.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.episodes.length} Ep)
                    </option>
                  ))}
                </select>
              </div>

              {activeDramaObj && (
                <button
                  onClick={() => {
                    setEditingEpisode(null);
                    resetEpisodeForm();
                    setIsAddingEpisode(true);
                  }}
                  className="w-full sm:w-auto self-end bg-accent hover:bg-accent-dark text-white font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" /> Tambah Episode Baru
                </button>
              )}
            </div>

            {/* Episode Add/Edit Form Overlay Modal */}
            <AnimatePresence>
              {isAddingEpisode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 15 }}
                    className="bg-neutral-900 border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative"
                  >
                    <button
                      onClick={() => setIsAddingEpisode(false)}
                      className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <h2 className="text-base font-black uppercase text-white mb-6 flex items-center gap-2">
                      <Tv className="w-5 h-5 text-accent" />
                      Tambah Episode Baru ({activeDramaObj?.title})
                    </h2>

                    <form onSubmit={handleSaveEpisode} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Judul Episode</label>
                        <input
                          type="text"
                          value={episodeForm.title}
                          onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                          className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent"
                          placeholder="Contoh: Sang Bos CEO Mulai Terpana"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Video Streaming URL</label>
                        <input
                          type="url"
                          value={episodeForm.videoUrl}
                          onChange={(e) => setEpisodeForm({ ...episodeForm, videoUrl: e.target.value })}
                          className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none"
                          placeholder="https://..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Durasi (Menit:Detik)</label>
                          <input
                            type="text"
                            value={episodeForm.duration}
                            onChange={(e) => setEpisodeForm({ ...episodeForm, duration: e.target.value })}
                            className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none"
                            placeholder="Contoh: 01:45"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Buka Koin</label>
                          <input
                            type="number"
                            value={episodeForm.coinsToUnlock}
                            onChange={(e) => setEpisodeForm({ ...episodeForm, coinsToUnlock: Number(e.target.value) })}
                            className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none"
                            placeholder="30"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/5 mt-2">
                        <input
                          type="checkbox"
                          id="is-locked-checkbox"
                          checked={episodeForm.isLocked}
                          onChange={(e) => setEpisodeForm({ ...episodeForm, isLocked: e.target.checked })}
                          className="w-4 h-4 text-accent bg-neutral-950 border-white/10 rounded focus:ring-accent"
                        />
                        <label htmlFor="is-locked-checkbox" className="text-xs font-bold text-neutral-200 cursor-pointer flex items-center gap-1.5">
                          {episodeForm.isLocked ? <Lock className="w-3.5 h-3.5 text-accent" /> : <Unlock className="w-3.5 h-3.5 text-emerald-500" />}
                          Kunci Episode Ini (Membutuhkan Koin untuk menonton)
                        </label>
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setIsAddingEpisode(false)}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl text-xs font-bold transition-all"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-accent/20"
                        >
                          <Save className="w-4 h-4" />
                          Simpan Episode
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Episode List Table */}
            {activeDramaObj ? (
              <div className="glass rounded-3xl overflow-hidden border border-white/5">
                <div className="p-5 border-b border-white/5 bg-white/2 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-neutral-300 tracking-wider">
                    Daftar Episode Seri: {activeDramaObj.title} ({activeDramaObj.episodes.length} Episode)
                  </h3>
                  <span className="text-[10px] bg-accent/10 border border-accent/20 text-accent font-black px-2 py-0.5 rounded-full uppercase">
                    Total Biaya Unlock: {totalUnlocksCost} Koin
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-neutral-900/50 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                        <th className="p-4 pl-6 w-16">ID Ep</th>
                        <th className="p-4">Judul Episode</th>
                        <th className="p-4">Durasi</th>
                        <th className="p-4">Suka (Likes)</th>
                        <th className="p-4">Status Akses</th>
                        <th className="p-4">Biaya Unlock</th>
                        <th className="p-4 pr-6 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {activeDramaObj.episodes.map((ep) => (
                        <tr key={ep.id} className="hover:bg-white/2 text-xs text-neutral-300 transition-colors">
                          <td className="p-4 pl-6 font-mono font-bold text-accent">
                            {ep.id}
                          </td>
                          <td className="p-4 font-bold text-white max-w-xs truncate">
                            {ep.title}
                          </td>
                          <td className="p-4 font-mono">
                            {ep.duration}
                          </td>
                          <td className="p-4 flex items-center gap-1 font-bold text-neutral-400 mt-3">
                            <Heart className="w-3.5 h-3.5 text-accent fill-accent" />
                            {ep.likes} Likes
                          </td>
                          <td className="p-4">
                            {ep.isLocked ? (
                              <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> Terkunci
                              </span>
                            ) : (
                              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1">
                                <Unlock className="w-2.5 h-2.5" /> Gratis (Bebas)
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-bold text-white">
                            {ep.isLocked ? `${ep.coinsToUnlock} Koin` : "0 Koin"}
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditEpisodeClick(activeDramaObj.id, ep)}
                                title="Edit Episode"
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-accent transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteEpisode(activeDramaObj.id, ep.id, ep.title)}
                                title="Hapus Episode"
                                className="p-2 bg-red-500/5 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {activeDramaObj.episodes.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-neutral-500">
                            Belum ada episode di drama ini. Klik "Tambah Episode Baru" di atas!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 glass rounded-3xl text-neutral-500">
                Buat Seri Drama terlebih dahulu sebelum mengelola episode.
              </div>
            )}

          </div>
        )}

        {/* SUBTAB CONTENT 4: MANAGE ADMIN ACCOUNTS */}
        {activeSubTab === "admins" && (
          <div className="space-y-6">
            
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
              <h4 className="text-xs font-black uppercase text-neutral-300 tracking-wider">
                Pengaturan Otoritas Keamanan Pengguna
              </h4>

              <button
                onClick={() => {
                  setEditingAdmin(null);
                  setIsAddingAdmin(true);
                  setAdminForm({ username: "", email: "", password: "", role: "Content Editor" });
                }}
                className="w-full sm:w-auto bg-accent hover:bg-accent-dark text-white font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Registrasi Akun Admin Baru
              </button>
            </div>

            {/* Admin Form Modal Overlay */}
            <AnimatePresence>
              {(isAddingAdmin || editingAdmin) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 15 }}
                    className="bg-neutral-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
                  >
                    <button
                      onClick={() => {
                        setIsAddingAdmin(false);
                        setEditingAdmin(null);
                      }}
                      className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <h2 className="text-base font-black uppercase text-white mb-6 flex items-center gap-2">
                      <Users className="w-5 h-5 text-accent" />
                      {editingAdmin ? `Edit Admin: ${editingAdmin.username}` : "Registrasi Akun Admin Baru"}
                    </h2>

                    <form onSubmit={handleSaveAdmin} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Nama Pengguna (Username)</label>
                        <input
                          type="text"
                          value={adminForm.username}
                          onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                          className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent"
                          placeholder="Contoh: hanz_editor"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Alamat Email Resmi</label>
                        <input
                          type="email"
                          value={adminForm.email}
                          onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                          className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent"
                          placeholder="editor@melolo.com"
                          required
                        />
                      </div>

                      {!editingAdmin && (
                        <div>
                          <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Sandi Masuk (Password)</label>
                          <input
                            type="password"
                            value={adminForm.password}
                            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                            className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent"
                            placeholder="Tinggalkan kosong untuk default (admin123)"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-black uppercase text-neutral-400 mb-1.5">Hak Akses Jabatan (Role)</label>
                        <select
                          value={adminForm.role}
                          onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as AdminAccount["role"] })}
                          className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-neutral-200 focus:outline-none focus:border-accent"
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Content Editor">Content Editor</option>
                          <option value="Manager">Manager</option>
                        </select>
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingAdmin(false);
                            setEditingAdmin(null);
                          }}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl text-xs font-bold transition-all"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-accent/20 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          Simpan Akun Admin
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List Table of Admins */}
            <div className="glass rounded-3xl overflow-hidden border border-white/5">
              <div className="p-5 border-b border-white/5 bg-white/2">
                <h3 className="text-xs font-black uppercase text-neutral-300 tracking-wider">
                  Daftar Administrator Platform Melolo ({admins.length} Pengguna)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-neutral-900/50 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6">Username / Profil</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Hak Akses (Role)</th>
                      <th className="p-4">Tanggal Registrasi</th>
                      <th className="p-4 pr-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {admins.map((adm) => {
                      const isActiveSession = adm.id === activeAdmin.id;
                      return (
                        <tr key={adm.id} className={`hover:bg-white/2 text-xs transition-colors ${isActiveSession ? "bg-accent/5" : "text-neutral-300"}`}>
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center font-bold text-accent">
                                {adm.username.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-extrabold text-white inline-flex items-center gap-1">
                                  {adm.username}
                                  {isActiveSession && (
                                    <span className="text-[8px] bg-accent text-white px-1.5 py-0.5 rounded uppercase font-mono tracking-wide font-black">
                                      Saya (Sesi Ini)
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono">
                            {adm.email}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              adm.role === "Super Admin" 
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                                : adm.role === "Manager"
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                : "bg-accent/10 border-accent/20 text-accent"
                            }`}>
                              {adm.role}
                            </span>
                          </td>
                          <td className="p-4 text-neutral-400">
                            {adm.createdAt}
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditAdminClick(adm)}
                                title="Edit Akun Admin"
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-accent transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAdmin(adm.id, adm.username)}
                                title="Hapus Hak Akses Admin"
                                disabled={isActiveSession}
                                className={`p-2 rounded-lg transition-colors ${isActiveSession ? "opacity-20 cursor-not-allowed text-neutral-600 bg-transparent" : "bg-red-500/5 hover:bg-red-500/20 text-red-500"}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB CONTENT 5: SYSTEM SETTINGS / RESET DATA */}
        {activeSubTab === "settings" && (
          <div className="space-y-6 max-w-xl">
            
            <div className="glass p-6 rounded-3xl space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-neutral-200 flex items-center gap-2">
                <Database className="w-5 h-5 text-accent" />
                Operasi Basis Data Melolo (Simulasi)
              </h3>
              
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Karena aplikasi ini menggunakan penyimpanan lokal durabilitas tinggi (<span className="text-white font-semibold">localStorage</span>), seluruh perubahan yang Anda buat di admin panel akan tersimpan secara instan di browser ini. Di bawah ini Anda dapat melakukan reset ulang ke data pabrik default Melolo.
              </p>

              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-red-400 uppercase tracking-wide">Danger Zone: Kembalikan Data Pabrik</h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed font-light">
                    Mengembalikan daftar drama, episode, dan seluruh konfigurasi kembali ke nilai default awal bawaan kode data teater. Seluruh drama kustom yang Anda tambahkan akan terhapus secara permanen.
                  </p>
                  
                  <button
                    onClick={() => {
                      if (confirm("Apakah Anda yakin ingin melakukan factory reset basis data? Seluruh drama dan episode baru buatan Anda akan hilang.")) {
                        localStorage.removeItem("melolo_dramas");
                        alert("Berhasil melakukan reset data! Halaman akan dimuat ulang...");
                        window.location.reload();
                      }
                    }}
                    className="mt-3 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Setel Ulang Data Pabrik (Reset)
                  </button>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6 space-y-4">
                <h4 className="text-xs font-black text-neutral-200 uppercase tracking-wide">Simulasi Distribusi Insentif User</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
                  Berikan koin gratis ekstra kepada seluruh pengguna virtual di platform untuk menguji performa pembukaan episode berbayar di theater.
                </p>
                
                <button
                  onClick={() => {
                    alert("Sukses! +10,000 Koin dibagikan secara merata ke seluruh pengguna sistem simulasi!");
                  }}
                  className="bg-accent hover:bg-accent-dark text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Coins className="w-3.5 h-3.5" /> Bagikan 10,000 Koin Melolo
                </button>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
