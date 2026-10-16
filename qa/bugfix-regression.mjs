const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'/usr/local/bin/chromium',args:['--no-sandbox']});
const base=process.env.BASE_URL||'http://127.0.0.1:4205';const report={passed:false,checks:[],errors:[]};const check=(name,v)=>{report.checks.push({name,passed:!!v});assert.ok(v,name)};
async function enter(p,phone){await p.locator('#booking-name').fill('Проверка');await p.locator('#booking-phone').fill(phone);await p.locator('#booking-pet').selectOption({label:'Кошка'});}
try{
for(const width of [390,1440]){
 const p=await b.newPage({viewport:{width,height:844},reducedMotion:'reduce'});p.on('pageerror',e=>report.errors.push(e.message));await p.goto(base);const opener=width<=760?'.mobile-actions .button--amber':'.header__book';
 for(const phone of ['+7+9001234567','7900++1234567','++79001234567','7900abc1234567','12345']){
 await p.locator(opener).click();await enter(p,phone);await p.locator('.form-submit').click();check(width+': rejects '+phone,await p.locator('#booking-phone').getAttribute('aria-invalid')==='true'&&await p.locator('.booking-success').count()===0);await p.keyboard.press('Escape');}
 for(const phone of ['+7 (900) 123-45-67','8 900 123 45 67','  +7 900 123–45–67  ']){
 await p.locator(opener).click();await enter(p,phone);await p.locator('.form-submit').click();check(width+': accepts valid '+phone,await p.locator('.booking-success').isVisible());await p.keyboard.press('Escape');}
 await p.locator('.doctor-card__image').first().click();await p.locator('.doctor-profile .button').click();await p.locator('.booking-options summary').click();await p.locator('#booking-doctor').selectOption('elena');check(width+': doctor banner updates',(await p.locator('.booking-choice').innerText()).includes('Елена Соколова'));
 await p.locator('#booking-doctor').selectOption('');check(width+': cleared doctor has no stale banner',await p.locator('.booking-choice').count()===0);
 await p.keyboard.press('Escape');await p.locator(opener).click();check(width+': form resets on reopen',await p.locator('#booking-name').inputValue()===''&&await p.locator('#booking-phone').inputValue()===''&&await p.locator('#booking-pet').inputValue()==='');
 check(width+': required fields announced',await p.locator('#booking-name,#booking-phone,#booking-pet').evaluateAll(es=>es.every(e=>e.required)));
 await p.keyboard.press('Escape');
 await p.goto(base+'/#contacts');await p.waitForTimeout(300);check(width+': direct section link works',await p.locator('#contacts').evaluate(e=>{const y=e.getBoundingClientRect().top,h=document.querySelector('header').getBoundingClientRect().bottom;return y>=h-1&&y<h+64}));await p.reload();await p.waitForTimeout(300);check(width+': reload preserves section',await p.locator('#contacts').evaluate(e=>e.getBoundingClientRect().top<180));
 await p.goto(base+'/#%E0%A4%A');await p.waitForTimeout(150);check(width+': malformed fragment does not crash',await p.locator('.brand-link').first().isVisible());await p.close();
}
for(const height of [568,844]){
 const p=await b.newPage({viewport:{width:390,height},reducedMotion:'no-preference'});p.on('pageerror',e=>report.errors.push(e.message));await p.goto(base);await p.locator('.mobile-actions .button--amber').click();await enter(p,'+7 900 1234567');await p.locator('.booking-options summary').click();await p.waitForTimeout(350);await p.locator('#booking-date').fill('2020-01-01');await p.locator('.booking-options summary').click();await p.waitForTimeout(350);await p.locator('.form-submit').click();await p.waitForTimeout(400);
 check(height+': collapsed date error opens options',await p.locator('.booking-options').evaluate(e=>e.open));
 check(height+': invalid date focused and visible',await p.locator('#booking-date').evaluate(e=>{const r=e.getBoundingClientRect(),v=e.closest('dialog').getBoundingClientRect();return e===document.activeElement&&r.top>=v.top&&r.bottom<=v.bottom}));
 await p.screenshot({path:`qa/${height}-date-error-fixed.png`});
 const today=await p.locator('#booking-date').getAttribute('min');await p.locator('#booking-date').fill(today);await p.locator('.form-submit').click();check(height+': valid date recovers form',await p.locator('.booking-success').isVisible());await p.close();
}
const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.goto(new URL('../preview.html',import.meta.url).href+'#contacts');await p.waitForTimeout(250);check('offline fragment works',await p.locator('#contacts').evaluate(e=>e.getBoundingClientRect().top<170));await p.close();
check('no JS errors',!report.errors.length);report.passed=true;
}finally{await b.close();await fs.writeFile('qa/bugfix-regression-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,errors:report.errors}));}
