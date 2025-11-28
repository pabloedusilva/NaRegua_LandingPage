import app from '../server/src/server.js';

// Vercel serverless handler: delega requisição ao Express sem iniciar listen
export const config = { api: { bodyParser: false } }; // Express já faz o parsing

export default function handler(req, res) {
	return app(req, res);
}
