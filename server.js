const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Demo-only endpoint: records no PINs, OTPs, passwords, or verification codes.
// Configure an authorized admin notification service before enabling production use.
app.post('/api/resend-request', (req, res) => {
  const reference = String(req.body.reference || '').trim();
  if (!/^[A-Za-z0-9-]{4,32}$/.test(reference)) {
    return res.status(400).json({ error: 'Enter a valid reference number.' });
  }
  console.log(`[DEMO] Another reference requested for application reference: ${reference}`);
  res.json({ ok: true, message: 'Request recorded in demo mode. Admin notification integration is not configured.' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`TNM Malawi reference demo running on ${port}`));
