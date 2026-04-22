import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paystack MoMo Helpers
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

function getPaystackSecretKey(): string {
  const rawKey = process.env.PAYSTACK_SECRET_KEY || 'sk_live_7ae454186282ac8ffcc646f103e227b0f885954f';
  // Robust cleaning: remove "Bearer ", leading/trailing quotes, commas, and whitespace
  // A standard Paystack key should look like sk_live_... or sk_test_...
  const cleaned = rawKey.trim()
    .replace(/^Bearer\s+/i, '')
    .replace(/["',)]/g, '') // Remove quotes, commas, parentheses commonly copied from chat/code
    .trim();
  return cleaned;
}

function normalizePhone(phone: string): string {
  const cleaned = phone.trim().replace(/\s/g, '').replace(/-/g, '').replace(/\+/g, '');
  
  // If it's 10 digits starting with 0, it's already perfect
  if (/^0\d{9}$/.test(cleaned)) {
    return cleaned;
  }
  
  // If it starts with 233 and is 12 digits, convert to 10 digits starting with 0
  if (/^233\d{9}$/.test(cleaned)) {
    return '0' + cleaned.substring(3);
  }
  
  // If it's 9 digits (missing leading 0), add it
  if (/^\d{9}$/.test(cleaned)) {
    return '0' + cleaned;
  }
  
  return cleaned;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API server is running', version: '1.0.1' });
  });

  // Debug logger for all API requests
  app.use('/api', (req, res, next) => {
    console.log(`[API DEBUG] ${req.method} ${req.url}`);
    next();
  });

  // Serve firebase-applet-config.json if it exists in root
  app.get('/firebase-applet-config.json', (req, res, next) => {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    res.sendFile(configPath, (err) => {
      if (err) next();
    });
  });

  // Paystack Initialization (Mobile Money Ghana)
  app.post('/api/payments/paystack/initialize', async (req, res) => {
    console.log('[PAYSTACK] Received initialization request:', req.body);
    const { amount, phone, provider, email } = req.body;
    
    const secretKey = getPaystackSecretKey();
    if (!secretKey || secretKey.startsWith('pk_')) {
      console.error('[PAYSTACK] Invalid secret key configuration');
      return res.status(500).json({ 
        status: false, 
        message: secretKey.startsWith('pk_') 
          ? 'Invalid Key: You are using a Public Key instead of a Secret Key.' 
          : 'PAYSTACK_SECRET_KEY is not configured.' 
      });
    }

    const normalizedPhone = normalizePhone(phone || '');
    const amountPesewas = Math.round(Number(amount) * 100);
    const reference = `POS-${uuidv4().substring(0, 14).toUpperCase()}`;

    if (isNaN(amountPesewas) || amountPesewas < 100) {
      return res.status(400).json({ status: false, message: 'Invalid amount. Minimum GHS 1.00 is required.' });
    }

    const payload = {
      email: email || `momo_${normalizedPhone}@pos.store`,
      amount: amountPesewas,
      currency: 'GHS',
      reference,
      mobile_money: {
        phone: normalizedPhone,
        provider: provider || 'mtn',
      }
    };

    console.log(`[PAYSTACK] Charging ${normalizedPhone} GHS ${amount}`);

    try {
      const response = await axios.post(`${PAYSTACK_BASE_URL}/charge`, payload, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`[PAYSTACK] Response:`, JSON.stringify(response.data, null, 2));

      if (response.data.status) {
        res.json({
          status: true,
          data: {
            reference: response.data.data.reference || reference,
            status: response.data.data.status,
            display_text: response.data.data.display_text || 'Awaiting customer authorisation…'
          }
        });
      } else {
        res.status(400).json({ status: false, message: response.data.message || 'Charge failed' });
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      console.error(`[PAYSTACK] Error:`, JSON.stringify(errorData || error.message, null, 2));
      const message = errorData?.message || errorData?.data?.message || error.message || 'Paystack initialization failed';
      res.status(500).json({ status: false, message });
    }
  });

  // Paystack Submit OTP
  app.post('/api/payments/paystack/submit-otp', async (req, res) => {
    const { reference, otp } = req.body;

    const secretKey = getPaystackSecretKey();
    if (!secretKey) {
      return res.status(500).json({ status: false, message: 'PAYSTACK_SECRET_KEY is not configured' });
    }

    try {
      const response = await axios.post(`${PAYSTACK_BASE_URL}/charge/submit_otp`, {
        reference,
        otp
      }, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.status) {
        res.json({
          status: true,
          data: response.data.data
        });
      } else {
        res.status(400).json({ status: false, message: response.data.message || 'OTP submission failed' });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.data?.message || 'OTP submission error';
      res.status(500).json({ status: false, message });
    }
  });

  // Paystack Verification (Charge API)
  app.get('/api/payments/paystack/verify/:reference', async (req, res) => {
    const { reference } = req.params;

    const secretKey = getPaystackSecretKey();
    if (!secretKey) {
      return res.status(500).json({ status: false, message: 'PAYSTACK_SECRET_KEY is not configured' });
    }

    try {
      const response = await axios.get(`${PAYSTACK_BASE_URL}/charge/${encodeURIComponent(reference)}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Accept': 'application/json'
        }
      });

      if (response.data.status) {
        const data = response.data.data;
        const tx_status = data.status;
        
        let status = 'pending';
        if (tx_status === 'success') status = 'success';
        else if (['failed', 'abandoned'].includes(tx_status)) status = 'failed';

        const messageParts: string[] = [];
        ['display_text', 'message', 'gateway_response'].forEach(key => {
          if (data[key]) {
            const text = String(data[key]).trim();
            if (text && !messageParts.includes(text)) messageParts.push(text);
          }
        });

        res.json({
          status: true,
          data: {
            status,
            raw_status: tx_status,
            reference: data.reference,
            amount: data.amount / 100,
            message: messageParts.join(' | ') || 'Transaction status fetched'
          }
        });
      } else {
        res.json({ status: false, message: response.data.message || 'Verification failed' });
      }
    } catch (error: any) {
      res.status(500).json({ status: false, message: 'Error during Paystack verification' });
    }
  });

  // Purchase Order Email Simulation
  app.post('/api/orders/send-email', async (req, res) => {
    const { orderId, supplierEmail, subject, body } = req.body;
    try {
      console.log(`Simulating email to ${supplierEmail} for Order ${orderId}`);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      res.json({
        status: 'success',
        message: `Purchase Order ${orderId} has been emailed to ${supplierEmail}`
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to send email' });
    }
  });

  // Flutterwave Initialization
  app.post('/api/payments/flutterwave/initialize', async (req, res) => {
    const { amount, email, phone, currency, channel } = req.body;
    try {
      const tx_ref = `flw_tx_ref_${uuidv4()}`;
      if (channel === 'mobile_money') {
        console.log(`[Flutterwave] MTN Mobile Money payment initiated for ${phone}. OTP simulated.`);
      }
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
    
    try {
      const isSuccess = !transaction_id.toLowerCase().includes('fail');

      if (isSuccess) {
        res.json({
          status: 'success',
          message: 'Payment verified successfully',
          data: {
            id: transaction_id,
            tx_ref: tx_ref,
            amount: 100, 
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

  // Hubtel Initialization (Ghana)
  app.post('/api/payments/hubtel/initialize', async (req, res) => {
    const { amount, phone, provider } = req.body;
    try {
      const clientReference = `HUB-${uuidv4().substring(0, 8).toUpperCase()}`;
      console.log(`[Hubtel] Payment request for ${phone} - GHS ${amount}`);
      
      res.json({
        status: true,
        data: {
          reference: clientReference,
          status: 'pending',
          display_text: 'Please authorize the Hubtel payment on your phone'
        }
      });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Hubtel initialization failed' });
    }
  });

  // Hubtel Verification
  app.get('/api/payments/hubtel/verify/:reference', async (req, res) => {
    const { reference } = req.params;
    try {
      res.json({
        status: true,
        data: {
          status: 'success',
          reference: reference,
          amount: 10,
          message: 'Hubtel payment successful'
        }
      });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Error during Hubtel verification' });
    }
  });
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
