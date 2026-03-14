import { SongDocument } from '../types/song';

const { findSongsByTag, findAllSongs } = require('../services/elastic.service');
const { createSignedAudioUrl } = require('../services/s3.service');

export async function getRecommendation(req: any, res: any) {
    try {
        const tag = req.query.tag;

        if (!tag) {
            return res.status(400).json({ error: 'tag query required' });
        }

        const songs = await findSongsByTag(tag);

        if (!songs.length) {
            return res.status(404).json({ error: 'No songs found' });
        }

        const song = songs[Math.floor(Math.random() * songs.length)];

        const streamUrl = await createSignedAudioUrl(song.audio.s3_bucket, song.audio.s3_key);

        res.json({
            id: song.id,
            title: song.title,
            artist: song.artist,
            tags: song.tags,
            streamUrl,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'internal error' });
    }
}

export async function getRecommendations(req: any, res: any) {
    try {
        const tag = req.query.tag;

        const songs = tag
            ? tag !== ''
                ? await findSongsByTag(tag)
                : await findAllSongs()
            : await findAllSongs();

        if (!songs.length) {
            return res.status(404).json({ error: 'No songs found' });
        }

        const results = await Promise.all(
            songs.map(async (song: SongDocument) => {
                const streamUrl = await createSignedAudioUrl(
                    song.audio.s3_bucket,
                    song.audio.s3_key
                );

                return {
                    id: song.id,
                    title: song.title,
                    artist: song.artist,
                    tags: song.tags,
                    streamUrl,
                };
            })
        );
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'internal error' });
    }
}
