// Tipos para la API personalizada de Spotify
export interface CustomSpotifyTrack {
    name: string;
    spotify_url: string;
    track_id: string;
    album: string;
    release_date: string;
    popularity: number;
    duration_ms: number;
    duration_seconds: number;
    preview_urls: string[];
    has_preview: boolean;
    primary_preview_url: string | null;
}

export interface CustomSpotifyApiResponse {
    success: boolean;
    searchQuery: string;
    results: CustomSpotifyTrack[];
    total: number;
}
