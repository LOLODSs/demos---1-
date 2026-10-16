const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:'/usr/local/bin/chromium',args:['--no-sandbox']});
const report={passed:false,checks:[],sizes:[],errors:[]};const check=(name,v)=>report.checks.push({name,passed:!!v});
const measure=p=>p.evaluate(()=>({total:innerWidth<=760?document.querySelector('.site-scroll').scrollHeight:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight),sections:[...document.querySelectorAll('main > section,.care-path')].map(e=>({id:e.id||'care-path',height:Math.round(e.getBoundingClientRect().height)}))}));
try{for(const width of [320,390,600,760,768,1440]){
 const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'});p.on('pageerror',e=>report.errors.push(e.message));
 await p.goto('file:///data/lesnaya-v197/preview.html');await p.evaluate(()=>document.fonts.ready);const before=await measure(p);
 await p.goto('file:///data/lesnaya-v1910/preview.html');await p.evaluate(()=>document.fonts.ready);const after=await measure(p);report.sizes.push({width,before,after});
 if(width<=760){check(`${width} compact scroll`,after.total<before.total*.93);for(const toggle of await p.locator('.mobile-disclosure__toggle').all()){check(`${width} closed initially`,await toggle.getAttribute('aria-expanded')==='false');await toggle.click();check(`${width} expands`,await toggle.getAttribute('aria-expanded')==='true');await toggle.press('Enter');check(`${width} keyboard collapses`,await toggle.getAttribute('aria-expanded')==='false');}}
 else check(`${width} desktop sections unchanged`,JSON.stringify(before.sections)===JSON.stringify(after.sections));
 // Core information remains visible, not clamped or hidden behind disclosures.
 check(`${width} all service prices visible`,await p.locator('.service-card__price').evaluateAll(es=>es.length===6&&es.every(e=>e.getBoundingClientRect().height>0)));
 check(`${width} safety advice always visible`,await p.locator('.visit-ticket__preparation').isVisible());
 if(width===390){
   await p.emulateMedia({media:'print'});check('print includes collapsed advice',await p.locator('.visit-ticket__more section').isVisible());await p.emulateMedia({media:'screen'});
   await p.locator('.visit-ticket__more .mobile-disclosure__toggle').click();await p.locator('.visit-choice-group button').nth(1).click();check('expanded advice follows pet selection',(await p.locator('#visit-ticket-title').innerText()).includes('Собака'));await p.setViewportSize({width:1024,height:900});check('desktop expanded automatically',await p.locator('.visit-ticket__more section').isVisible());await p.setViewportSize({width:390,height:900});check('mobile disclosure state retained',await p.locator('.visit-ticket__more .mobile-disclosure__toggle').getAttribute('aria-expanded')==='true');
 }
 await p.close();
}
check('no runtime errors',!report.errors.length);report.passed=report.checks.every(x=>x.passed);
}finally{await b.close();await fs.writeFile('qa/mobile-compact-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.checks.filter(c=>!c.passed),sizes:report.sizes.map(x=>({width:x.width,before:x.before.total,after:x.after.total,reduction:Math.round((1-x.after.total/x.before.total)*100)})),errors:report.errors}));}
