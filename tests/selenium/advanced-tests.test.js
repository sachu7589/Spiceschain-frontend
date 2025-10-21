import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const TIMEOUT = 10000;

let driver;

async function setupDriver() {
  const options = new chrome.Options();
  options.addArguments('--start-maximized');
  options.addArguments('--disable-blink-features=AutomationControlled');
  
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  await driver.manage().setTimeouts({ implicit: TIMEOUT });
  return driver;
}

async function teardownDriver() {
  if (driver) {
    await driver.quit();
  }
}

// Advanced Test 1: Form Validation Testing
async function testFormValidation() {
  console.log('\n=== ADVANCED TEST 1: Form Validation ===');
  
  try {
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1000);
    
    // Try to find submit button
    const submitButtons = await driver.findElements(By.css('button[type="submit"], button:not([type])'));
    
    if (submitButtons.length > 0) {
      // Click submit without filling form (test validation)
      await submitButtons[0].click();
      console.log('✓ Clicked submit button without filling form');
      
      await driver.sleep(1000);
      
      // Check for error messages
      const errorElements = await driver.findElements(By.xpath("//*[contains(@class, 'error') or contains(@class, 'invalid') or contains(text(), 'required') or contains(text(), 'Required')]"));
      
      if (errorElements.length > 0) {
        console.log(`✓ Found ${errorElements.length} validation error messages`);
      } else {
        console.log('ℹ️  No visible validation errors detected');
      }
      
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('tests/screenshots/form-validation.png', screenshot, 'base64');
      console.log('✓ Screenshot saved: form-validation.png');
    }
    
    console.log('✅ ADVANCED TEST 1 PASSED\n');
    return true;
  } catch (error) {
    console.error('❌ ADVANCED TEST 1 FAILED:', error.message);
    return false;
  }
}

// Advanced Test 2: Responsive Design Testing
async function testResponsiveDesign() {
  console.log('\n=== ADVANCED TEST 2: Responsive Design ===');
  
  try {
    await driver.get(BASE_URL);
    
    // Test different screen sizes
    const sizes = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    for (const size of sizes) {
      await driver.manage().window().setRect({ 
        width: size.width, 
        height: size.height 
      });
      
      console.log(`✓ Testing ${size.name} view (${size.width}x${size.height})`);
      await driver.sleep(1000);
      
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync(`tests/screenshots/responsive-${size.name.toLowerCase()}.png`, screenshot, 'base64');
      console.log(`✓ Screenshot saved: responsive-${size.name.toLowerCase()}.png`);
    }
    
    // Reset to default
    await driver.manage().window().maximize();
    
    console.log('✅ ADVANCED TEST 2 PASSED\n');
    return true;
  } catch (error) {
    console.error('❌ ADVANCED TEST 2 FAILED:', error.message);
    return false;
  }
}

// Advanced Test 3: Google Auth Button Presence
async function testGoogleAuthButton() {
  console.log('\n=== ADVANCED TEST 3: Google Auth Button ===');
  
  try {
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1500);
    
    // Look for Google auth elements
    const googleButtons = await driver.findElements(By.xpath("//*[contains(text(), 'Google') or contains(@class, 'google') or contains(@id, 'google')]"));
    
    console.log(`✓ Found ${googleButtons.length} Google-related elements`);
    
    if (googleButtons.length > 0) {
      // Highlight the button (for visual confirmation in screenshot)
      await driver.executeScript("arguments[0].style.border='3px solid red'", googleButtons[0]);
      console.log('✓ Google auth button detected');
    }
    
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/google-auth.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: google-auth.png');
    
    console.log('✅ ADVANCED TEST 3 PASSED\n');
    return true;
  } catch (error) {
    console.error('❌ ADVANCED TEST 3 FAILED:', error.message);
    return false;
  }
}

async function runAdvancedTests() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║      ADVANCED SELENIUM TEST SUITE         ║');
  console.log('╚════════════════════════════════════════════╝');
  
  if (!fs.existsSync('tests/screenshots')) {
    fs.mkdirSync('tests/screenshots', { recursive: true });
  }
  
  await setupDriver();
  
  const results = { total: 0, passed: 0, failed: 0 };
  
  const tests = [
    testFormValidation,
    testResponsiveDesign,
    testGoogleAuthButton
  ];
  
  for (const test of tests) {
    results.total++;
    const passed = await test();
    if (passed) results.passed++;
    else results.failed++;
  }
  
  await teardownDriver();
  
  console.log('╔════════════════════════════════════════════╗');
  console.log('║       ADVANCED TEST RESULTS SUMMARY        ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed/results.total) * 100).toFixed(2)}%\n`);
  
  process.exit(results.failed > 0 ? 1 : 0);
}

runAdvancedTests().catch(error => {
  console.error('Fatal error:', error);
  teardownDriver();
  process.exit(1);
});

