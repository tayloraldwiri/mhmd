/* Motion is decorative: all content and controls work without this file. */
(()=>{
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
 const pauseButton=document.querySelector('.motion-toggle');
 let paused=reduced.matches;
 try{paused=paused||localStorage.getItem('step-motion')==='paused'}catch{}
 let heroVisible=true,frame=0,lastTime=0,canvasWidth=0,canvasHeight=0,ratio=1;
 const hero=document.querySelector('.hero-art');
 const canvas=hero?.querySelector('canvas');
 const context=canvas?.getContext('2d');
 const nodes=Array.from({length:38},(_,i)=>({x:(Math.sin(i*12.3)+1)/2,y:(Math.cos(i*4.7)+1)/2,phase:i*1.7,r:i%4===0?2:1}));
 const pointer={x:-1000,y:-1000};
 function updateMotion(){
  root.dataset.motion=paused?'paused':'on';
  pauseButton?.setAttribute('aria-pressed',String(paused));
  pauseButton?.setAttribute('aria-label',paused?'تشغيل الحركة':'إيقاف الحركة');
  if(pauseButton)pauseButton.querySelector('span').textContent=paused?'▷':'Ⅱ';
  cancelAnimationFrame(frame);frame=0;
  if(!paused&&!document.hidden&&heroVisible&&context)frame=requestAnimationFrame(draw);
 }
 pauseButton?.addEventListener('click',()=>{
  paused=!paused;try{localStorage.setItem('step-motion',paused?'paused':'on')}catch{}
  updateMotion();
 });
 reduced.addEventListener('change',()=>{paused=reduced.matches;updateMotion();if(paused)document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'))});
 document.addEventListener('visibilitychange',updateMotion);
 function draw(now){
  if(paused||document.hidden||!heroVisible||!context){frame=0;return}
  frame=requestAnimationFrame(draw);
  if(now-lastTime<32)return;
  lastTime=now;context.clearRect(0,0,canvasWidth,canvasHeight);
  const points=nodes.map(n=>{
   let x=n.x*canvasWidth+Math.sin(now*.00018+n.phase)*13;
   let y=n.y*canvasHeight+Math.cos(now*.00013+n.phase)*12;
   const dx=x-pointer.x,dy=y-pointer.y,d=Math.hypot(dx,dy);
   if(d<100&&d>0){x+=dx/d*(100-d)*.18;y+=dy/d*(100-d)*.18}
   return {x,y,r:n.r};
  });
  points.forEach((p,i)=>{
   context.beginPath();context.fillStyle='rgba(197,228,164,0.43)';context.arc(p.x,p.y,p.r,0,Math.PI*2);context.fill();
   for(let j=i+1;j<points.length;j++){
    const q=points[j],distance=Math.hypot(p.x-q.x,p.y-q.y);
    if(distance<78){context.beginPath();context.strokeStyle=`rgba(169,211,150,${(1-distance/78)*.13})`;context.lineWidth=.7;context.moveTo(p.x,p.y);context.lineTo(q.x,q.y);context.stroke()}
   }
  });
 }
 function connectServices(){
  if(!hero)return;
  const bounds=hero.getBoundingClientRect();
  if(!bounds.width||!bounds.height)return;
  const svg=hero.querySelector('.service-connections');
  svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
  svg.replaceChildren();hero.querySelectorAll('.flow-packet').forEach(el=>el.remove());
  const hub=hero.querySelector('.hub').getBoundingClientRect();
  const cx=hub.left+hub.width/2-bounds.left,cy=hub.top+hub.height/2-bounds.top;
  hero.querySelectorAll('.floating').forEach((card,i)=>{
   const box=card.getBoundingClientRect(),x=box.left+box.width/2-bounds.left,y=box.top+box.height/2-bounds.top;
   const d=`M ${cx} ${cy} Q ${(cx+x)/2+(i%2?22:-22)} ${(cy+y)/2-22} ${x} ${y}`;
   const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);path.dataset.connection=String(i);path.style.setProperty('--connection-delay',`${i*-.8}s`);svg.append(path);
   const packet=document.createElement('span');packet.className='flow-packet';packet.setAttribute('aria-hidden','true');packet.style.offsetPath=`path('${d}')`;packet.style.animationDelay=`${i*-.8}s`;packet.style.animationDuration=`${4+i*.45}s`;hero.append(packet);
  });
  ratio=Math.min(devicePixelRatio||1,2);canvasWidth=bounds.width;canvasHeight=bounds.height;
  if(context){canvas.width=canvasWidth*ratio;canvas.height=canvasHeight*ratio;canvas.style.width=`${canvasWidth}px`;canvas.style.height=`${canvasHeight}px`;context.setTransform(ratio,0,0,ratio,0,0)}
 }
 if(hero){
  hero.querySelectorAll('.floating').forEach((card,i)=>{
   card.style.setProperty('--float-delay',`${i*-.9}s`);
   for(const event of ['pointerenter','focus'])card.addEventListener(event,()=>{hero.dataset.activeService=String(i);hero.querySelectorAll('[data-connection]').forEach(p=>p.classList.toggle('connection-active',p.dataset.connection===String(i)))});
   for(const event of ['pointerleave','blur'])card.addEventListener(event,()=>{delete hero.dataset.activeService;hero.querySelectorAll('.connection-active').forEach(p=>p.classList.remove('connection-active'))});
  });
  hero.addEventListener('pointermove',e=>{if(paused||!finePointer.matches)return;const b=hero.getBoundingClientRect();pointer.x=e.clientX-b.left;pointer.y=e.clientY-b.top;hero.style.setProperty('--pointer-x',`${pointer.x}px`);hero.style.setProperty('--pointer-y',`${pointer.y}px`)});
  hero.addEventListener('pointerleave',()=>{pointer.x=-1000;pointer.y=-1000});
  if('ResizeObserver'in window){let resizeFrame;new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(connectServices)}).observe(hero)}
  else window.addEventListener('resize',connectServices,{passive:true});
  requestAnimationFrame(connectServices);
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;hero.classList.toggle('network-visible',heroVisible);updateMotion()},{rootMargin:'100px'}).observe(hero);
 }
 // Reveal real content progressively, with no dependence on animation for access.
 const revealTargets=document.querySelectorAll('.hero-copy>* , .section-heading, .service-card, .finder-intro, .finder, .process article, .statement>* , .faq-section>div, .contact>div, footer>div');
 if('IntersectionObserver'in window&&!paused){
  const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting){target.classList.add('is-visible');observer.unobserve(target)}}),{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  root.classList.add('motion-ready');revealTargets.forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--reveal-delay',`${el.matches('.service-card')?i%3*.09:el.matches('.hero-copy>*')?i*.075:el.matches('.process article')?i%3*.12:0}s`);observer.observe(el)});
  document.addEventListener('focusin',e=>e.target.closest('.reveal')?.classList.add('is-visible'));
 }
 document.querySelectorAll('.service-card,.contact-card').forEach(card=>{
  card.classList.add('tilt-surface');
  card.addEventListener('pointermove',e=>{
   if(paused||!finePointer.matches)return;
   const rect=card.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;
   card.style.setProperty('--tilt-x',`${(y-.5)*-5}deg`);card.style.setProperty('--tilt-y',`${(x-.5)*5}deg`);card.style.setProperty('--shine-x',`${x*100}%`);card.style.setProperty('--shine-y',`${y*100}%`);
  });
  card.addEventListener('pointerleave',()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg')});
 });
 document.addEventListener('click',e=>{
  const button=e.target.closest('.button,.choice');if(!button||paused)return;
  const rect=button.getBoundingClientRect(),ripple=document.createElement('span');ripple.className='click-ripple';ripple.setAttribute('aria-hidden','true');ripple.style.left=`${e.clientX?e.clientX-rect.left:rect.width/2}px`;ripple.style.top=`${e.clientY?e.clientY-rect.top:rect.height/2}px`;button.append(ripple);ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});setTimeout(()=>ripple.remove(),900);
 });
 const finder=document.querySelector('#finder-content');
 if(finder)new MutationObserver(()=>{if(paused)return;finder.classList.remove('finder-enter');void finder.offsetWidth;finder.classList.add('finder-enter')}).observe(finder,{childList:true});
 document.querySelectorAll('.process article').forEach((el,i)=>el.style.setProperty('--step-index',i));
 const toTop=document.querySelector('.back-to-top'),bar=document.querySelector('.reading-progress');let scrollFrame;
 function updateScroll(){scrollFrame=0;const max=document.documentElement.scrollHeight-innerHeight;bar?.style.setProperty('--read-progress',max>0?scrollY/max:0);toTop?.classList.toggle('is-shown',scrollY>650)}
 addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll)},{passive:true});addEventListener('resize',updateScroll,{passive:true});updateScroll();
 toTop?.addEventListener('click',()=>{window.scrollTo({top:0,behavior:paused?'instant':'smooth'});document.querySelector('header .brand')?.focus({preventScroll:true})});
 updateMotion();
})();
