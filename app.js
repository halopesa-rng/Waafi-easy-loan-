const sections=[1,2,3,4].map(n=>document.getElementById('step'+n));
let current=1, demoCode='', expiresAt=0, timerId=null;
const $=id=>document.getElementById(id);
function show(n){current=n;sections.forEach((s,i)=>s.classList.toggle('hidden',i!==n-1));document.querySelectorAll('[data-step-label]').forEach(el=>el.classList.toggle('active',Number(el.dataset.stepLabel)===n));window.scrollTo({top:0,behavior:'smooth'});}
function amount(){return Math.max(0,Number($('amount').value)||0)}
function updateTotals(){const fee=Math.round(amount()*.05);$('fee').textContent='KES '+fee.toLocaleString();$('total').textContent='KES '+(amount()+fee).toLocaleString()}
function validCustomer(){if(!$('fullName').value.trim()||!$('phone').value.trim()||!$('nationalId').value.trim()){alert('Complete all demo details to continue.');show(1);return false}return true}
$('to2').onclick=()=>{if(validCustomer())show(2)};
$('amount').oninput=updateTotals;updateTotals();
$('to3').onclick=()=>{if(amount()<500||amount()>100000){alert('Enter a demo amount from KES 500 to KES 100,000.');show(2);return}const rows=[['Full name',$('fullName').value],['Phone',$('phone').value],['Demo ID',$('nationalId').value],['Requested amount','KES '+amount().toLocaleString()],['Illustrative fee','KES '+Math.round(amount()*.05).toLocaleString()],['Illustrative total','KES '+Math.round(amount()*1.05).toLocaleString()]];$('review').innerHTML=rows.map(([k,v])=>`<div><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`).join('');show(3)};
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function startDemoCode(){demoCode=String(Math.floor(100000+Math.random()*900000));$('demoCode').textContent=demoCode;$('codeInput').value='';$('message').textContent='';expiresAt=Date.now()+60000;if(timerId)clearInterval(timerId);tick();timerId=setInterval(tick,250)}
function tick(){const left=Math.max(0,Math.ceil((expiresAt-Date.now())/1000));$('timer').textContent=left+' seconds remaining';if(left===0){clearInterval(timerId);timerId=null;$('message').textContent='Demo code expired. Start over to generate a new demo code.';demoCode=''}}
$('to4').onclick=()=>{show(4);startDemoCode()};
$('verify').onclick=()=>{if(Date.now()>=expiresAt||!demoCode){$('message').textContent='Demo code expired. Start over to try again.';return}if($('codeInput').value.trim()!==demoCode){$('message').textContent='Incorrect demo code. Check the code shown above.';return}if(timerId)clearInterval(timerId);timerId=null;$('message').textContent='Demo complete. No loan application was submitted and no money will be disbursed.';demoCode='';};
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>show(Number(b.dataset.back)));
$('restart').onclick=()=>{if(timerId)clearInterval(timerId);timerId=null;demoCode='';$('message').textContent='';show(1)};
