import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic } from "./vite.js";
import { createServer } from "http";
import { setupMiddleware, notFoundHandler, errorHandler } from "./middleware.js";
import compression from "compression";
import { db } from "../db/index.js";
import { WebSocket, WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '5000', 10);
  const HOST = '0.0.0.0';

  // Enable compression with Brotli support
  app.use(compression({
    level: 6,
    threshold: 0,
    filter: (req: Request, res: Response) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  // Trust proxy in production
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Add health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      env: process.env.NODE_ENV,
      replit: process.env.REPL_ID ? true : false 
    });
  });

  // Add readiness probe with database check
  app.get('/ready', async (req: Request, res: Response) => {
    try {
      await db.execute('SELECT 1');
      res.json({ 
        status: 'ready', 
        db: 'connected',
        env: process.env.NODE_ENV 
      });
    } catch (error: any) {
      res.status(503).json({ status: 'not ready', error: error.message });
    }
  });

  try {
    // Database connection check
    try {
      await db.execute('SELECT 1');
      console.log('Database health check passed');
    } catch (error) {
      console.error('Database health check failed:', error);
      process.exit(1);
    }

    const server = createServer(app);

    // Setup middleware before routes
    setupMiddleware(app);
    
    // Setup routes
    registerRoutes(app);

    // Setup static file serving and SPA handling
    if (process.env.NODE_ENV === 'development') {
      await setupVite(app, server);
    } else {
      // In production, serve from the dist/public directory
      const publicPath = path.join(__dirname, '..', 'public');
      console.log('Serving static files from:', publicPath);
      
      // Serve static files with appropriate caching
      app.use(express.static(publicPath, {
        maxAge: '7d',
        etag: true,
        lastModified: true,
        index: false
      }));

      // SPA fallback
      app.get('*', (req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/ready')) {
          return next();
        }
        res.sendFile(path.join(publicPath, 'index.html'));
      });
    }

    // Setup WebSocket server
    const wss = new WebSocketServer({ 
      server,
      path: '/ws',
      perMessageDeflate: true
    });

    // WebSocket connection handling with heartbeat
    wss.on('connection', (ws: WebSocket & { isAlive?: boolean }) => {
      ws.isAlive = true;
      ws.on('pong', () => { ws.isAlive = true; });

      const heartbeat = setInterval(() => {
        if (!ws.isAlive) {
          clearInterval(heartbeat);
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      }, 30000);

      ws.on('close', () => clearInterval(heartbeat));
      ws.on('error', () => clearInterval(heartbeat));
    });

    // Add 404 handler for API routes
    app.use('/api/*', notFoundHandler);

    // Add error handler last
    app.use(errorHandler);

    // Start server
    server.listen(PORT, HOST, () => {
      console.log(`[${new Date().toLocaleTimeString()}] Server running in ${app.get('env')} mode`);
      console.log(`Local URL: http://${HOST}:${PORT}`);
      
      if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
        console.log(`Production URL: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
      }
    });

    // Graceful shutdown handler
    const shutdown = () => {
      console.log('Shutting down gracefully...');
      wss.close(() => {
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      });

      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(error => {
  console.error('Fatal error during server startup:', error);
  process.exit(1);
});
