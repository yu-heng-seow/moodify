const express = require('express');
const apiRoutes = require('./routes/api.routes');
import { env } from './config/env';
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
import path from 'path';
const cors = require('cors');

const app = express();

const allowedOriginRegex = /^https:\/\/moodz--[a-z0-9]+\.expo\.app$/;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express.js API',
      version: '1.0.0',
      description: 'A sample Express.js API built with TypeScript and Swagger',
    },
  },
  apis: [
    path.join(__dirname, './routes/*.ts'),
    path.join(__dirname, './controllers/*.ts'),
    path.join(__dirname, './api/*.ts'),
    path.join(__dirname, '../dist/routes/*.js'),
    path.join(__dirname, '../dist/controllers/*.js'),
    path.join(__dirname, '../dist/api/*.js'),
  ],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);

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

app.use('/swagger', express.static(path.join(process.cwd(), 'public/swagger')));

app.get('/api-docs.json', (_req: any, res:any) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

app.get('/health', (req: any, res: any) => {
    res.json({ status: 'ok' });
});

export default app;

app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
});
