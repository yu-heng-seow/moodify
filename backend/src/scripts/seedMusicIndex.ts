// scripts/seedMusicIndex.ts
import { Client } from '@elastic/elasticsearch';
import { env } from '../config/env';

interface SongDocument {
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
    };
}

const client = new Client({
    node: env.musicIndex,
});

const S3_MUSIC_BUCKET = 'moodify-tracks';

const songs: SongDocument[] = [
    {
        id: 'song_00001',
        title: 'Distant Thunder',
        artist: 'Commercial',
        tags: ['lofi', 'chill', 'night', 'study'],
        popularity: 87,
        audio: {
            s3_bucket: S3_MUSIC_BUCKET,
            s3_key: 'distant-thunder-rain-ivo-vicic-1-02-20.mp3',
            mime_type: 'audio/mpeg',
        },
    },
    {
        id: 'song_00002',
        title: 'Forest Ambience',
        artist: 'Commercial',
        tags: ['synthwave', 'retro', 'driving'],
        popularity: 74,
        audio: {
            s3_bucket: S3_MUSIC_BUCKET,
            s3_key: 'forest-ambience-light-birdsong-distant-rooster-vincentmets-1-03-38.mp3',
            mime_type: 'audio/mpeg',
        },
    },
    {
        id: 'song_00003',
        title: 'Wind Chimes',
        artist: 'Commercial',
        tags: ['acoustic', 'calm', 'rain', 'study'],
        popularity: 63,
        audio: {
            s3_bucket: S3_MUSIC_BUCKET,
            s3_key: 'wind-chimes-light-rain-thunder_aygGqqyO.mp3',
            mime_type: 'audio/mpeg',
        },
    },
];

async function ensureIndex(): Promise<void> {
    const exists = await client.indices.exists({ index: env.musicIndex });

    if (exists) {
        console.log(`Index '${env.musicIndex}' already exists.`);
        return;
    }

    await client.indices.create({
        index: env.musicIndex,
        mappings: {
            properties: {
                id: { type: 'keyword' },
                title: { type: 'text' },
                artist: { type: 'text' },
                tags: { type: 'keyword' },
                popularity: { type: 'integer' },
                audio: {
                    properties: {
                        s3_bucket: { type: 'keyword' },
                        s3_key: { type: 'keyword' },
                        duration_sec: { type: 'integer' },
                        mime_type: { type: 'keyword' },
                    },
                },
            },
        },
    });

    console.log(`Created index '${env.musicIndex}'.`);
}

async function seedSongs(): Promise<void> {
    const operations = songs.flatMap((song) => [
        { index: { _index: env.musicIndex, _id: song.id } },
        song,
    ]);

    const bulkResponse = await client.bulk({
        refresh: true,
        operations,
    });

    if (bulkResponse.errors) {
        const erroredItems: unknown[] = [];
        bulkResponse.items.forEach((item, i) => {
            const action = item.index;
            if (action?.error) {
                erroredItems.push({
                    song: songs[i],
                    error: action.error,
                });
            }
        });

        console.error('Some documents failed to index:');
        console.dir(erroredItems, { depth: null });
        process.exit(1);
    }

    console.log(`Seeded ${songs.length} songs into '${env.musicIndex}'.`);
}

async function main(): Promise<void> {
    try {
        await ensureIndex();
        await seedSongs();
        console.log('Done.');
    } catch (error) {
        console.error('Failed to seed Elasticsearch:', error);
        process.exit(1);
    }
}

main();
