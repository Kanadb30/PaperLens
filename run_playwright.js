
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: path.join(__dirname, 'public'),
      size: { width: 1280, height: 720 },
    }
  });

  const page = await context.newPage();
  page.setDefaultTimeout(120000);
  
  try {
    console.log("Logging in as kanadb...");
    await page.goto('http://localhost:3000/login?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTc3OTcwMDYyMywiZXhwIjoxNzc5NzA0MjIzLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BtYXloYWNrYXRob24tMjY2MDcuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BtYXloYWNrYXRob24tMjY2MDcuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJ1aWQiOiJrYW5hZGItdGVzdC11aWQiLCJjbGFpbXMiOnsiZW1haWwiOiJrYW5hZGJAaWl0YmhpbGFpLmFjLmluIn19.g0cn4YTG15TTMFJk4N1sxqTOtJw4kiGA7lQP_0Q6vqdNjxA1opUouoZ7WT-f_aHuM8eMvhPzpzkdiZEU6TgvIieWdwcbeuIpD0Myik0ayP3p1PpYupvk0mgwMKE-agKpcRNxQhZBcjYk_TzxOUMR9aBhciWGTgfuwdhYHgFQK-TcWSWhh7TS9rUPIgc4GK_ceG0RVPuDqf7S0J8iOOQNEzhf0LLU4qoanVmOHeG-t39lOyA__CeN85ifs0U6DJcOK1qecsWWG06iYk8qyfYE4CGXHMg2V-SfW-JeO955Yt22CQNNlVaCtSnL6EgwRlWR7DigRmTfDV1E8L3JCzVmcw', { waitUntil: 'load' });
    
    // Wait until dashboard loads
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    console.log("Navigating to analyze...");
    await page.goto('http://localhost:3000/analyze', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    console.log("Uploading PDF...");
    const fileInput = await page.$('input[type="file"]');
    await fileInput.setInputFiles('public/Quantum_AI_Research.pdf');
    
    // Wait for upload/analysis to complete by waiting for the Concept Map to appear
    console.log("Waiting for analysis to complete...");
    await page.waitForFunction(() => {
        const text = document.body.innerText;
        return (text.includes('Concept Map') && !text.includes('Analysis in progress...')) || text.includes('Analysis failed');
    }, { timeout: 120000 });
    
    await page.waitForTimeout(3000);
    
    console.log("Closing Session Summary modal...");
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    // Also try clicking the backdrop just in case Escape doesn't work
    await page.mouse.click(10, 10);
    await page.waitForTimeout(1000);
    
    console.log("Scrolling Concept Map...");
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(2000);

    console.log("Clicking ELI5 Breakdown tab...");
    const eli5Tab = await page.$('text="ELI5 Breakdown"');
    if (eli5Tab) await eli5Tab.click({ force: true });
    await page.waitForTimeout(5000); // wait for it to generate
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(2000);

    console.log("Clicking Exam Simulator tab...");
    const examTab = await page.$('text="Exam Simulator"');
    if (examTab) await examTab.click({ force: true });
    await page.waitForTimeout(5000);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(3000);
    
    console.log("Scrolling results...");
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(3000);

  } catch (err) {
    console.error("Error during recording:", err);
  } finally {
    const videoPath = await page.video().path();
    await context.close();
    await browser.close();
    
    const finalPath = path.join(__dirname, 'public', 'walkthrough.webm');
    if (fs.existsSync(finalPath)) {
        fs.unlinkSync(finalPath);
    }
    fs.renameSync(videoPath, finalPath);
    console.log("Video saved to public/walkthrough.webm");
  }
})();
    