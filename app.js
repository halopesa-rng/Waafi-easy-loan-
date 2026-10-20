const $=id=>document.getElementById(id);
let user={name:'',phone:'',applicationRef:''}, timer=null, seconds=30;
function show(n){[1,2,3,4].forEach(i=>$('page'+i).classList.toggle('hidden',i!==n));[1,2,3].forEach(i=>$('tab'+i).classList.toggle('active',i===n));window.scrollTo({top:0,behavior:'smooth'});}
function runTimer(){clearInterval(timer);seconds=30;$('count').textContent=seconds;timer=setInterval(()=>{seconds--; $('count').textContent=seconds;if(seconds<=0){clearInterval(timer);$('timerText').textContent='Timer ended. You can submit the reference now.';}},1000);}
$('submit1').onclick=()=>{
 user.name=$('name').value.trim();user.phone=$('phone').value.trim();user.applicationRef=$('applicationRef').value.trim();
 if(!user.name||!user.phone||!/^[A-Za-z0-9-]{4,32}$/.test(user.applicationRef)){ $('status1').textContent='Enter your name, phone number, and a valid application reference number.';return; }
 $('status1').textContent='Submitted in demo mode. Admin review is not connected in this standalone demo.';show(2);runTimer();
};
$('submit2').onclick=async()=>{
 const ref=$('ref4').value.trim();if(!/^\d{4}$/.test(ref)){$('status2').textContent='Enter exactly 4 digits for the demo reference number.';return;}
 $('submit2').disabled=true;$('status2').textContent='Submitting demo reference…';
 try{const r=await fetch('/api/verify-reference',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference:ref})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Unable to submit');$('status2').textContent=d.message+' Proceeding through demo flow.';clearInterval(timer);setTimeout(()=>show(3),900);}
 catch(e){$('status2').textContent=e.message;}
 finally{$('submit2').disabled=false;}
};
$('submit3').onclick=async()=>{
 const amount=Number($('amount').value);if(!Number.isFinite(amount)||amount<1||amount>100000000){$('status3').textContent='Enter a valid amount in MWK.';return;}
 $('submit3').disabled=true;
 try{const r=await fetch('/api/loan-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...user,amount})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Unable to continue');show(4);}
 catch(e){$('status3').textContent=e.message;}
 finally{$('submit3').disabled=false;}
};
