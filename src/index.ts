// src/index.ts
import { createServer } from './server';

async function startServer() {
  try {
    const app = await createServer();
    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📈 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`📈 REST API (upload file) endpoint: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Langsung panggil startServer
startServer();
