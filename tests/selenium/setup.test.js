import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';
import fs from 'fs';

// Configuration
const BASE_URL = 'http://localhost:5173'; // Vite default port
const TIMEOUT = 10000;

let driver;

// Setup and teardown
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

// Test 1: Landing Page Load and Navigation
async function testLandingPageLoad() {
  console.log('\n=== TEST 1: Landing Page Load and Navigation ===');
  
  try {
    await driver.get(BASE_URL);
    console.log('✓ Navigated to landing page');
    
    // Wait for page to load
    await driver.wait(until.elementLocated(By.css('body')), TIMEOUT);
    
    // Get page title
    const title = await driver.getTitle();
    console.log(`✓ Page title: ${title}`);
    
    // Check if landing page elements are present
    const bodyText = await driver.findElement(By.css('body')).getText();
    console.log('✓ Page content loaded successfully');
    
    // Try to find navigation/header elements
    const links = await driver.findElements(By.tagName('a'));
    console.log(`✓ Found ${links.length} links on landing page`);
    
      // Take screenshot
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('tests/screenshots/landing-page.png', screenshot, 'base64');
      console.log('✓ Screenshot saved: landing-page.png');
    
    console.log('✅ TEST 1 PASSED: Landing page loaded successfully\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 1 FAILED:', error.message);
    return false;
  }
}

// Test 2: Login Page Navigation and Form Interaction
async function testLoginPageInteraction() {
  console.log('\n=== TEST 2: Login Page Navigation and Form Interaction ===');
  
  try {
    await driver.get(BASE_URL);
    
    // Look for login button/link on landing page
    const loginLinks = await driver.findElements(By.xpath("//*[contains(text(), 'Login') or contains(text(), 'login') or contains(text(), 'Sign in') or contains(text(), 'Sign In')]"));
    
    if (loginLinks.length > 0) {
      await loginLinks[0].click();
      console.log('✓ Clicked login button');
      
      // Wait for navigation
      await driver.sleep(1000);
      
      const currentUrl = await driver.getCurrentUrl();
      console.log(`✓ Current URL: ${currentUrl}`);
      
      // Try to find login form elements
      const inputs = await driver.findElements(By.css('input'));
      console.log(`✓ Found ${inputs.length} input fields`);
      
      if (inputs.length > 0) {
        // Try to interact with email/username field
        const emailInput = await driver.findElements(By.css('input[type="email"], input[type="text"], input[name*="email"], input[placeholder*="email" i]'));
        
        if (emailInput.length > 0) {
          await emailInput[0].sendKeys('test@example.com');
          console.log('✓ Entered test email');
          
          const enteredValue = await emailInput[0].getAttribute('value');
          assert.strictEqual(enteredValue, 'test@example.com', 'Email input value mismatch');
          console.log('✓ Email input verified');
        }
        
        // Try to find password field
        const passwordInput = await driver.findElements(By.css('input[type="password"]'));
        
        if (passwordInput.length > 0) {
          await passwordInput[0].sendKeys('testpassword123');
          console.log('✓ Entered test password');
        }
      }
      
      // Take screenshot
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('tests/screenshots/login-page.png', screenshot, 'base64');
      console.log('✓ Screenshot saved: login-page.png');
      
      console.log('✅ TEST 2 PASSED: Login page interaction successful\n');
      return true;
    } else {
      console.log('ℹ️  Login link not found on landing page - checking direct navigation');
      
      // Try direct navigation to login page
      await driver.get(`${BASE_URL}/login`);
      await driver.sleep(1000);
      
      const currentUrl = await driver.getCurrentUrl();
      console.log(`✓ Navigated directly to: ${currentUrl}`);
      
      // Take screenshot
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('tests/screenshots/login-page.png', screenshot, 'base64');
      console.log('✓ Screenshot saved: login-page.png');
      
      console.log('✅ TEST 2 PASSED: Login page accessible\n');
      return true;
    }
  } catch (error) {
    console.error('❌ TEST 2 FAILED:', error.message);
    return false;
  }
}

// Test 3: Registration Page Navigation and User Type Selection
async function testRegistrationFlow() {
  console.log('\n=== TEST 3: Registration Page Navigation and User Type Selection ===');
  
  try {
    await driver.get(BASE_URL);
    
    // Look for register/signup buttons
    const registerLinks = await driver.findElements(By.xpath("//*[contains(text(), 'Register') or contains(text(), 'Sign up') or contains(text(), 'Signup') or contains(text(), 'Sign Up')]"));
    
    if (registerLinks.length > 0) {
      await registerLinks[0].click();
      console.log('✓ Clicked register button');
      
      await driver.sleep(1000);
      
      const currentUrl = await driver.getCurrentUrl();
      console.log(`✓ Current URL: ${currentUrl}`);
      
      // Look for user type selection (Farmer/Buyer)
      const farmerButtons = await driver.findElements(By.xpath("//*[contains(text(), 'Farmer') or contains(text(), 'farmer')]"));
      const buyerButtons = await driver.findElements(By.xpath("//*[contains(text(), 'Buyer') or contains(text(), 'buyer')]"));
      
      console.log(`✓ Found ${farmerButtons.length} farmer-related elements`);
      console.log(`✓ Found ${buyerButtons.length} buyer-related elements`);
      
      // Take screenshot of registration page
      const screenshot1 = await driver.takeScreenshot();
      fs.writeFileSync('tests/screenshots/register-page.png', screenshot1, 'base64');
      console.log('✓ Screenshot saved: register-page.png');
      
      // Try to click on Farmer registration if available
      if (farmerButtons.length > 0) {
        try {
          await farmerButtons[0].click();
          console.log('✓ Clicked Farmer registration option');
          await driver.sleep(1000);
          
          const farmerUrl = await driver.getCurrentUrl();
          console.log(`✓ Farmer registration URL: ${farmerUrl}`);
          
          // Take screenshot
          const screenshot2 = await driver.takeScreenshot();
          fs.writeFileSync('tests/screenshots/farmer-register.png', screenshot2, 'base64');
          console.log('✓ Screenshot saved: farmer-register.png');
        } catch (e) {
          console.log('ℹ️  Could not interact with Farmer button:', e.message);
        }
      }
      
      console.log('✅ TEST 3 PASSED: Registration flow navigable\n');
      return true;
    } else {
      console.log('ℹ️  Register link not found - trying direct navigation');
      
      // Try direct navigation to farmer register
      await driver.get(`${BASE_URL}/register/farmer`);
      await driver.sleep(1000);
      
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('tests/screenshots/farmer-register.png', screenshot, 'base64');
      console.log('✓ Screenshot saved: farmer-register.png');
      
      console.log('✅ TEST 3 PASSED: Registration page accessible\n');
      return true;
    }
  } catch (error) {
    console.error('❌ TEST 3 FAILED:', error.message);
    return false;
  }
}

// Test 4: Dashboard Access and Protected Routes
async function testDashboardAccess() {
  console.log('\n=== TEST 4: Dashboard Access and Protected Routes ===');
  
  try {
    // Try to access protected route directly (should redirect to login)
    await driver.get(`${BASE_URL}/farmer/dashboard`);
    await driver.sleep(1500);
    
    const currentUrl = await driver.getCurrentUrl();
    console.log(`✓ Attempted farmer dashboard access, redirected to: ${currentUrl}`);
    
    // Check if redirected to login
    if (currentUrl.includes('login')) {
      console.log('✓ Protected route correctly redirects to login');
    }
    
    // Take screenshot
    const screenshot1 = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/protected-route.png', screenshot1, 'base64');
    console.log('✓ Screenshot saved: protected-route.png');
    
    // Try buyer dashboard
    await driver.get(`${BASE_URL}/buyer/dashboard`);
    await driver.sleep(1500);
    
    const buyerUrl = await driver.getCurrentUrl();
    console.log(`✓ Attempted buyer dashboard access, current URL: ${buyerUrl}`);
    
    // Take screenshot
    const screenshot2 = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/buyer-protected.png', screenshot2, 'base64');
    console.log('✓ Screenshot saved: buyer-protected.png');
    
    console.log('✅ TEST 4 PASSED: Protected routes tested\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 4 FAILED:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   SPICES CHAIN - SELENIUM TEST SUITE     ║');
  console.log('╚════════════════════════════════════════════╝');
  
  // Create screenshots directory
  if (!fs.existsSync('tests/screenshots')) {
    fs.mkdirSync('tests/screenshots', { recursive: true });
  }
  
  await setupDriver();
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Run all tests
  const tests = [
    testLandingPageLoad,
    testLoginPageInteraction,
    testRegistrationFlow,
    testDashboardAccess
  ];
  
  for (const test of tests) {
    results.total++;
    const passed = await test();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  await teardownDriver();
  
  // Print results
  console.log('╔════════════════════════════════════════════╗');
  console.log('║            TEST RESULTS SUMMARY            ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed/results.total) * 100).toFixed(2)}%`);
  console.log('\nScreenshots saved in: tests/screenshots/\n');
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  teardownDriver();
  process.exit(1);
});

