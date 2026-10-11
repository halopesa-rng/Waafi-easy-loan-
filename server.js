const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.json({ ok: true, mode: 'demo' }));
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Demo loan portal running on ${port}`));
