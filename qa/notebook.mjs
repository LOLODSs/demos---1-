const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/usr/local/bin/chromium',args:['--no-sandbox']});const report={passed:false,checks:[]};const check=(name,v)=>{report.checks.push({name,passed:!!v});assert.ok(v,name)};
try{for(const width of [320,390,715,820,1024,1440]){const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});await p.goto(process.env.BASE_URL || 'http://127.0.0.1:4203');
const card=p.locator('.visit-ticket');
check(width+': paper fits viewport',await card.evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&e.scrollWidth<=e.clientWidth+1}));
check(width+': decorative rail separate from content',await card.evaluate(e=>{const c=getComputedStyle(e),r=getComputedStyle(e,'::before');return parseFloat(c.paddingLeft)>=parseFloat(r.left)+parseFloat(r.width)+8}));
check(width+': actions fit paper',await card.evaluate(e=>{const r=e.getBoundingClientRect();return [...e.querySelectorAll('button')].every(b=>{const s=b.getBoundingClientRect();return s.left>=r.left&&s.right<=r.right+1&&s.height>=44})}));
await p.emulateMedia({media:'print'});check(width+': print hides interactive controls',await card.locator('.visit-ticket__actions').evaluate(e=>getComputedStyle(e).display==='none'));
check(width+': print keeps memo text',await card.evaluate(e=>getComputedStyle(e).visibility!=='hidden'&&e.innerText.includes('Возьмите с собой')));await p.close();}report.passed=true;}finally{await b.close();await fs.writeFile('qa/notebook-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,checks:report.checks.length}));}
