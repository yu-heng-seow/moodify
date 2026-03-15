import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import type { OpenAPIV3 } from 'openapi-types';

const options: swaggerJsdoc.OAS3Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express.js API',
      version: '1.0.0',
      description: 'A sample Express.js API built with TypeScript and Swagger',
    },
  },
  apis: [path.join(process.cwd(), 'src/**/*.ts')],
};

const spec = swaggerJsdoc(options) as OpenAPIV3.Document;

fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });

fs.writeFileSync(
  path.join(process.cwd(), 'public', 'openapi.json'),
  JSON.stringify(spec, null, 2),
  'utf8'
);

console.log('Generated public/openapi.json');
console.log('Paths:', Object.keys(spec.paths || {}));
console.log(
  'Schemas:',
  Object.keys(spec.components?.schemas || {})
);