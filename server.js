const express = require('express');
const path = require('path');
const crypto = require('crypto');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
app.use(express.json({limit:'20kb'}));
app.use(express.static(path.join(__dirname, 'public')));

const applications = new Map();
const token = process.env.TELEGRAM_BOT_TOKEN;
const adminIds = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').map(x=>x.trim()).filter(Boolean);
let bot = null;
if (token) {
  bot = new TelegramBot(token, {polling: process.env.TELEGRAM_POLLING !== 'false'});
  bot.on('polling_error', err => console.error('Telegram polling error:', err.message));
  bot.on('callback_query', async q => {
    const [action, id] = String(q.data || '').split(':');
    const item = applications.get(id);
    if (!item || !['approve','reject'].includes(action)) {
      return bot.answerCallbackQuery(q.id, {text:'Application not found or already unavailable.'}).catch(()=>{});
    }
    if (!adminIds.includes(String(q.from.id))) {
      return bot.answerCallbackQuery(q.id, {text:'You are not authorized to review demo applications.',show_alert:true}).catch(()=>{});
    }
    if (item.status !== 'PENDING') {
      return bot.answerCallbackQuery(q.id, {text:`Already ${item.status.toLowerCase()}.`}).catch(()=>{});
    }
    item.status = action === 'approve' ? 'APPROVED (DEMO)' : 'REJECTED (DEMO)';
    item.reviewedAt = new Date().toISOString();
    const original = q.message && q.message.text ? q.message.text : `Airtel-style loan demo ${id}`;
    await bot.editMessageText(`${original}\n\nStatus: ${item.status}\nReviewed by: ${q.from.first_name || 'Admin'}`, {
      chat_id:q.message.chat.id, message_id:q.message.message_id
    }).catch(()=>{});
    await bot.answerCallbackQuery(q.id, {text:`Marked ${item.status.toLowerCase()}.`}).catch(()=>{});
  });
}

app.get('/health', (_req, res) => res.json({ok:true,mode:'demo',telegramConfigured:!!bot,adminConfigured:adminIds.length>0}));
app.post('/api/demo-applications', async (req,res) => {
  const {fullName, phone, demoId, amount, fee, total} = req.body || {};
  if (![fullName, phone, demoId].every(v=>typeof v==='string' && v.trim()) || !Number.isFinite(Number(amount)) || Number(amount)<500 || Number(amount)>100000) {
    return res.status(400).json({ok:false,message:'Please check the demo details and amount.'});
  }
  const id = 'AIR-DEMO-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  const item = {id,fullName:fullName.trim().slice(0,80),phone:phone.trim().slice(0,20),demoId:demoId.trim().slice(0,20),amount:Number(amount),fee:Number(fee)||0,total:Number(total)||0,status:'PENDING',createdAt:new Date().toISOString()};
  applications.set(id,item);
  if (!bot || adminIds.length===0) {
    applications.delete(id);
    return res.status(503).json({ok:false,message:'Demo admin approval is not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_IDS.'});
  }
  const message = `🟥 AIRTEL-STYLE LOAN — DEMO APPLICATION\n\n📋 Application ID: ${id}\n👤 Name: ${item.fullName}\n📞 Phone: ${item.phone}\n🪪 Demo ID: ${item.demoId}\n💰 Requested amount: KES ${item.amount.toLocaleString('en-KE')}\n🧾 Illustrative fee: KES ${item.fee.toLocaleString('en-KE')}\n💵 Illustrative total: KES ${item.total.toLocaleString('en-KE')}\n⏰ Submitted: ${new Date(item.createdAt).toLocaleString('en-KE')}\n\n⏳ Status: PENDING ADMIN REVIEW\n⚠️ DEMO ONLY — no real loan or disbursement.`;
  const keyboard = {inline_keyboard:[[{text:'✅ Approve demo',callback_data:`approve:${id}`},{text:'❌ Reject demo',callback_data:`reject:${id}`}]]};
  const results = await Promise.allSettled(adminIds.map(chatId=>bot.sendMessage(chatId,message,{reply_markup:keyboard})));
  if (!results.some(r=>r.status==='fulfilled')) {
    applications.delete(id);
    return res.status(502).json({ok:false,message:'Could not notify Telegram admins. Check bot access and admin chat IDs.'});
  }
  res.json({ok:true,applicationId:id,status:'PENDING',message:'Demo application sent to admins for review.'});
});
app.get('/api/demo-applications/:id', (req,res) => {
  const item=applications.get(req.params.id);
  if(!item) return res.status(404).json({ok:false,message:'Demo application not found.'});
  res.json({ok:true,applicationId:item.id,status:item.status});
});
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`Airtel-style loan demo running on ${port}`));
