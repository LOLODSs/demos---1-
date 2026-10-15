const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/local/bin/chromium',args:['--no-sandbox']});
const base=process.env.BASE_URL||'http://127.0.0.1:4197';
const report={passed:false,checks:[],errors:[]};
const check=(name,passed)=>{report.checks.push({name,passed:!!passed});assert.ok(passed,name)};
try{
for(const width of [1440,390,320]){
 const p=await browser.newPage({viewport:{width,height:1000},reducedMotion:'no-preference'});p.on('pageerror',e=>report.errors.push(e.message));
 await p.goto(base);await p.waitForTimeout(650);await p.addStyleTag({content:'html,.site-scroll{scroll-behavior:auto!important}'});
 check(width+': motion enabled',await p.locator('html').evaluate(e=>e.classList.contains('has-motion')));
 check(width+': offscreen targets pending',await p.locator('[data-reveal]:not(.is-revealed)').count()>0);
 await p.locator('.service-card').first().evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));
 await p.waitForFunction(()=>document.querySelector('.service-card').classList.contains('is-revealed'));
 const initial=await p.locator('.service-card').first().evaluate(e=>Number(getComputedStyle(e).opacity));
 await p.waitForTimeout(160);const middle=await p.locator('.service-card').first().evaluate(e=>Number(getComputedStyle(e).opacity));
 check(width+': real fade progresses',middle>=initial&&initial<1);
 await p.waitForTimeout(650);
 check(width+': revealed target fully visible',await p.locator('.service-card').first().evaluate(e=>getComputedStyle(e).opacity==='1'));
 const count=await p.locator('[data-reveal]').count();
 for(let i=0;i<count;i++){
  await p.locator('[data-reveal]').nth(i).evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));
  await p.waitForTimeout(35);
 }
 await p.waitForTimeout(750);
 check(width+': all targets revealed',await p.locator('[data-reveal]:not(.is-revealed)').count()===0);
 check(width+': no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.locator('#services').evaluate(e=>e.scrollIntoView({behavior:'instant'}));await p.waitForTimeout(80);
 check(width+': reveal does not replay',await p.locator('.service-card').first().evaluate(e=>getComputedStyle(e).opacity==='1'));
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(50);
 check(width+': live reduced-motion switch',await p.locator('html').evaluate(e=>!e.classList.contains('has-motion')));
 check(width+': all visible in reduced mode',await p.locator('[data-reveal]').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1')));
 check(width+': hero animation disabled',await p.locator('.hero__copy').evaluate(e=>getComputedStyle(e).animationName==='none'));
 await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(30);
 await p.emulateMedia({media:'print'});
 check(width+': printable ticket visible',await p.locator('.visit-ticket').evaluate(e=>getComputedStyle(e).opacity==='1'));
 check(width+': print animations disabled',await p.locator('.visit-ticket__body').evaluate(e=>getComputedStyle(e).animationName==='none'));
 await p.close();
}
const p=await browser.newPage({viewport:{width:390,height:844}});await p.goto(base);await p.locator('.service-card__book').first().evaluate(e=>e.focus());
check('keyboard focus bypasses hidden state',await p.locator('.service-card').first().evaluate(e=>getComputedStyle(e).opacity==='1'));await p.close();
const q=await browser.newPage({viewport:{width:1440,height:1000}});q.on('pageerror',e=>report.errors.push(e.message));await q.addInitScript(()=>{delete window.IntersectionObserver});await q.goto(base);await q.waitForTimeout(400);
check('no observer: content stays visible',await q.locator('.service-card').first().evaluate(e=>getComputedStyle(e).opacity==='1'));
check('no observer: no pending targets',await q.locator('[data-reveal]:not(.is-revealed)').count()===0);await q.close();
check('no JS errors',report.errors.length===0);report.passed=true;
}finally{await browser.close();await fs.writeFile(root+'qa/motion-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,errors:report.errors}));}
