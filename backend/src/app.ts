const express = require('express');
const apiRoutes = require('./routes/api.routes');
import { env } from './config/env';
import swaggerJsdoc, {Options} from 'swagger-jsdoc';
import path from 'path';
const cors = require('cors');

const app = express();

const allowedOriginRegex = /^https:\/\/moodz--[a-z0-9]+\.expo\.app$/;

app.use(
    cors({
        origin: (origin: any, callback: any) => {
            // allow non-browser requests or tools like curl/postman
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOriginRegex.test(origin)) {
                return callback(null, true);
            }

            return callback(new Error(`Not allowed by CORS: ${origin}`));
        },
        credentials: true,
    })
);

app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (_req: any, res: any) => {
    res.json({
        message: 'API is running',
        docs: '/swagger/',
        health: '/health',
    });
});

app.get('/api-docs.json', (_req: any, res: any) => {
  res.sendFile(path.join(process.cwd(), 'public', 'openapi.json'));
});

app.get('/health', (req: any, res: any) => {
    res.json({ status: 'ok' });
});

export default app;

app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
});
