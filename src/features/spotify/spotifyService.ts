// Servicio para integración con Spotify API con API personalizada

import type { CustomSpotifyApiResponse } from "../../types/customSpotifyApi";

export interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    preview_url: string | null;
    external_urls: { spotify: string };
    album: {
        name: string;
        images: Array<{ url: string; width: number; height: number }>;
    };
    duration_ms: number;
}

export interface SpotifySearchResult {
    tracks: {
        items: SpotifyTrack[];
        total: number;
    };
}

// Configuración de Spotify (estas credenciales deben estar en variables de entorno)
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const CUSTOM_API_URL = import.meta.env.VITE_CUSTOM_SPOTIFY_API_URL || 'https://mymstorie-api.onrender.com';

class SpotifyService {
    private accessToken: string | null = null;
    private tokenExpiration: number | null = null;

    // Obtener token de acceso usando Client Credentials Flow
    private async getAccessToken(): Promise<string> {
        // Verificar si el token actual sigue siendo válido
        if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
            return this.accessToken;
        }

        if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
            throw new Error('Credenciales de Spotify no configuradas. Configura VITE_SPOTIFY_CLIENT_ID y VITE_SPOTIFY_CLIENT_SECRET en las variables de entorno.');
        }

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET),
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            throw new Error('Error al obtener token de Spotify');
        }

        const data = await response.json();
        this.accessToken = data.access_token;
        // Configurar expiración con un margen de seguridad de 5 minutos
        this.tokenExpiration = Date.now() + (data.expires_in - 300) * 1000;

        return this.accessToken || '';
    }

    // Buscar canciones en Spotify
    async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
        try {
            // Solo búsqueda oficial - sin llamadas automáticas a API personalizada
            const officialTracks = await this.searchSpotifyOfficial(query, limit);

            console.log(`Búsqueda: ${query} - Canciones encontradas: ${officialTracks.length}, Con preview oficial: ${officialTracks.filter(t => t.preview_url).length}`);

            return officialTracks;
        } catch (error) {
            console.error('Error en búsqueda de Spotify:', error);
            throw new Error('No se pudieron buscar canciones. Verifica tu conexión a internet.');
        }
    }

    // Búsqueda oficial en Spotify API
    private async searchSpotifyOfficial(query: string, limit: number): Promise<SpotifyTrack[]> {
        const token = await this.getAccessToken();
        const encodedQuery = encodeURIComponent(query);
        const searchLimit = Math.min(limit * 2, 50); // Buscar más para filtrar

        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=${searchLimit}&market=US`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Error al buscar canciones en Spotify');
        }

        const data: SpotifySearchResult = await response.json();
        return data.tracks.items;
    }

    // Buscar canciones por género/mood para sugerencias
    async getTracksByMood(mood: string, limit: number = 10): Promise<SpotifyTrack[]> {
        const moodQueries = {
            happy: 'happy upbeat instrumental',
            calm: 'calm peaceful ambient instrumental',
            nostalgic: 'nostalgic memories classic',
            energetic: 'energetic dance pop',
            romantic: 'romantic love ballad',
            family: 'family children kids instrumental',
            celebration: 'celebration party upbeat',
        };

        const query = moodQueries[mood as keyof typeof moodQueries] || mood;

        // Para moods, intentar obtener más resultados ya que suelen tener menos previews
        return this.searchTracks(query, limit);
    }

    // Obtener información de una canción específica por ID
    async getTrackById(trackId: string): Promise<SpotifyTrack | null> {
        try {
            const token = await this.getAccessToken();

            const response = await fetch(
                `https://api.spotify.com/v1/tracks/${trackId}?market=ES`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener canción por ID:', error);
            return null;
        }
    }

    // Obtener preview para una canción específica (llamado bajo demanda)
    async getPreviewForTrack(track: SpotifyTrack): Promise<string | null> {
        // Si ya tiene preview oficial, devolverlo
        if (track.preview_url) {
            console.log(`✅ Usando preview oficial para: ${track.name}`);
            return track.preview_url;
        }

        // Si no tiene preview, buscar en API personalizada
        const artistName = track.artists[0]?.name || '';
        console.log(`🔍 Buscando preview personalizado para: ${track.name} - ${artistName}`);

        try {
            const customPreviewUrl = await this.getPreviewFromCustomApi(track.name, artistName);

            if (customPreviewUrl) {
                console.log(`✅ Preview personalizado encontrado para: ${track.name} - ${artistName}`);
                return customPreviewUrl;
            } else {
                console.log(`❌ No se encontró preview para: ${track.name} - ${artistName}`);
                return null;
            }
        } catch (error) {
            console.error(`❌ Error obteniendo preview para ${track.name} - ${artistName}:`, error);
            return null;
        }
    }

    // Obtener preview de la API personalizada usando endpoint más preciso
    private async getPreviewFromCustomApi(trackName: string, artistName?: string): Promise<string | null> {
        // Solo usar API personalizada si está configurada (desarrollo/staging)
        if (!CUSTOM_API_URL) {
            console.log('🚫 API personalizada no configurada, saltando...');
            return null;
        }

        try {
            const encodedSong = encodeURIComponent(trackName);
            const encodedArtist = encodeURIComponent(artistName || '');

            // Usar endpoint más preciso con canción y artista separados
            const endpoint = artistName
                ? `${CUSTOM_API_URL}/api/spotify/search-with-artist?song=${encodedSong}&artist=${encodedArtist}`
                : `${CUSTOM_API_URL}/api/spotify/search?q=${encodedSong}`;

            console.log(`🔍 Llamando API personalizada: ${endpoint}`);

            const response = await fetch(endpoint, {

            });

            if (!response.ok) {
                console.warn(`API personalizada respondió con status ${response.status}`);
                return null;
            }

            const data: CustomSpotifyApiResponse = await response.json();

            if (!data.success || !data.results || data.results.length === 0) {
                console.warn(`API personalizada no encontró resultados para: ${trackName} - ${artistName}`);
                return null;
            }

            // Buscar el primer resultado que tenga preview
            const trackWithPreview = data.results.find(track =>
                track.has_preview && track.primary_preview_url
            );

            if (trackWithPreview) {
                console.log(`✅ Preview encontrado usando endpoint preciso`);
            } else {
                console.log(`❌ Ningún resultado tiene preview disponible`);
            }

            return trackWithPreview?.primary_preview_url || null;

        } catch (error) {
            console.error('Error llamando a la API personalizada:', error);
            return null;
        }
    }

    // Formatear información de la canción para almacenamiento
    formatTrackForStorage(track: SpotifyTrack) {
        return {
            id: track.id,
            name: track.name,
            artists: track.artists.map(artist => artist.name).join(', '),
            preview_url: track.preview_url,
            spotify_url: track.external_urls.spotify,
            album_name: track.album.name,
            album_image: track.album.images[0]?.url || null,
            duration_ms: track.duration_ms,
        };
    }
}

export const spotifyService = new SpotifyService();

// Tipos para almacenamiento en Firebase
export interface EntrySpotifyData {
    id: string;
    name: string;
    artists: string;
    preview_url: string | null;
    spotify_url: string;
    album_name: string;
    album_image: string | null;
    duration_ms: number;
}
