import { createRequire } from 'node:module';
import serverless from 'serverless-http';

const require = createRequire(import.meta.url);
const app = require('../../Src/server');
const handler = serverless(app);

export default async (req, context) => handler(req, context);

export const config = {
  path: '/api/*',
};
