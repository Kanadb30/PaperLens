
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
  
  try {
    console.log("Logging in as kanadb...");
    await page.goto('http://localhost:3000/login?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTc3OTY5OTcwMCwiZXhwIjoxNzc5NzAzMzAwLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BtYXloYWNrYXRob24tMjY2MDcuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0BtYXloYWNrYXRob24tMjY2MDcuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJ1aWQiOiJrYW5hZGItdGVzdC11aWQiLCJjbGFpbXMiOnsiZW1haWwiOiJrYW5hZGJAaWl0YmhpbGFpLmFjLmluIn19.IzIHB5sZ8aasHDis4I9WXa6KEUeTSX9wtASlwLA97yYWx8T9i9LQulG-lHbyS7KrdVn3SqN_RWz12O2BAqi1Uq0BAaxynhkXpMoEFkHHrzmf_m6v53dSGbZsfTNhyG4KLd8xA2_tY7Zy4bpMsxZAP9ukMmdOe8YwAUaKDlmPMvnxtUrjFh-me_9aqgeVyUT-W1yPixGGeEALcOM48_0A9a95g9eLl5tlCg6KLIScSDekDhq466kzUIocMSitiWNgcs7bkLY11DyTJlMPAj0u--kvFhLqrdGxL8tKFYFWSlVhPM3Fv1uOy7FWUvzaBYouKFuGmFsaiZIBC7CDkfP_Jg', { waitUntil: 'load' });
    
    // Wait until dashboard loads
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    console.log("Navigating to analyze...");
    await page.goto('http://localhost:3000/analyze', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    console.log("Uploading PDF...");
    const fileInput = await page.$('input[type="file"]');
    await fileInput.setInputFiles('public/Quantum_AI_Research.pdf');
    
    // Wait for upload/analysis to complete (wait for some text like "Analysis Complete" or just wait a bit)
    await page.waitForTimeout(15000);
    
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
    