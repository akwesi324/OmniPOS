import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Serve firebase-applet-config.json if it exists in root
  app.get('/firebase-applet-config.json', (req, res, next) => {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    res.sendFile(configPath, (err) => {
      if (err) next();
    });
  });

  // Paystack Integration Placeholder
  app.post('/api/payments/paystack/initialize', async (req, res) => {
    const { email, amount, metadata } = req.body;
    // Real implementation would call Paystack API
    // Using process.env.PAYSTACK_SECRET_KEY
    try {
      // simulate response
      const reference = uuidv4();
      res.json({
        status: true,
        data: {
          authorization_url: 'https://checkout.paystack.com/' + reference,
          access_code: 'codesimulated',
          reference: reference
        }
      });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Paystack initialization failed' });
    }
  });

  // Flutterwave Integration Placeholder
  app.post('/api/payments/flutterwave/initialize', async (req, res) => {
    const { amount, email, phone, currency } = req.body;
    // Real implementation would call Flutterwave API
    // Using process.env.FLW_SECRET_KEY
    try {
      const tx_ref = uuidv4();
      res.json({
        status: 'success',
        data: {
          link: 'https://checkout.flutterwave.com/' + tx_ref,
          tx_ref: tx_ref
        }
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Flutterwave initialization failed' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
