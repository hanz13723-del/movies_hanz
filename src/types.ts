export interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  time: string;
}

export interface DramaCharacter {
  id: string;
  name: string;
  role: string;
  avatar: string;
  actor: string;
}

export interface Episode {
  id: number;
  title: string;
  videoUrl: string;
  isLocked: boolean;
  coinsToUnlock: number;
  duration: string;
  likes: string;
  commentsCount: number;
}

export interface Drama {
  id: string;
  title: string;
  description: string;
  cover: string;
  category: "CEO/Billionaire" | "Romance" | "Werewolf" | "Revenge";
  views: string;
  rating: number;
  episodesCount: number;
  episodes: Episode[];
  characters: DramaCharacter[];
}

export interface UserData {
  coins: number;
  unlockedEpisodes: Record<string, number[]>; // dramaId -> array of episode ids
  watchHistory: {
    dramaId: string;
    episodeId: number;
    watchedAt: string;
  }[];
  favorites: string[]; // dramaId[]
  likedEpisodes: string[]; // `${dramaId}_${episodeId}`[]
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AIDramaScript {
  title: string;
  logline: string;
  characters: { name: string; role: string }[];
  episodes: {
    episodeNumber: number;
    title: string;
    hook: string;
    scenes: {
      setting: string;
      actions: string;
      dialogues: { character: string; line: string }[];
    }[];
    cliffhanger: string;
  }[];
}

export interface AdminAccount {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: "Super Admin" | "Content Editor" | "Manager";
  createdAt: string;
}

