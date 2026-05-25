const admin = require('firebase-admin');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const dotenv = require('dotenv');
const { spawn } = require('child_process');

dotenv.config({ path: '.env.local' });

// 1. Generate PDF
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('public/Quantum_AI_Research.pdf'));
doc.fontSize(24).text('The Future of Quantum Artificial Intelligence', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text('Abstract: This paper explores the intersection of quantum computing and neural networks. Quantum AI promises exponential speedups for complex optimization problems and machine learning training phases. By leveraging quantum superposition and entanglement, deep learning models can potentially evaluate multiple states simultaneously, drastically reducing the time required to process large datasets.', { align: 'justify' });
doc.moveDown();
doc.text('1. Introduction: Traditional computing architectures are reaching their physical limits. Quantum algorithms, such as Grover\'s and Shor\'s, have already demonstrated theoretical superiority. When applied to AI, parameterized quantum circuits (PQCs) can serve as trainable models akin to classical neural networks.');
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
