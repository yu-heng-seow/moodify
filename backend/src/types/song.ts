export interface SongDocument {
    id: string;
    title: string;
    artist: string;
    tags: string[];
    popularity?: number;

    audio: {
        s3_bucket: string;
        s3_key: string;
        duration_sec?: number;
        mime_type?: string;
    }
}
