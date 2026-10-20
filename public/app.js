const $ = id => document.getElementById(id);
let reference = '', seconds = 30, timer = null, submitted = false;
function startTimer(){clearInterval(timer);seconds=30;updateTimer();timer=setInterval(()=>{seconds--;updateTimer();if(seconds<=0){clearInterval(timer);$('resend').classList.remove('hidden');$('timerLabel').textContent='Time elapsed. Tap Tuma tena to request another reference.';}},1000);}
function updateTimer(){$('seconds').textContent=seconds;}
$('continue').addEventListener('click',()=>{
  const value=$('reference').value.trim();
  if(!/^[A-Za-z0-9-]{4,32}$/.test(value)){ $('error1').textContent='Enter a valid reference number (4–32 letters, numbers, or hyphens).';return; }
  reference=value;$('refDisplay').textContent=reference;$('page1').classList.add('hidden');$('page2').classList.remove('hidden');$('stepOne').classList.remove('active');$('stepTwo').classList.add('active');startTimer();
});
$('finish').addEventListener('click',()=>{submitted=true;$('notice').textContent='Reference submitted in demo mode. No PIN or verification code was collected.';$('finish').disabled=true;});
$('resend').addEventListener('click',async()=>{
  $('resend').disabled=true;$('error2').textContent='';$('notice').textContent='Sending request…';
  try{const r=await fetch('/api/resend-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference})});const data=await r.json();if(!r.ok)throw new Error(data.error||'Request failed');$('notice').textContent=data.message;startTimer();}
  catch(e){$('error2').textContent=e.message||'Could not send request.';}
  finally{$('resend').disabled=false;}
});
