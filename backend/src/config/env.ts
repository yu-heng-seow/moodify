import dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/.env' });

export const env = {
    port: Number(process.env.PORT || 3000),
    elasticNode: process.env.ELASTIC_NODE || '',
    elasticApiKey: process.env.ELASTIC_API_KEY || '',
    awsRegion: process.env.AWS_REGION || '',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    musicIndex: process.env.MUSIC_INDEX || 'music_index',
    elasticInferenceId: process.env.ELASTIC_INFERENCE_ID || '',
};
