const admin = require('firebase-admin');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const dotenv = require('dotenv');
const { spawn } = require('child_process');

dotenv.config({ path: '.env.local' });

// 1. Generate PDF
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('public/Quantum_AI_Research.pdf'));
doc.fontSize(20).text('The Future of Quantum Artificial Intelligence', { align: 'center' });
doc.moveDown();
doc.fontSize(14).text('Abstract', { underline: true });
doc.fontSize(10).text('Quantum AI promises speedups for complex problems. By using quantum states, models can evaluate multiple states simultaneously.', { align: 'justify' });
doc.moveDown();
doc.fontSize(14).text('1. Introduction', { underline: true });
doc.fontSize(10).text('Traditional computing architectures are reaching physical limits. Parameterized quantum circuits (PQCs) can serve as trainable models.');
doc.moveDown();
doc.fontSize(14).text('2. Methodology', { underline: true });
doc.fontSize(10).text('We implemented a 4-qubit quantum neural network using Qiskit. The model was trained using the VQE (Variational Quantum Eigensolver) approach.');
doc.moveDown();
doc.fontSize(14).text('3. Results', { underline: true });
doc.fontSize(10).text('The quantum model converged in 15 epochs, compared to 50 epochs for the classical counterpart, demonstrating exponential efficiency.');
doc.moveDown();
doc.fontSize(14).text('4. Discussion', { underline: true });
doc.fontSize(10).text('While simulated results are promising, hardware noise remains a challenge. Error mitigation strategies are strictly necessary.');
doc.moveDown();
doc.fontSize(14).text('5. Conclusion', { underline: true });
doc.fontSize(10).text('Quantum AI is not just a theoretical concept; it provides tangible advantages for parameter optimization in neural networks.');
doc.end();

// 2. Generate Custom Token
const envContent = fs.readFileSync('.env.local', 'utf-8');
const jsonMatch = envContent.match(/FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON=({[\s\S]*?})\n\n/m) || envContent.match(/FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON=({[\s\S]*})/m);
const serviceAccount = JSON.parse(jsonMatch[1]);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function run() {
  try {
    const customToken = await admin.auth().createCustomToken('kanadb-test-uid', { email: 'kanadb@iitbhilai.ac.in' });
    console.log("Token generated.");
    
    // 3. Write playwright script with token
    const playwrightScript = `
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
    await page.goto('http://localhost:3000/login?token=${customToken}', { waitUntil: 'load' });
    
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
    `;
    fs.writeFileSync('run_playwright.js', playwrightScript);

    // 4. Run playwright
    const pw = spawn('node', ['run_playwright.js'], { stdio: 'inherit' });
    pw.on('close', (code) => {
      console.log('Playwright script finished with code', code);
    });

  } catch(e) {
    console.error(e);
  }
}

run();
