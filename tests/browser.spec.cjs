const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
for(const [path,lang] of [['/index.html','en'],['/es.html','es']]){
 test(lang+' mobile homepage and directory controls',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:8080'+path);
  await expect(page.locator('html')).toHaveAttribute('lang',lang);
  const emergency=page.locator('.emergency-panel');
  const call=emergency.getByRole('link',{name:lang==='en'?'Call 911':'Llamar al 911',exact:true});
  await expect(call).toBeVisible();
  await expect(call).toHaveAttribute('href','tel:911');
  expect((await call.boundingBox()).height).toBeGreaterThanOrEqual(48);
  await expect(emergency.locator('.emergency-icon svg')).toBeVisible();
  await expect(page.locator('#zipInput')).toBeVisible();
  await page.locator('#zipInput').fill('37087');
  await expect(page.locator('#zipInput')).toHaveValue('37087');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  await test.info().attach('accessibility.json',{body:JSON.stringify(results.violations,null,2),contentType:'application/json'});
  expect(results.violations.filter(v=>v.impact==='critical')).toEqual([]);
 });
}

for(const [path,lang] of [['/index.html','en'],['/es.html','es']]){
 test(lang+' mobile CMS search results and publication dates',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.route('**/api/providers?*',route=>route.fulfill({json:{
   location:{zip:'37087',city:'Lebanon',state:'TN'},
   hospitals:[{name:'Test Hospital',address:'Lebanon, TN 37087',phone:'6155550100'}],
   nursingHomes:[],medicalEquipment:[],clinics:[],pharmacies:[],vision:[],
   sourcesAvailable:{zip:true,cmsHospitals:true,cmsNursingHomes:true,cmsMedicalEquipment:true,nppes:true},
   cmsSnapshotReleases:{hospitals:'2026-11-12',nursingHomes:'2026-10-28',medicalEquipment:'2026-11-22'}
  }}));
  await page.goto('http://127.0.0.1:8080'+path);
  await page.locator('#zipInput').fill('37087');
  await page.locator('#zipForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#hospitalResults')).toContainText('Test Hospital');
  await expect(page.locator('#locationSummary')).toBeVisible();
  await expect(page.locator('#locationSummary')).toContainText(lang==='en'?'CMS published data:':'Datos publicados por CMS:');
  await expect(page.locator('#locationSummary')).toContainText('2026-11-12');
  await expect(page.locator('#nursingResults a[href="https://www.medicare.gov/care-compare/"]')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 });
}
