const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/local/bin/chromium',args:['--no-sandbox']});
const base=process.env.BASE_URL || 'http://127.0.0.1:4201';
const report={passed:false,checks:[],diagnostics:[],errors:[]};
function check(name,value){report.checks.push({name,passed:!!value});if(!value) console.error('FAIL:',name);}
try{
for(const [width,height] of [[320,568],[360,800],[390,844],[600,900],[601,900],[715,900],[760,900],[768,1024],[820,1180],[1024,768],[1100,900],[1200,900],[1280,900],[1440,1000],[1920,1080],[844,390]]){
 const p=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});p.on('pageerror',e=>report.errors.push(e.message));await p.goto(base);
 await p.evaluate(async()=>{await Promise.all([...document.images].map(async i=>{i.loading='eager';await i.decode().catch(()=>{});}));});
 const measure=await p.evaluate(()=>{
 const v=e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return b.width>0&&b.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
 const issues=[...document.querySelectorAll('main h2,main h3,.visit-choice-group button,.header a,.header button,.mobile-actions .button')].filter(v).flatMap(e=>{const b=e.getBoundingClientRect();return b.left < -1 || b.right>innerWidth+1 || e.scrollWidth>e.clientWidth+2 ? [{tag:e.tagName,cl:e.className,text:e.textContent.trim().slice(0,55),left:b.left,right:b.right,scroll:e.scrollWidth,client:e.clientWidth}]:[];});
 const h=[...document.querySelectorAll('.header__inner >*,.header__actions >*')].filter(v).map(e=>({cl:e.className,r:e.getBoundingClientRect().toJSON()}));
 return {overflow:document.documentElement.scrollWidth>innerWidth,issues,header:h};});
 report.diagnostics.push({width,height,...measure});check(`${width}x${height}: viewport fits`,!measure.overflow);check(`${width}: headings and controls fit`,!measure.issues.length);
 const shortcut=width<=760?'.mobile-actions .button--urgent':'.header__urgent';
 await p.locator(shortcut).click();check(`${width}: phone-only urgent dialog`,await p.locator('.urgent-dialog').isVisible());
 check(`${width}: no urgent booking or inputs`,await p.locator('.urgent-dialog form,.urgent-dialog input,.urgent-dialog button').count()===0);
 check(`${width}: no fictional tel`,await p.locator('a[href^="tel:"]').count()===0);
 const d=await p.locator('.dialog__box').evaluate(e=>{const b=e.getBoundingClientRect();return {width:b.width,left:b.left,right:b.right,overflow:e.scrollWidth>e.clientWidth+1,top:b.top,bottom:b.bottom};});
 check(`${width}: dialog horizontal fit`,d.left>=0&&d.right<=width+1&&!d.overflow);
 check(`${width}: close reachable`,await p.locator('.dialog__close').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}));
 if([320,390,768,1024,1440].includes(width)||height===390)await p.screenshot({path:`qa/${width}x${height}-urgent-final.png`});
 await p.keyboard.press('Escape');
 if([320,768,1024].includes(width)){
  await p.screenshot({path:`qa/${width}-home-adaptive.png`});
  for(const id of ['services','about','team','reviews','gallery','faq','contacts']){
   await p.locator('#'+id).evaluate(e=>{const sc=document.querySelector('.site-scroll');if(innerWidth<=760) sc.scrollTop+=e.getBoundingClientRect().top-72; else { e.scrollIntoView({block:'start',behavior:'instant'}); window.scrollBy(0,-84); }});await p.waitForTimeout(30);
   await p.screenshot({path:`qa/${width}-${id}-adaptive.png`});
  }
 }
 await p.close();
}
check('no JS errors',!report.errors.length);
report.passed=report.checks.every(c=>c.passed);
}finally{await browser.close();await fs.writeFile('qa/responsive-urgent-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,issues:report.diagnostics.filter(x=>x.issues.length).map(x=>({width:x.width,issues:x.issues}))}));}
