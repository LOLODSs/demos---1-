const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/usr/local/bin/chromium',args:['--no-sandbox']});
const report={passed:false,checks:[],errors:[]};const check=(name,v)=>{report.checks.push({name,passed:!!v});assert.ok(v,name);};
try{for(const width of [320,390,715,820,1440]){
const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'no-preference'});p.on('pageerror',e=>report.errors.push(e.message));await p.goto(process.env.BASE_URL || 'http://127.0.0.1:4202');
const d=p.locator('#service-diagnostics .service-card__details'),s=d.locator('summary');await d.scrollIntoViewIfNeeded();await p.waitForTimeout(900);
const h=await d.evaluate(e=>e.getBoundingClientRect().height);
check(width+': plus next to text',await s.evaluate(e=>{const t=e.querySelector('span').getBoundingClientRect(),i=e.querySelector('svg').getBoundingClientRect();return i.left-t.right>=7&&i.left-t.right<=10;}));
check(width+': hit target at least 44px',await s.evaluate(e=>e.getBoundingClientRect().height>=44));
await s.click();await p.waitForTimeout(70);
const mid=await d.evaluate(e=>({h:e.getBoundingClientRect().height,a:e.getAnimations().filter(a=>a.playState==='running').length}));check(width+': opening animates',mid.a>0&&mid.h>h);
await p.waitForTimeout(350);const full=await d.evaluate(e=>e.getBoundingClientRect().height);check(width+': open content visible',full>h+60&&await s.getAttribute('aria-expanded')==='true');
if([390,715].includes(width))await p.screenshot({path:`qa/${width}-service-open-final.png`});
await s.click();await p.waitForTimeout(65);const closing=await d.evaluate(e=>({h:e.getBoundingClientRect().height,open:e.open,a:e.getAnimations().filter(a=>a.playState==='running').length}));check(width+': closing animates before native hide',closing.open&&closing.a>0&&closing.h<full&&closing.h>h);
await p.waitForTimeout(350);check(width+': close finishes cleanly',await d.evaluate(e=>!e.open&&e.getAnimations().length===0));
for(let i=0;i<5;i++){await s.click();await p.waitForTimeout(35);}await p.waitForTimeout(400);check(width+': rapid toggle settles open',await d.evaluate(e=>e.open&&e.getAnimations().length===0));
await s.click();await p.waitForTimeout(400);await s.focus();await p.keyboard.press('Enter');await p.waitForTimeout(400);check(width+': keyboard opens',await d.evaluate(e=>e.open));await p.keyboard.press('Space');await p.waitForTimeout(400);check(width+': keyboard closes',await d.evaluate(e=>!e.open));
await s.click();await p.waitForTimeout(50);await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);check(width+': live reduced motion settles',await d.evaluate(e=>e.open&&e.getAnimations().length===0));
await s.click();check(width+': reduced motion closes immediately',await d.evaluate(e=>!e.open&&e.getAnimations().length===0));
await s.click();check(width+': reduced motion opens immediately',await d.evaluate(e=>e.open&&e.getAnimations().length===0));await s.click();
check(width+': no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await p.close();}
const p=await b.newPage({viewport:{width:390,height:844}});await p.addInitScript(()=>delete Element.prototype.animate);await p.goto(new URL('../preview.html',import.meta.url).href);const d=p.locator('.service-card__details').first();await d.locator('summary').click();check('static fallback opens',await d.evaluate(e=>e.open));await d.locator('summary').click();check('static fallback closes',await d.evaluate(e=>!e.open));await p.close();
check('no JS errors',!report.errors.length);report.passed=true;
}finally{await b.close();await fs.writeFile('qa/service-disclosure-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,errors:report.errors}));}
