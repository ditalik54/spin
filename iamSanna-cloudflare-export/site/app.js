import {canEnter,secondsLeft,canOpenStep,wheelRotation,wheelSegments,spinProgress,pointerDeflection,demoSpinSectors,rotationAfter} from './state.mjs';
const $=s=>document.querySelector(s), key='nova-giveaway-demo-v4';
const prizes=[{name:'Shadow Dragon',image:'assets/shadow-dragon-hq.png',rarity:'LEGENDARY'}];
let steps=[false,false],award=null,spinning=false,completedSpins=0,currentRotation=0,wheelReady=false,preparing=false,prepTimers=[];
try{
 const saved=JSON.parse(localStorage.getItem(key));
 if(saved&&Number.isInteger(saved.completedSpins)&&saved.completedSpins>=0&&saved.completedSpins<=3)completedSpins=saved.completedSpins;
 if(saved?.award&&saved.award.index===0&&Number.isFinite(saved.award.deadline)){award=saved.award;completedSpins=3;}
 else completedSpins=Math.min(completedSpins,2);
}catch{}
const save=()=>{try{localStorage.setItem(key,JSON.stringify({completedSpins,award}))}catch{$('#hint').textContent='Your browser cannot save your progress after closing.'}};
function updateRound(){
 $('#spin-count').textContent=completedSpins===3?'3 of 3 complete':`Spin ${completedSpins+1} of 3`;
 $('#spin-history').textContent=completedSpins===0?'3 spins':completedSpins===1?'Kangaroo collected':'Kangaroo · 1 no prize';
 if(completedSpins<3)$('#spin').textContent=completedSpins===0?'Spin the wheel':`Spin again · ${completedSpins+1} of 3`;
}
updateRound();
document.querySelectorAll('[data-open]').forEach(a=>a.addEventListener('click',event=>{if(!canOpenStep(Number(a.dataset.open),steps)){event.preventDefault();return;}document.querySelector(`[data-done="${a.dataset.open}"]`).disabled=false;a.closest('.actions').classList.add('action-opened')}));
document.querySelectorAll('[data-done]').forEach(b=>b.addEventListener('click',()=>{if(!canOpenStep(Number(b.dataset.done),steps)||b.disabled)return;steps[Number(b.dataset.done)]=true;if(steps[0]){const link=document.querySelector('[data-open="1"]');link.removeAttribute('aria-disabled');link.removeAttribute('tabindex');$('#discord-step').classList.remove('locked');}b.classList.add('checked');b.innerHTML='Done <span>✓</span>';b.disabled=true;$('#progress').textContent=`${steps.filter(Boolean).length} / 2`;$('#enter').disabled=!canEnter(steps);if(canEnter(steps))$('#hint').textContent='You’re all set. Give it a spin!'}));
function renderLoot(){
 const count=(completedSpins>=1?1:0)+(award?1:0);
 $('#loot-count').textContent=String(count);
 $('#loot-summary').textContent=award?'Kangaroo + Shadow Dragon':completedSpins>=1?'Kangaroo collected':'Your bag is empty';
 $('#loot-pocket').classList.toggle('has-loot',count>0);
}
renderLoot();
async function flyToBag(source,type){
 const pocket=$('#loot-bag'),flight=$('#loot-flight');
 if(reduced||!$('#modal').open){renderLoot();return;}
 const modalRect=$('#modal').getBoundingClientRect(),from=source.getBoundingClientRect(),to=pocket.getBoundingClientRect();
 const startX=from.left+from.width/2-modalRect.left+$('#modal').scrollLeft,startY=from.top+from.height/2-modalRect.top+$('#modal').scrollTop;
 const endX=to.left+to.width/2-modalRect.left,endY=to.top+to.height/2-modalRect.top+$('#modal').scrollTop;
 flight.replaceChildren();flight.className=`loot-flying ${type}`;
 const image=source.matches('img')?source:source.querySelector('img');
 const img=document.createElement('img');img.src=image?.src||prizes[0].image;img.alt='';flight.append(img);

 const transform=(x,y,scale,rotate)=>`translate(${x-32}px,${y-32}px) scale(${scale}) rotate(${rotate}deg)`;
 const animation=flight.animate([{transform:transform(startX,startY,1,0),opacity:1,offset:0},{transform:transform(startX+45,startY-70,1.2,-14),opacity:1,offset:.3},{transform:transform(endX+35,endY-40,.8,12),opacity:1,offset:.73},{transform:transform(endX,endY,.18,0),opacity:0,offset:1}],{duration:1100,easing:'cubic-bezier(.25,.5,.4,1)',fill:'forwards'});
 await animation.finished;flight.className='';flight.replaceChildren();animation.cancel();renderLoot();
 pocket.animate([{transform:'scale(1)'},{transform:'scale(1.22) rotate(-8deg)',offset:.4},{transform:'scale(.94) rotate(5deg)',offset:.7},{transform:'scale(1)'}],{duration:420,easing:'ease-out'});
 $('#loot-pocket').animate([{background:'#f7f3e9'},{background:'#f4e3b8'},{background:'#f7f3e9'}],{duration:650});tone(880,.12);
}
function tick(){if(!award)return;const left=secondsLeft(award.deadline);$('#timer').textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;$('#timer-label').textContent=left?'time left to claim your item':'Time is up.';if(!left)$('#claim').textContent='TIME IS UP'}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let soundOn=false,audioContext=null;
$('#sound').addEventListener('click',()=>{
 soundOn=!soundOn;$('#sound').textContent=soundOn?'Sound on':'Sound off';
 $('#sound').setAttribute('aria-pressed',String(soundOn));
 $('#sound').setAttribute('aria-label',soundOn?'Mute spin sounds':'Enable spin sounds');
 if(soundOn){try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});}catch{soundOn=false;$('#sound').textContent='Sound unavailable';}}
});
function tone(frequency,duration=.045,delay=0){
 if(!soundOn||!audioContext)return;
 const t=audioContext.currentTime+delay,o=audioContext.createOscillator(),g=audioContext.createGain();
 o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
 o.connect(g);g.connect(audioContext.destination);o.start(t);o.stop(t+duration+.01);
}
function celebrate(){
 $('#modal').classList.add('celebrating');
 [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,.36,i*.12));
 if(reduced)return;
 const layer=$('#celebration-layer'),canvas=$('#confetti'),ctx=canvas.getContext('2d');
 if(!ctx)return;
 layer.showPopover();
 const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);
 canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);
 const colors=['#f4c54f','#bd87ed','#f18c91','#81d8be','#fff0ad','#d2acf3'];
 const particles=Array.from({length:180},(_,i)=>{const side=i%2;return {x:side?w:0,y:h*.64,vx:(side?-1:1)*(3+Math.random()*10),vy:-8-Math.random()*13,size:4+Math.random()*6,color:colors[i%colors.length],r:Math.random()*6,delay:Math.floor(i/60)*170};});
 const start=performance.now();let last=start;
 function frame(now){const age=now-start,dt=Math.min((now-last)/16.67,2);last=now;ctx.clearRect(0,0,w,h);ctx.globalAlpha=Math.max(0,Math.min(1,(5200-age)/1100));
 for(const p of particles){if(age<p.delay)continue;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.988,dt);p.vy+=.17*dt;p.r+=.075*dt;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.48);ctx.restore();}
 if(age<5200&&$('#modal').open)requestAnimationFrame(frame);else{ctx.clearRect(0,0,w,h);layer.hidePopover();}
 }requestAnimationFrame(frame);
}
function result(fresh=false){const p=prizes[award.index];$('#modal-title').textContent='Congratulations!';$('#spin-subtitle').textContent='That’s a legendary drop.';$('#result-rarity').textContent=p.rarity;$('#prize-name').textContent=p.name;$('#spin').hidden=true;$('#result').hidden=false;$('#spin-note').hidden=true;$('#modal').classList.add('has-won');tick();if(fresh){$('#modal').classList.remove('victory-beat');$('#result').classList.add('reveal-result');setTimeout(()=>flyToBag($('.won-pet'),'dragon'),reduced?0:900);}else renderLoot();}
function openResult(){if(!$('#modal').open)$('#modal').showModal();result()}
function cancelPreparation(){
 if(!preparing)return;
 prepTimers.forEach(clearTimeout);prepTimers=[];preparing=false;
 $('#modal').classList.remove('is-preparing','wheel-arriving');$('#preparation').classList.remove('prep-fading');$('#prep-success').hidden=true;$('#prep-success').className='';$('#preparation').hidden=true;
}
$('#close').addEventListener('click',()=>$('#modal').close());
$('#modal').addEventListener('close',cancelPreparation);
$('#modal').addEventListener('animationend',event=>{if(event.animationName==='wheel-enter')$('#modal').classList.remove('wheel-arriving');});
function prepareWheel(){
 if(preparing)return;
 preparing=true;$('#modal').classList.remove('wheel-arriving');$('#modal').classList.add('is-preparing');$('#preparation').classList.remove('prep-fading');$('#prep-success').hidden=true;$('#prep-success').className='';$('#preparation').hidden=false;
 $('#modal-title').textContent='Getting things ready';$('#spin-subtitle').textContent='A few quick steps before your spins.';
 const rows=[...document.querySelectorAll('.prep-list li')];
 rows.forEach((row,i)=>{row.className=i===0?'active':'';row.querySelector('.prep-check').textContent=String(i+1);});
 $('#prep-status').textContent='Checking your task confirmations…';
 [1600,3400,5200,7000].forEach((delay,i)=>prepTimers.push(setTimeout(()=>{
  rows[i].className='complete';rows[i].querySelector('.prep-check').textContent='✓';
  if(i<3){rows[i+1].className='active';$('#prep-status').textContent=rows[i+1].lastElementChild.textContent+'…';}
  else{
   $('#prep-status').textContent='Preparation complete.';
   $('#preparation').classList.add('prep-fading');
   prepTimers.push(setTimeout(()=>{
    $('#prep-success').hidden=false;$('#prep-success').classList.add('show-success');
    $('#modal-title').textContent='Ready to go';$('#spin-subtitle').textContent='You have 3 spins ready.';
   },reduced?0:400));
   prepTimers.push(setTimeout(()=>$('#prep-success').classList.add('success-leaving'),reduced?900:1650));
   prepTimers.push(setTimeout(()=>{
    preparing=false;wheelReady=true;prepTimers=[];$('#modal').classList.remove('is-preparing');$('#preparation').hidden=true;$('#modal').classList.add('wheel-arriving');
    $('#modal-title').textContent='Ready for your drop?';$('#spin-subtitle').textContent='Three spins. Press the button to start.';$('#spin').focus();
   },reduced?1000:2050));
  }
 },delay)));
}

const wheel=$('#wheel');
for(let i=0;i<8;i++){
 const angle=i*45*Math.PI/180;
 const divider=document.createElement('span');divider.className='wheel-divider';divider.style.transform=`rotate(${i*45}deg)`;divider.setAttribute('aria-hidden','true');
 const pin=document.createElement('span');pin.className='wheel-pin';pin.style.left=`${50+Math.sin(angle)*47.7}%`;pin.style.top=`${50-Math.cos(angle)*47.7}%`;pin.setAttribute('aria-hidden','true');
 wheel.append(divider,pin);
}

wheelSegments.forEach((segment,sector)=>{
 const cell=document.createElement('div');cell.className=`wheel-prize sector-${segment.type}`;cell.setAttribute('aria-label',segment.label);
 const angle=(sector*45+22.5)*Math.PI/180;
 cell.style.left=`${50+Math.sin(angle)*33}%`;cell.style.top=`${50-Math.cos(angle)*33}%`;
 cell.style.transform=`translate(-50%,-50%) rotate(${sector*45+22.5}deg)`;
 if(segment.type==='dragon'||segment.type==='pet'){
  const image=document.createElement('img');image.src=segment.image;image.alt='';image.width=44;image.height=44;
  const name=document.createElement('span');name.className='wheel-pet-name';name.textContent=segment.label;
  cell.title=segment.label;cell.append(image,name);
 }else{
  const label=document.createElement('span');label.className='no-prize-label';label.textContent='No prize';const cross=document.createElement('span');cross.className='loss-cross';cross.textContent='×';cross.setAttribute('aria-hidden','true');cell.append(cross,label);
 }
 wheel.append(cell);
});
$('#enter').addEventListener('click',()=>{
 if(award){openResult();return}
 if(!canEnter(steps))return;
 if(!$('#modal').open)$('#modal').showModal();
 if(!wheelReady&&completedSpins===0&&!spinning){prepareWheel();return;}
 if(!spinning&&completedSpins===0){$('#modal-title').textContent='Ready for your drop?';$('#spin-subtitle').textContent='Three spins. Press the button to start.';}
});
$('#spin').addEventListener('click',()=>{
 if(award||spinning||preparing||completedSpins>=3||!canEnter(steps))return;
 spinning=true;$('#round-result').hidden=true;$('#spin').disabled=true;$('#spin').textContent='Spinning…';
 $('#enter').textContent='VIEW SPIN ↗';
 $('#modal-title').textContent='Here we go…';$('#spin-subtitle').textContent=`Spin ${completedSpins+1} of 3. Watch the pointer.`;
 $('#spin-note').textContent='Three spins. One legendary prize.';
 $('#modal').classList.add('is-spinning');
 const sector=demoSpinSectors[completedSpins],startRotation=currentRotation,rotation=rotationAfter(startRotation,sector),duration=reduced?200:(completedSpins===2?12800:7800);
 const frames=Array.from({length:241},(_,i)=>({transform:`rotate(${startRotation+(rotation-startRotation)*spinProgress(i/240)}deg)`,offset:i/240}));
 const anim=wheel.animate(frames,{duration,easing:'linear',fill:'forwards'});
 const pointer=$('.wheel-pointer');let lastBoundary=Math.floor(startRotation/45),releasedAt=-Infinity;
 function ticks(){
  if(!spinning||!$('#modal').classList.contains('is-spinning'))return;
  const elapsed=Number(anim.currentTime)||0,progress=Math.min(elapsed/duration,1),angle=startRotation+(rotation-startRotation)*spinProgress(progress),boundary=Math.floor(angle/45);
  if(boundary>lastBoundary){
   tone(440,.025);lastBoundary=boundary;releasedAt=elapsed;
  }
  pointer.style.transform=`translateX(-50%) rotate(${pointerDeflection(angle,elapsed-releasedAt)}deg)`;
  if(progress>.73)$('#modal-title').textContent=completedSpins===2?'Almost there…':'Slowing down…';
  if(progress<1)requestAnimationFrame(ticks);
 }if(!reduced)requestAnimationFrame(ticks);
 anim.finished.then(async()=>{
  pointer.style.transform='translateX(-50%) rotate(0deg)';
  currentRotation=rotation;completedSpins++;save();updateRound();
  if(completedSpins<3){
   $('#modal').classList.remove('is-spinning');
   $('#modal-title').textContent=completedSpins===1?'You got a Kangaroo!':'No prize this time.';
   $('#spin-subtitle').textContent=completedSpins===1?'Your first spin is complete.':'Your second spin is complete.';
   $('#round-result').hidden=false;$('#round-result').textContent=completedSpins===1?'Kangaroo collected':'No prize this time';
   $('#round-result').className=completedSpins===1?'round-small-win':'round-no-prize';
   tone(completedSpins===1?659:294,.16);if(completedSpins===1)await flyToBag(wheel.querySelector('[aria-label="Kangaroo"]'),'pet');spinning=false;$('#spin').disabled=false;$('#enter').textContent='CONTINUE YOUR SPINS ↗';return;
  }

  $('#modal').classList.remove('is-spinning');$('#modal').classList.add('landed','victory-beat');$('#spin').hidden=true;
  $('#modal-title').textContent='YOU WON!';$('#spin-subtitle').textContent='Shadow Dragon. The legendary drop is yours.';
  $('#spin-note').textContent='Get ready for your prize reveal.';
  celebrate();
  setTimeout(()=>{spinning=false;award={index:0,deadline:Date.now()+300000};save();result(true);$('#enter').disabled=false;$('#enter').textContent='VIEW YOUR PRIZE ↗';},reduced?400:3600);
 });
});
$('#reset').addEventListener('click',()=>{if(spinning)return;try{localStorage.removeItem(key)}catch{}location.reload()});
setInterval(tick,1000);
if(award){$('#enter').disabled=false;$('#enter').textContent='VIEW YOUR PRIZE ↗';$('#hint').textContent='Your prizes have been saved';openResult()}
