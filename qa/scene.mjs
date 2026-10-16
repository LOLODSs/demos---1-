const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/local/bin/chromium',args:['--no-sandbox']});
const report={passed:false,checks:[],errors:[]};const check=(name,value)=>{report.checks.push({name,passed:!!value});assert.ok(value,name)};
try{
for(const offline of [false,true]){
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'});p.on('pageerror',e=>report.errors.push(e.message));
 await p.goto(offline?new URL('../preview.html',import.meta.url).href:(process.env.BASE_URL || 'http://127.0.0.1:4200'));
 await p.locator('.visit-scene').scrollIntoViewIfNeeded();await p.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.visit-scene img')].map(e=>e.decode()))});
 for(const pet of ['cat','dog'])for(const repeat of [false,true]){
  await p.locator('.visit-choice-group button').getByText(pet==='cat'?'Кошка':'Собака',{exact:true}).click();
  await p.locator('.visit-choice-group button').getByText(repeat?'Повторный':'Первый',{exact:true}).click();await p.waitForTimeout(750);
  const prefix=(offline?'offline':'hosted')+'-'+pet+'-'+(repeat?'repeat':'first');
  check(prefix+': correct artwork',await p.locator('.visit-scene img.is-active').evaluate((e,kind)=>e.src.includes('visit-'+kind+'-illustration')||e.src.startsWith('data:image/webp'),pet));
  check(prefix+': only one image visible',await p.locator('.visit-scene img').evaluateAll(es=>es.filter(e=>getComputedStyle(e).opacity==='1').length===1));
  check(prefix+': matching caption',(await p.locator('.visit-scene__caption').innerText()).includes(pet==='cat'?'Кошка':'Собака'));
  check(prefix+': matching visit',(await p.locator('#visit-ticket-title').innerText()).includes(repeat?'повторный':'первый'));
  const event=p.waitForEvent('download');await p.locator('.visit-ticket__actions .button').click();const d=await event;await d.saveAs('qa/'+prefix+'.png');check(prefix+': export created',(await fs.stat('qa/'+prefix+'.png')).size>100000);
  await p.waitForFunction(()=>!document.querySelector('.visit-ticket__actions .button').disabled);
  check(prefix+': no export error',(await p.locator('.visit-ticket__print-help').innerText()).includes('сохранена'));
 }
 await p.locator('.visit-choice-group button').getByText('Кошка',{exact:true}).click();check('status resets after selection',!(await p.locator('.visit-ticket__print-help').innerText()).includes('сохранена'));
 await p.emulateMedia({reducedMotion:'reduce'});check('reduced motion: no transition',await p.locator('.visit-scene img').first().evaluate(e=>getComputedStyle(e).transitionDuration==='0s'));
 await p.locator('.visit-choice-group button').getByText('Собака',{exact:true}).click();await p.locator('.visit-scene').evaluate(e=>{const s=document.querySelector('.site-scroll');s.scrollTop=e.getBoundingClientRect().top+s.scrollTop-72});
 await p.screenshot({path:'qa/'+(offline?'offline':'hosted')+'-dog-scene.png'});
 await p.emulateMedia({media:'print'});check('scene excluded from print',await p.locator('.visit-scene').evaluate(e=>getComputedStyle(e).display==='none'));await p.close();
}
check('no JS errors',!report.errors.length);report.passed=true;
}finally{await b.close();await fs.writeFile('qa/scene-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,errors:report.errors}));}
