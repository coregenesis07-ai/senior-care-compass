const {test,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
for(const [path,lang] of [['/index.html','en'],['/es.html','es']]){
 test(lang+' mobile homepage and directory controls',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:8080'+path);
  await expect(page.locator('html')).toHaveAttribute('lang',lang);
  await expect(page.locator('#zipInput')).toBeVisible();
  await page.locator('#zipInput').fill('37087');
  await expect(page.locator('#zipInput')).toHaveValue('37087');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  await test.info().attach('accessibility.json',{body:JSON.stringify(results.violations,null,2),contentType:'application/json'});
  expect(results.violations.filter(v=>v.impact==='critical')).toEqual([]);
 });
}
