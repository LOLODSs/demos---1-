import {build} from 'esbuild';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fixture=await build({entryPoints:['src/main.jsx'],absWorkingDir:process.cwd(),bundle:true,write:false,outdir:'fixture',jsx:'automatic',format:'esm',minify:true,define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'verified-phone-test-only',setup(b){b.onLoad({filter:/\/src\/data\.js$/},async a=>({contents:(await fs.readFile(a.path,'utf8')).replace('phoneHref: null','phoneHref: "tel:+12025550123"').replace('phone: "+7 (900) 120-45-67"','phone: "+1 (202) 555-0123"'),loader:'js'}));}}]});
const js=fixture.outputFiles.find(f=>f.path.endsWith('.js')).text;
const browser=await chromium.launch({executablePath:'/usr/local/bin/chromium',args:['--no-sandbox']});
const report={passed:false,checks:[]};function check(name,v){report.checks.push({name,passed:!!v});assert.ok(v,name);}
try{for(const width of [320,390,768,1440]){
 const p=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
 await p.route('**/assets/main.js',r=>r.fulfill({contentType:'text/javascript',body:js}));
 await p.goto(process.env.BASE_URL || 'http://127.0.0.1:4201');
 const shortcut=p.locator(width<=760?'.mobile-actions .button--urgent':'.header__urgent');
 check(width+': urgent is native telephone link',await shortcut.evaluate(e=>e.tagName==='A'&&e.getAttribute('href')==='tel:+12025550123'));
 // Prevent the browser from invoking an external phone application during QA.
 await p.evaluate(()=>document.addEventListener('click',e=>{if(e.target.closest('a[href^="tel:"]')){e.preventDefault();window.__call=e.target.closest('a').getAttribute('href');}},true));
 await shortcut.click();check(width+': phone action instead of form',(await p.evaluate(()=>window.__call))==='tel:+12025550123'&&await p.locator('dialog[open]').count()===0);
 if(width<1280){await p.locator('.header__menu').click();check(width+': menu urgent calls',await p.locator('.menu-urgent').getAttribute('href')==='tel:+12025550123');}
 await p.close();
}report.passed=true;}finally{await browser.close();await fs.writeFile('qa/phone-routing-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,checks:report.checks.length}));}
