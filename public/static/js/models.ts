export interface Artist {
  id: string;
  name: string;
  avatar_url?: string;
  header_url?: string;
  play_count: number;
  description?: string;
  isSubscribed?: boolean;
  created_at?: string,
}

export interface Album {
  id: string;
  title: string;
  avatar_url?: string;
  release_date?: string;
  description?: string;
  created_at?: string,
  type?: string;
  is_liked?: boolean;
  artists?: Artist[];
}

export interface Track {
  id: string;
  title: string;
  duration_s: number;
  play_count: number;
  is_liked?: boolean;
  created_at?: string,
  album: Album;
  artists?: Artist[];
}

export interface MappedTrack {
  id: string;
  name: string;
  album?: string;
  album_id?: string;
  cover?: string;
  artists?: Artist[];
  plays: string;
  duration: string;
  duration_s?: number;
  is_liked?: boolean;
  num?: number;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  avatar_url?: string;
  is_favorite?: boolean;
  created_at?: string,
  creator_id?: string,
  tracks?: Track[];
}

export interface PlaylistSuccessData {
  id: string;
  title: string;
  description: string;
  image: string | null;
}

export interface UserProfile {
  id: string;
  Login: string;
  Email: string;
  AvatarURL?: string;
}

export interface Avatar {
  avatar_url: string;
}

export interface Comment {
  id: string;
  text: string;
  track_id?: string;
  user_login?: string;
  user_avatar?: string;
  created_at?: string;
  avatar?: string | null;
  nickname?: string;
  letter?: string;
  time?: string;
}

export interface WebSocketHandlers<T = any> {
  onMessage: (data: T) => void;
  onOpen?: () => void;
  onClose?: (code: number) => void;
  onError?: (error: Event) => void;
}

export interface LibraryItem {
  id?: string;
  name: string;
  image: string;
  created_at: Date;
  type: 'Плейлист' | 'Артист' | 'Альбом' | 'Сингл' | 'EP';
  sub?: string;
  href: string;
  description?: string;
  default_avatar?: string;
}
