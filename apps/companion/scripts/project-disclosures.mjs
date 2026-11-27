// Reveal an existing control by clicking its actual disclosure summaries, outermost first.
// This does not mutate details.open or skip measurement of the folded default screen.
export async function revealDetails(locator){
  if(await locator.count()!==1)return;
  for(const owner of await locator.locator('xpath=ancestor::details[not(@open)]').all()){
    await owner.locator(':scope > summary').click();
  }
}
export async function expandProjectDetails(page){
  for(const selector of ['.project-ai-guidance','.project-check-details']){
    const details=page.locator(selector);
    if(await details.count()&&!(await details.evaluate(node=>node.open)))await details.locator(':scope > summary').click();
  }
}
