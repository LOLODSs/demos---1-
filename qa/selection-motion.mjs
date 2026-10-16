const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/local/bin/chromium',args:['--no-sandbox']});
const report={passed:false,checks:[],errors:[]};const check=(n,v)=>{report.checks.push({name:n,passed:!!v});assert.ok(v,n)};
const active=async p=>p.locator('#about').evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').map(a=>({iterations:a.effect.getTiming().iterations,type:a.constructor.name})));
try{
for(const width of [390,1440]){
 const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'no-preference'});p.on('pageerror',e=>report.errors.push(e.message));await p.goto(process.env.BASE_URL || 'http://127.0.0.1:4201');
 await p.locator('.visit-scene').scrollIntoViewIfNeeded();await p.waitForTimeout(900);
 check(width+': idle scene is still',(await active(p)).length===0);
 const scroll=await p.evaluate(()=>innerWidth<=760?document.querySelector('.site-scroll').scrollTop:scrollY);
 await p.getByRole('button',{name:'Собака',exact:true}).click();
 await p.waitForTimeout(80);const during=await active(p);check(width+': selection starts finite accent',during.length>0&&during.every(a=>a.iterations===1));
 if(width>760)check(width+': runner visibly travels',await p.locator('.visit-scene__runner').evaluate(e=>getComputedStyle(e).transform!=='none'));else check(width+': redundant journey hidden',await p.locator('.visit-scene__journey').evaluate(e=>getComputedStyle(e).display==='none'));
 await p.screenshot({path:`qa/${width}-motion-mid.png`});
 await p.waitForTimeout(850);check(width+': all accents stop',(await active(p)).length===0);
 check(width+': no forced scrolling',Math.abs((await p.evaluate(()=>innerWidth<=760?document.querySelector('.site-scroll').scrollTop:scrollY))-scroll)<=1);
 check(width+': runner disappears',await p.locator('.visit-scene__runner').evaluate(e=>getComputedStyle(e).opacity==='0'));
 check(width+': matching pet content',(await p.locator('#visit-ticket-title').innerText()).includes('Собака'));
 check(width+': no overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.getByRole('button',{name:'Повторный',exact:true}).click();await p.waitForTimeout(90);
 check(width+': repeat visit starts feedback',(await active(p)).length>0);
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);check(width+': live reduced-motion cancels animations',(await active(p)).length===0);
 await p.getByRole('button',{name:'Кошка',exact:true}).click();await p.waitForTimeout(50);check(width+': reduced mode stays still',(await active(p)).length===0);
 await p.emulateMedia({reducedMotion:'no-preference'});
 for(const name of ['Собака','Кошка','Собака','Кошка']){await p.getByRole('button',{name,exact:true}).click();await p.waitForTimeout(35);}
 check(width+': rapid choices do not queue', (await active(p)).filter(a=>a.type==='Animation').length<=7);
 await p.waitForTimeout(900);check(width+': rapid choices settle',(await active(p)).length===0);
 await p.getByRole('button',{name:'Собака',exact:true}).click();await p.emulateMedia({media:'print'});await p.waitForTimeout(100);
 check(width+': print cancels scene animations',(await active(p)).length===0);
 await p.emulateMedia({media:'screen'});await p.waitForTimeout(800);await p.screenshot({path:`qa/${width}-motion-settled.png`});await p.close();
}
const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>report.errors.push(e.message));await p.addInitScript(()=>{delete Element.prototype.animate});await p.goto(new URL('../preview.html',import.meta.url).href);await p.getByRole('button',{name:'Собака',exact:true}).click();check('fallback without Web Animations',(await p.locator('#visit-ticket-title').innerText()).includes('Собака'));await p.close();
check('no JS errors',!report.errors.length);report.passed=true;
}finally{await b.close();await fs.writeFile('qa/selection-motion-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,errors:report.errors}));}
