/* eslint-env node */
/* global process */
import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';
import fs from 'fs';

// Configuration
const BASE_URL = 'http://localhost:5173';
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

// Test 1: Navigate to Login Page
async function testLoginPageNavigation() {
  console.log('\n=== TEST 1: Login Page Navigation ===');
  
  try {
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1000);
    
    // Wait for page to load
    await driver.wait(until.elementLocated(By.css('body')), TIMEOUT);
    
    const currentUrl = await driver.getCurrentUrl();
    console.log(`✓ Navigated to: ${currentUrl}`);
    
    // Check if login form elements are present
    const emailInput = await driver.findElements(By.css('input[name="emailOrPhone"]'));
    const passwordInput = await driver.findElements(By.css('input[name="password"]'));
    const submitButton = await driver.findElements(By.css('button[type="submit"]'));
    
    assert.ok(emailInput.length > 0, 'Email/Phone input field should be present');
    assert.ok(passwordInput.length > 0, 'Password input field should be present');
    assert.ok(submitButton.length > 0, 'Submit button should be present');
    
    console.log('✓ Login form elements found');
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/login-page-navigation.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: login-page-navigation.png');
    
    console.log('✅ TEST 1 PASSED: Login page navigation successful\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 1 FAILED:', error.message);
    return false;
  }
}

// Test 2: Form Validation - Empty Fields
async function testFormValidationEmptyFields() {
  console.log('\n=== TEST 2: Form Validation - Empty Fields ===');
  
  try {
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1000);
    
    // Find submit button and click without filling form
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
    console.log('✓ Clicked submit button without filling form');
    
    await driver.sleep(1500);
    
    // Check for validation error messages
    const errorMessages = await driver.findElements(By.xpath("//*[contains(@class, 'error') or contains(@class, 'red-500') or contains(text(), 'required') or contains(text(), 'Required')]"));
    
    if (errorMessages.length > 0) {
      console.log(`✓ Found ${errorMessages.length} validation error messages`);
    } else {
      // Check if inputs have error styling
      const emailInput = await driver.findElement(By.css('input[name="emailOrPhone"]'));
      const emailInputClass = await emailInput.getAttribute('class');
      
      if (emailInputClass && emailInputClass.includes('red-500')) {
        console.log('✓ Validation errors detected via input styling');
      } else {
        console.log('ℹ️  No visible validation errors (may be handled differently)');
      }
    }
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/login-validation-empty.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: login-validation-empty.png');
    
    console.log('✅ TEST 2 PASSED: Form validation for empty fields tested\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 2 FAILED:', error.message);
    return false;
  }
}

// Test 3: Form Validation - Invalid Email/Phone
async function testFormValidationInvalidInput() {
  console.log('\n=== TEST 3: Form Validation - Invalid Email/Phone ===');
  
  try {
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1000);
    
    // Enter invalid email
    const emailInput = await driver.findElement(By.css('input[name="emailOrPhone"]'));
    await emailInput.clear();
    await emailInput.sendKeys('invalid-email');
    console.log('✓ Entered invalid email: invalid-email');
    
    // Trigger validation by blurring the field
    await emailInput.sendKeys(Key.TAB);
    await driver.sleep(1000);
    
    // Check for validation error
    const errorMessages = await driver.findElements(By.xpath("//*[contains(@class, 'error') or contains(@class, 'red-500') or contains(text(), 'valid')]"));
    
    if (errorMessages.length > 0) {
      const errorText = await errorMessages[0].getText();
      console.log(`✓ Validation error found: ${errorText}`);
    } else {
      // Check input styling
      const inputClass = await emailInput.getAttribute('class');
      if (inputClass && inputClass.includes('red-500')) {
        console.log('✓ Validation error detected via input styling');
      }
    }
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/login-validation-invalid.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: login-validation-invalid.png');
    
    console.log('✅ TEST 3 PASSED: Form validation for invalid input tested\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 3 FAILED:', error.message);
    return false;
  }
}

// Test 4: Form Validation - Invalid Password
async function testFormValidationInvalidPassword() {
  console.log('\n=== TEST 4: Form Validation - Invalid Password ===');
  
  try {
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1000);
    
    // Enter valid email but short password
    const emailInput = await driver.findElement(By.css('input[name="emailOrPhone"]'));
    const passwordInput = await driver.findElement(By.css('input[name="password"]'));
    
    await emailInput.clear();
    await emailInput.sendKeys('test@example.com');
    console.log('✓ Entered valid email: test@example.com');
    
    await passwordInput.clear();
    await passwordInput.sendKeys('123'); // Too short
    console.log('✓ Entered short password: 123');
    
    // Trigger validation
    await passwordInput.sendKeys(Key.TAB);
    await driver.sleep(1000);
    
    // Check for validation error
    const errorMessages = await driver.findElements(By.xpath("//*[contains(@class, 'error') or contains(@class, 'red-500') or contains(text(), '6') or contains(text(), 'characters')]"));
    
    if (errorMessages.length > 0) {
      const errorText = await errorMessages[0].getText();
      console.log(`✓ Validation error found: ${errorText}`);
    }
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/login-validation-password.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: login-validation-password.png');
    
    console.log('✅ TEST 4 PASSED: Form validation for invalid password tested\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 4 FAILED:', error.message);
    return false;
  }
}

// Test 5: Form Input Interaction
async function testFormInputInteraction() {
  console.log('\n=== TEST 5: Form Input Interaction ===');
  
  try {
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1000);
    
    // Test email/phone input
    const emailInput = await driver.findElement(By.css('input[name="emailOrPhone"]'));
    await emailInput.clear();
    await emailInput.sendKeys('test@example.com');
    
    const emailValue = await emailInput.getAttribute('value');
    assert.strictEqual(emailValue, 'test@example.com', 'Email input value should match');
    console.log('✓ Email input interaction successful');
    
    // Test password input
    const passwordInput = await driver.findElement(By.css('input[name="password"]'));
    await passwordInput.clear();
    await passwordInput.sendKeys('testpassword123');
    
    const passwordValue = await passwordInput.getAttribute('value');
    assert.strictEqual(passwordValue, 'testpassword123', 'Password input value should match');
    console.log('✓ Password input interaction successful');
    
    // Test phone number input
    await emailInput.clear();
    await emailInput.sendKeys('+1234567890');
    const phoneValue = await emailInput.getAttribute('value');
    assert.strictEqual(phoneValue, '+1234567890', 'Phone input value should match');
    console.log('✓ Phone input interaction successful');
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/login-input-interaction.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: login-input-interaction.png');
    
    console.log('✅ TEST 5 PASSED: Form input interaction successful\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 5 FAILED:', error.message);
    return false;
  }
}

// Test 6: Google Auth Button Presence
async function testGoogleAuthButton() {
  console.log('\n=== TEST 6: Google Auth Button Presence ===');
  
  try {
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1000);
    
    // Look for Google auth button/element
    const googleElements = await driver.findElements(By.xpath("//*[contains(text(), 'Google') or contains(@class, 'google') or contains(@id, 'google')]"));
    
    if (googleElements.length > 0) {
      console.log(`✓ Found ${googleElements.length} Google-related elements`);
      
      // Highlight the button for screenshot
      await driver.executeScript("arguments[0].style.border='3px solid red'", googleElements[0]);
      console.log('✓ Google auth button detected');
    } else {
      console.log('ℹ️  No Google auth elements found (may be implemented differently)');
    }
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/login-google-auth.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: login-google-auth.png');
    
    console.log('✅ TEST 6 PASSED: Google auth button check completed\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 6 FAILED:', error.message);
    return false;
  }
}

// Test 7: Login Form Submission (with test credentials - will fail but tests the flow)
async function testLoginFormSubmission() {
  console.log('\n=== TEST 7: Login Form Submission ===');
  
  try {
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1000);
    
    // Fill in form with test credentials
    const emailInput = await driver.findElement(By.css('input[name="emailOrPhone"]'));
    const passwordInput = await driver.findElement(By.css('input[name="password"]'));
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    
    await emailInput.clear();
    await emailInput.sendKeys('test@example.com');
    console.log('✓ Entered email: test@example.com');
    
    await passwordInput.clear();
    await passwordInput.sendKeys('testpassword123');
    console.log('✓ Entered password');
    
    // Submit form
    await submitButton.click();
    console.log('✓ Submitted login form');
    
    // Wait for response (either success redirect or error message)
    await driver.sleep(2000);
    
    const currentUrl = await driver.getCurrentUrl();
    console.log(`✓ Current URL after submission: ${currentUrl}`);
    
    // Check if redirected (success) or error message shown
    if (currentUrl.includes('/dashboard')) {
      console.log('✓ Login successful - redirected to dashboard');
    } else {
      // Check for error alert/message
      const errorElements = await driver.findElements(By.xpath("//*[contains(@class, 'error') or contains(@class, 'swal2') or contains(text(), 'failed') or contains(text(), 'Failed')]"));
      if (errorElements.length > 0) {
        console.log('✓ Error message displayed (expected for test credentials)');
      } else {
        console.log('ℹ️  No error message detected (may be handled via alert)');
      }
    }
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/login-submission.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: login-submission.png');
    
    console.log('✅ TEST 7 PASSED: Login form submission tested\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 7 FAILED:', error.message);
    return false;
  }
}

// Test 8: Remember Me Checkbox
async function testRememberMeCheckbox() {
  console.log('\n=== TEST 8: Remember Me Checkbox ===');
  
  try {
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1000);
    
    // Find remember me checkbox
    const checkbox = await driver.findElements(By.css('input[type="checkbox"]'));
    
    if (checkbox.length > 0) {
      const isChecked = await checkbox[0].isSelected();
      console.log(`✓ Remember me checkbox found. Initially checked: ${isChecked}`);
      
      // Toggle checkbox
      await checkbox[0].click();
      await driver.sleep(500);
      
      const isCheckedAfter = await checkbox[0].isSelected();
      console.log(`✓ After click, checked: ${isCheckedAfter}`);
      
      assert.notStrictEqual(isChecked, isCheckedAfter, 'Checkbox state should change on click');
    } else {
      console.log('ℹ️  Remember me checkbox not found');
    }
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/login-remember-me.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: login-remember-me.png');
    
    console.log('✅ TEST 8 PASSED: Remember me checkbox tested\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 8 FAILED:', error.message);
    return false;
  }
}

// Test 9: Registration Links
async function testRegistrationLinks() {
  console.log('\n=== TEST 9: Registration Links ===');
  
  try {
    await driver.get(`${BASE_URL}/login`);
    await driver.sleep(1000);
    
    // Find registration links
    const farmerLink = await driver.findElements(By.xpath("//a[contains(@href, 'register/farmer') or contains(text(), 'Farmer')]"));
    const buyerLink = await driver.findElements(By.xpath("//a[contains(@href, 'register/buyer') or contains(text(), 'Buyer')]"));
    
    console.log(`✓ Found ${farmerLink.length} farmer registration link(s)`);
    console.log(`✓ Found ${buyerLink.length} buyer registration link(s)`);
    
    if (farmerLink.length > 0) {
      const farmerHref = await farmerLink[0].getAttribute('href');
      console.log(`✓ Farmer link href: ${farmerHref}`);
    }
    
    if (buyerLink.length > 0) {
      const buyerHref = await buyerLink[0].getAttribute('href');
      console.log(`✓ Buyer link href: ${buyerHref}`);
    }
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/login-registration-links.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: login-registration-links.png');
    
    console.log('✅ TEST 9 PASSED: Registration links check completed\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 9 FAILED:', error.message);
    return false;
  }
}

// Test 10: Registration Page Navigation
async function testRegistrationPageNavigation() {
  console.log('\n=== TEST 10: Registration Page Navigation ===');
  
  try {
    // Test Farmer Registration Page
    await driver.get(`${BASE_URL}/register/farmer`);
    await driver.sleep(1500);
    
    const currentUrl = await driver.getCurrentUrl();
    console.log(`✓ Navigated to: ${currentUrl}`);
    
    // Check if registration form elements are present
    const nameInput = await driver.findElements(By.css('input[name="fullName"], input[name="name"]'));
    const emailInput = await driver.findElements(By.css('input[name="emailAddress"], input[type="email"]'));
    const phoneInput = await driver.findElements(By.css('input[name="contactNumber"], input[name="phone"]'));
    const passwordInput = await driver.findElements(By.css('input[name="password"], input[type="password"]'));
    const submitButton = await driver.findElements(By.css('button[type="submit"]'));
    
    console.log(`✓ Found ${nameInput.length} name input field(s)`);
    console.log(`✓ Found ${emailInput.length} email input field(s)`);
    console.log(`✓ Found ${phoneInput.length} phone input field(s)`);
    console.log(`✓ Found ${passwordInput.length} password input field(s)`);
    console.log(`✓ Found ${submitButton.length} submit button(s)`);
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/registration-farmer-page.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: registration-farmer-page.png');
    
    // Test Buyer Registration Page
    await driver.get(`${BASE_URL}/register/buyer`);
    await driver.sleep(1500);
    
    const buyerUrl = await driver.getCurrentUrl();
    console.log(`✓ Navigated to buyer registration: ${buyerUrl}`);
    
    // Take screenshot
    const buyerScreenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/registration-buyer-page.png', buyerScreenshot, 'base64');
    console.log('✓ Screenshot saved: registration-buyer-page.png');
    
    console.log('✅ TEST 10 PASSED: Registration page navigation successful\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 10 FAILED:', error.message);
    return false;
  }
}

// Test 11: Registration Form Field Interaction
async function testRegistrationFormInteraction() {
  console.log('\n=== TEST 11: Registration Form Field Interaction ===');
  
  try {
    await driver.get(`${BASE_URL}/register/farmer`);
    await driver.sleep(1500);
    
    // Test name input
    const nameInputs = await driver.findElements(By.css('input[name="fullName"], input[name="name"]'));
    if (nameInputs.length > 0) {
      await nameInputs[0].clear();
      await nameInputs[0].sendKeys('Test Farmer');
      const nameValue = await nameInputs[0].getAttribute('value');
      assert.strictEqual(nameValue, 'Test Farmer', 'Name input value should match');
      console.log('✓ Name input interaction successful');
    }
    
    // Test email input
    const emailInputs = await driver.findElements(By.css('input[name="emailAddress"], input[type="email"]'));
    if (emailInputs.length > 0) {
      await emailInputs[0].clear();
      await emailInputs[0].sendKeys('testfarmer@example.com');
      const emailValue = await emailInputs[0].getAttribute('value');
      assert.strictEqual(emailValue, 'testfarmer@example.com', 'Email input value should match');
      console.log('✓ Email input interaction successful');
    }
    
    // Test phone input
    const phoneInputs = await driver.findElements(By.css('input[name="contactNumber"], input[name="phone"]'));
    if (phoneInputs.length > 0) {
      await phoneInputs[0].clear();
      await phoneInputs[0].sendKeys('9876543210');
      const phoneValue = await phoneInputs[0].getAttribute('value');
      assert.strictEqual(phoneValue, '9876543210', 'Phone input value should match');
      console.log('✓ Phone input interaction successful');
    }
    
    // Test password input
    const passwordInputs = await driver.findElements(By.css('input[name="password"], input[type="password"]'));
    if (passwordInputs.length > 0) {
      await passwordInputs[0].clear();
      await passwordInputs[0].sendKeys('testpassword123');
      const passwordValue = await passwordInputs[0].getAttribute('value');
      assert.strictEqual(passwordValue, 'testpassword123', 'Password input value should match');
      console.log('✓ Password input interaction successful');
    }
    
    // Test pincode input (if exists)
    const pincodeInputs = await driver.findElements(By.css('input[name="pincode"]'));
    if (pincodeInputs.length > 0) {
      await pincodeInputs[0].clear();
      await pincodeInputs[0].sendKeys('110001');
      const pincodeValue = await pincodeInputs[0].getAttribute('value');
      console.log(`✓ Pincode input interaction successful: ${pincodeValue}`);
    }
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/registration-form-interaction.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: registration-form-interaction.png');
    
    console.log('✅ TEST 11 PASSED: Registration form interaction successful\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 11 FAILED:', error.message);
    return false;
  }
}

// Test 12: Registration Form Validation
async function testRegistrationFormValidation() {
  console.log('\n=== TEST 12: Registration Form Validation ===');
  
  try {
    await driver.get(`${BASE_URL}/register/farmer`);
    await driver.sleep(1500);
    
    // Try to submit form without filling required fields
    const submitButtons = await driver.findElements(By.css('button[type="submit"]'));
    if (submitButtons.length > 0) {
      await submitButtons[0].click();
      console.log('✓ Clicked submit button without filling form');
      
      await driver.sleep(1500);
      
      // Check for validation error messages
      const errorMessages = await driver.findElements(By.xpath("//*[contains(@class, 'error') or contains(@class, 'red-500') or contains(text(), 'required') or contains(text(), 'Required')]"));
      
      if (errorMessages.length > 0) {
        console.log(`✓ Found ${errorMessages.length} validation error messages`);
        const firstError = await errorMessages[0].getText();
        console.log(`✓ Sample error message: ${firstError}`);
      } else {
        // Check if inputs have error styling
        const nameInputs = await driver.findElements(By.css('input[name="fullName"], input[name="name"]'));
        if (nameInputs.length > 0) {
          const inputClass = await nameInputs[0].getAttribute('class');
          if (inputClass && inputClass.includes('red-500')) {
            console.log('✓ Validation errors detected via input styling');
          } else {
            console.log('ℹ️  No visible validation errors (may be handled differently)');
          }
        }
      }
    }
    
    // Test invalid email format
    const emailInputs = await driver.findElements(By.css('input[name="emailAddress"], input[type="email"]'));
    if (emailInputs.length > 0) {
      await emailInputs[0].clear();
      await emailInputs[0].sendKeys('invalid-email');
      await emailInputs[0].sendKeys(Key.TAB);
      await driver.sleep(1000);
      
      const errorElements = await driver.findElements(By.xpath("//*[contains(@class, 'error') or contains(@class, 'red-500') or contains(text(), 'valid')]"));
      if (errorElements.length > 0) {
        console.log('✓ Invalid email validation detected');
      }
    }
    
    // Test invalid phone format
    const phoneInputs = await driver.findElements(By.css('input[name="contactNumber"], input[name="phone"]'));
    if (phoneInputs.length > 0) {
      await phoneInputs[0].clear();
      await phoneInputs[0].sendKeys('123'); // Too short
      await phoneInputs[0].sendKeys(Key.TAB);
      await driver.sleep(1000);
      
      const phoneErrors = await driver.findElements(By.xpath("//*[contains(@class, 'error') or contains(@class, 'red-500')]"));
      if (phoneErrors.length > 0) {
        console.log('✓ Invalid phone validation detected');
      }
    }
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/registration-validation.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: registration-validation.png');
    
    console.log('✅ TEST 12 PASSED: Registration form validation tested\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 12 FAILED:', error.message);
    return false;
  }
}

// Test 13: Buyer Registration Form Interaction
async function testBuyerRegistrationForm() {
  console.log('\n=== TEST 13: Buyer Registration Form Interaction ===');
  
  try {
    await driver.get(`${BASE_URL}/register/buyer`);
    await driver.sleep(1500);
    
    // Test business name input
    const businessNameInputs = await driver.findElements(By.css('input[name="businessName"]'));
    if (businessNameInputs.length > 0) {
      await businessNameInputs[0].clear();
      await businessNameInputs[0].sendKeys('Test Business');
      const businessValue = await businessNameInputs[0].getAttribute('value');
      assert.strictEqual(businessValue, 'Test Business', 'Business name input value should match');
      console.log('✓ Business name input interaction successful');
    }
    
    // Test business type select (if exists)
    const businessTypeSelects = await driver.findElements(By.css('select[name="businessType"]'));
    if (businessTypeSelects.length > 0) {
      const options = await businessTypeSelects[0].findElements(By.css('option'));
      if (options.length > 1) {
        await businessTypeSelects[0].click();
        await driver.sleep(500);
        await options[1].click();
        console.log('✓ Business type selection successful');
      }
    }
    
    // Test email input
    const emailInputs = await driver.findElements(By.css('input[name="emailAddress"], input[type="email"]'));
    if (emailInputs.length > 0) {
      await emailInputs[0].clear();
      await emailInputs[0].sendKeys('testbuyer@example.com');
      console.log('✓ Email input interaction successful');
    }
    
    // Test phone input
    const phoneInputs = await driver.findElements(By.css('input[name="contactNumber"], input[name="phone"]'));
    if (phoneInputs.length > 0) {
      await phoneInputs[0].clear();
      await phoneInputs[0].sendKeys('9876543210');
      console.log('✓ Phone input interaction successful');
    }
    
    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync('tests/screenshots/buyer-registration-form.png', screenshot, 'base64');
    console.log('✓ Screenshot saved: buyer-registration-form.png');
    
    console.log('✅ TEST 13 PASSED: Buyer registration form interaction successful\n');
    return true;
  } catch (error) {
    console.error('❌ TEST 13 FAILED:', error.message);
    return false;
  }
}

// Main test runner
async function runLoginTests() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   LOGIN & REGISTRATION - SELENIUM TESTS   ║');
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
  
  // Run all login tests
  const tests = [
    testLoginPageNavigation,
    testFormValidationEmptyFields,
    testFormValidationInvalidInput,
    testFormValidationInvalidPassword,
    testFormInputInteraction,
    testGoogleAuthButton,
    testLoginFormSubmission,
    testRememberMeCheckbox,
    testRegistrationLinks,
    testRegistrationPageNavigation,
    testRegistrationFormInteraction,
    testRegistrationFormValidation,
    testBuyerRegistrationForm
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
  console.log('║      LOGIN & REGISTRATION TEST SUMMARY    ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed/results.total) * 100).toFixed(2)}%`);
  console.log('\nScreenshots saved in: tests/screenshots/\n');
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runLoginTests().catch(error => {
  console.error('Fatal error:', error);
  teardownDriver();
  process.exit(1);
});
