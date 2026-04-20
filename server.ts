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

  // Paystack Initialization
  app.post('/api/payments/paystack/initialize', async (req, res) => {
    const { email, amount, metadata } = req.body;
    try {
      const reference = `pstk_ref_${uuidv4()}`;
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

  // Paystack Verification
  app.get('/api/payments/paystack/verify/:reference', async (req, res) => {
    const { reference } = req.params;
    try {
      const isSuccess = !reference.toLowerCase().includes('fail');
      if (isSuccess) {
        res.json({
          status: true,
          message: 'Verification successful',
          data: {
            status: 'success',
            reference: reference,
            amount: 100
          }
        });
      } else {
        res.status(400).json({
          status: false,
          message: 'Transaction failed',
          data: { status: 'failed' }
        });
      }
    } catch (error) {
      res.status(500).json({ status: false, message: 'Error during Paystack verification' });
    }
  });

  // Flutterwave Initialization
  app.post('/api/payments/flutterwave/initialize', async (req, res) => {
    const { amount, email, phone, currency } = req.body;
    try {
      const tx_ref = `flw_tx_ref_${uuidv4()}`;
      // In a real implementation:
      // const response = await axios.post('https://api.flutterwave.com/v3/payments', { ... }, { headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` } });
      res.json({
        status: 'success',
        data: {
          link: 'https://checkout.flutterwave.com/v3/hosted/pay/' + tx_ref,
          tx_ref: tx_ref
        }
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Flutterwave initialization failed' });
    }
  });

  // Flutterwave Verification
  app.get('/api/payments/flutterwave/verify/:transaction_id', async (req, res) => {
    const { transaction_id } = req.params;
    const { tx_ref } = req.query;

    // In a real implementation, you would call:
    // https://api.flutterwave.com/v3/transactions/:id/verify
    
    try {
      // For the school project demo, we simulate a successful verification
      // unless the transaction_id contains 'fail'
      const isSuccess = !transaction_id.toLowerCase().includes('fail');

      if (isSuccess) {
        res.json({
          status: 'success',
          message: 'Payment verified successfully',
          data: {
            id: transaction_id,
            tx_ref: tx_ref,
            amount: 100, // In real app, get from API
            currency: 'GHS',
            status: 'successful'
          }
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Payment verification failed or transaction was declined',
          data: { status: 'failed' }
        });
      }
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error during verification' });
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
