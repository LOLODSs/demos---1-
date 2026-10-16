const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/local/bin/chromium',args:['--no-sandbox']});
const results=[];
try{
for(const width of [320,390,600,601,675,715,760,761,820,1100,1440]){
 const p=await b.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});await p.goto(new URL('../preview.html',import.meta.url).href);
 const data=await p.locator('.service-card').first().evaluate(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect(),box=x=>x.getBoundingClientRect();return {paddingLeft:parseFloat(s.paddingLeft),paddingRight:parseFloat(s.paddingRight),headingInset:box(e.querySelector('.service-card__heading')).left-r.left,priceInset:box(e.querySelector('.service-card__price')).left-r.left,buttonInset:r.right-box(e.querySelector('.service-card__book')).right,overflow:document.documentElement.scrollWidth>innerWidth,whenBottom:box(e.querySelector('.service-card__when')).bottom,priceTop:box(e.querySelector('.service-card__price')).top}});
 assert.ok(!data.overflow,width+': no overflow');
 if(width>600){assert.ok(data.paddingLeft>=20&&data.paddingRight>=20,width+': safe card padding');assert.ok(data.headingInset>=20&&data.priceInset>=20&&data.buttonInset>=20,width+': all content inset');}
 if(width>600&&width<=760)assert.ok(data.priceTop>=data.whenBottom+12,width+': price separated from text');
 await p.locator('.service-card summary').first().click();assert.notEqual(await p.locator('.service-card details').first().getAttribute('open'),null);
 await p.locator('.service-card__book').first().click();assert.ok(await p.locator('#booking-name').isVisible());await p.keyboard.press('Escape');
 results.push({width,...data,actions:'passed'});await p.close();
}
}finally{await b.close();await fs.writeFile('qa/service-spacing-results.json',JSON.stringify({passed:results.length===11,results},null,2));console.log(JSON.stringify({passed:results.length===11,widths:results.length}));}
