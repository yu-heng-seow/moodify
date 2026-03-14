const { Client } = require('@elastic/elasticsearch');
import { env } from '../config/env';

const elasticClient = new Client({
    node: env.elasticNode,
});

async function findSongsByTag(tag: string) {
    const result = await elasticClient.search({
        index: env.musicIndex,
        size: 5,
        query: {
            bool: {
                filter: [
                    {
                        term: {
                            tags: tag.toLowerCase(),
                        },
                    },
                ],
            },
        },
        sort: [{ popularity: 'desc' }],
    });

    return result.hits.hits.map((hit: any) => hit._source);
}

module.exports = {
    elasticClient,
    findSongsByTag,
};
