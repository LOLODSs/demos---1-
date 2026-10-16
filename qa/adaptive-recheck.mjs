const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:'/usr/local/bin/chromium',args:['--no-sandbox']});
const report={checks:[],errors:[],details:[]};
const check=(name,ok,detail)=>{report.checks.push({name,passed:!!ok});if(!ok)report.details.push({name,detail});};
const sizes=[[320,568],[360,640],[370,812],[371,812],[375,667],[390,844],[414,896],[480,800],[568,320],[600,900],[601,900],[715,900],[759,900],[760,900],[761,900],[768,1024],[820,1180],[844,390],[900,600],[999,800],[1000,800],[1001,800],[1024,768],[1030,800],[1031,800],[1100,800],[1200,900],[1201,900],[1280,720],[1440,900],[1920,1080],[2560,1440]];
try{for(const [width,height] of sizes){
 const p=await b.newPage({viewport:{width,height},reducedMotion:'reduce'});p.on('pageerror',e=>report.errors.push(`${width}: ${e.message}`));await p.goto('file:///data/lesnaya-v1911/preview.html');await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));});
 const d=await p.evaluate(()=>{
  const visible=e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0&&getComputedStyle(e).visibility!=='hidden';
  const bad=[...document.querySelectorAll('main h1,main h2,main h3,main p,main button,main summary,main input,main select,.header a,.header button,.mobile-actions button')].filter(visible).flatMap(e=>{const r=e.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1||e.scrollWidth>e.clientWidth+3?[{tag:e.tagName,c:e.className,text:e.textContent.slice(0,65),l:r.left,r:r.right,sw:e.scrollWidth,cw:e.clientWidth}]:[]});
  const sc=document.querySelector('.site-scroll');const dock=document.querySelector('.mobile-actions').getBoundingClientRect();
  const controls=[...document.querySelectorAll('.header__inner>*')].filter(visible).map(e=>({c:e.className,r:e.getBoundingClientRect().toJSON()}));
  const collisions=controls.flatMap((a,i)=>controls.slice(i+1).filter(b=>Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left)>1&&Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top)>1).map(b=>[a.c,b.c]));
  return {bad,collisions,overflow:document.documentElement.scrollWidth>innerWidth||sc.scrollWidth>sc.clientWidth+1,dock:innerWidth>760||sc.getBoundingClientRect().bottom<=dock.top+1,broken:[...document.images].filter(i=>!i.naturalWidth).length};
 });
 check(`${width}x${height} overflow`,!d.overflow,d);check(`${width} text/controls fit`,!d.bad.length,d.bad);check(`${width} header collision`,!d.collisions.length,d.collisions);check(`${width} dock`,d.dock,d);check(`${width} images`,!d.broken,d);
 if([320,768,1024,1440].includes(width))await p.screenshot({path:`qa/recheck-${width}-home.png`});
 if([320,768].includes(width)){for(const id of ['services','about','team','reviews','gallery','faq','contacts']){await p.locator('#'+id).evaluate(e=>{e.scrollIntoView({block:'start',behavior:'instant'});if(innerWidth<=760)document.querySelector('.site-scroll').scrollTop-=72;else window.scrollBy(0,-84);});await p.screenshot({path:`qa/recheck-${width}-${id}.png`});}}
 // All dialogs and form errors at every viewport, including landscape.
 for(const kind of ['booking','urgent']){
  const sel=kind==='booking'?(width<=760?'.mobile-actions .button--amber':'.header__book'):(width<=760?'.mobile-actions .button--urgent':'.header__urgent');await p.locator(sel).click();
  if(kind==='booking'){await p.locator('.form-submit').click();await p.locator('.booking-options summary').click();}
  const fit=await p.locator('dialog').evaluate(e=>{const r=e.getBoundingClientRect();return {l:r.left,r:r.right,t:r.top,b:r.bottom,overflow:e.scrollWidth>e.clientWidth+1,close:(()=>{const x=e.querySelector('.dialog__close').getBoundingClientRect();return x.top>=0&&x.bottom<=innerHeight;})()};});
  check(`${width}x${height} ${kind} dialog fit`,fit.l>=0&&fit.r<=width+1&&fit.t>=0&&fit.b<=height+1&&!fit.overflow&&fit.close,fit);
  if([320,768].includes(width)||height===320)await p.screenshot({path:`qa/recheck-${width}-${kind}.png`});
  if(kind==='booking'){await p.locator('.form-submit').scrollIntoViewIfNeeded();check(`${width} close reachable at bottom`,await p.locator('.dialog__close').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}));check(`${width} submit reachable`,await p.locator('.form-submit').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}));}
  await p.keyboard.press('Escape');
 }
 if(width<=1030){await p.locator('.header__menu').click();check(`${width} menu fits`,await p.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1));if(width===320||height===320)await p.screenshot({path:`qa/recheck-${width}-menu.png`});await p.keyboard.press('Escape');}
 // expanded content must remain inside its card.
 await p.locator('.service-card__details').first().locator('summary').click();await p.locator('#faq-question-1').click();
 check(`${width} expanded panels fit`,await p.locator('.service-card__details[open],.faq-answer:not([hidden])').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+2)));
 if(width===320){await p.locator('.service-card__details').first().scrollIntoViewIfNeeded();await p.screenshot({path:'qa/recheck-320-service-open.png'});await p.locator('#faq-question-1').scrollIntoViewIfNeeded();await p.screenshot({path:'qa/recheck-320-faq-open.png'});}
 await p.close();
}
check('no runtime errors',report.errors.length===0,report.errors);report.passed=report.checks.every(c=>c.passed);
}finally{await b.close();await fs.writeFile('qa/adaptive-recheck-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,failures:report.details,errors:report.errors}));}
