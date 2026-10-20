const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Demo-only: validates and logs only a reference ID, never PINs or OTPs.
app.post('/api/verify-reference', (req, res) => {
  const reference = String(req.body.reference || '').trim();
  if (!/^\\d{4}$/.test(reference)) return res.status(400).json({error:'Enter a 4-digit demo reference number.'});
  console.log(`[DEMO] Reference submitted for review: ${reference}`);
  res.json({ok:true, message:'Reference submitted in demo mode. No live TNM verification is performed.'});
});
app.post('/api/loan-request', (req, res) => {
  const name = String(req.body.name || '').trim().slice(0,80);
  const phone = String(req.body.phone || '').trim().slice(0,24);
  const amount = Number(req.body.amount);
  if (!name || !phone || !Number.isFinite(amount) || amount < 1 || amount > 100000000) {
    return res.status(400).json({error:'Enter your name, phone number, and a valid amount in MWK.'});
  }
  console.log(`[DEMO] Loan demo request: name=${name}, phone=${phone}, amountMWK=${amount}`);
  res.json({ok:true, message:'Demo request recorded. This is not a real loan approval or offer.'});
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Independent loan demo running on ${port}`));
