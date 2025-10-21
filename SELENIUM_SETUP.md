# Selenium Testing Setup Guide

## Prerequisites
- Node.js installed (v16 or higher)
- Google Chrome browser installed
- Your React app should be running on `http://localhost:5173`

## Step 1: Install Selenium WebDriver

```bash
npm install selenium-webdriver --save-dev
```

## Step 2: Install ChromeDriver

### Option A: Automatic Installation (Recommended)
ChromeDriver is now automatically managed by Selenium Manager (comes with selenium-webdriver 4.6+). No manual installation needed!

### Option B: Manual Installation (If needed)

**Windows:**
1. Download ChromeDriver from: https://googlechromelabs.github.io/chrome-for-testing/
2. Extract `chromedriver.exe` to a folder (e.g., `C:\chromedriver\`)
3. Add the folder to your System PATH:
   - Right-click "This PC" → Properties → Advanced system settings
   - Environment Variables → System Variables → Path → Edit
   - Add new entry: `C:\chromedriver\`
   - Restart PowerShell/Terminal

**macOS:**
```bash
brew install chromedriver
```

**Linux:**
```bash
# Download and install
wget https://chromedriver.storage.googleapis.com/LATEST_RELEASE
wget https://chromedriver.storage.googleapis.com/$(cat LATEST_RELEASE)/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
sudo mv chromedriver /usr/local/bin/
sudo chmod +x /usr/local/bin/chromedriver
```

## Step 3: Verify ChromeDriver Installation

```bash
# Should display version number
chromedriver --version
```

## Step 4: Project Structure

Your test structure:
```
frontend/
├── tests/
│   ├── selenium/
│   │   ├── setup.test.js          # Main test suite (4 tests)
│   │   └── advanced-tests.test.js # Advanced tests (3 tests)
│   └── screenshots/               # Auto-generated screenshots
├── package.json
└── SELENIUM_SETUP.md
```

## Step 5: Run Your Tests

### Before Running Tests:
1. Start your development server:
```bash
npm run dev
```

2. In a new terminal, run the tests:

```bash
# Run main test suite (4 core functionality tests)
npm run test:selenium

# Run advanced tests
npm run test:selenium:advanced

# Run all tests
npm run test:all
```

## Core Functionality Tests Included

### Main Test Suite (setup.test.js):
1. **Landing Page Load Test**
   - Verifies the landing page loads correctly
   - Captures page title and content
   - Takes screenshot

2. **Login Page Interaction Test**
   - Navigates to login page
   - Interacts with email and password fields
   - Tests form input functionality

3. **Registration Flow Test**
   - Tests registration navigation
   - Verifies Farmer/Buyer selection options
   - Tests registration form accessibility

4. **Protected Routes Test**
   - Tests dashboard access control
   - Verifies redirect to login for unauthorized access
   - Tests route protection

### Advanced Test Suite (advanced-tests.test.js):
1. **Form Validation Test**
   - Tests client-side validation
   - Checks error message display

2. **Responsive Design Test**
   - Tests Desktop (1920x1080)
   - Tests Tablet (768x1024)
   - Tests Mobile (375x667)

3. **Google Auth Button Test**
   - Verifies Google authentication UI elements

## Test Output

Tests will generate:
- Console output with test results
- Screenshots in `tests/screenshots/` folder:
  - `landing-page.png`
  - `login-page.png`
  - `register-page.png`
  - `farmer-register.png`
  - `protected-route.png`
  - `buyer-protected.png`
  - `form-validation.png`
  - `responsive-desktop.png`
  - `responsive-tablet.png`
  - `responsive-mobile.png`
  - `google-auth.png`

## Troubleshooting

### Issue: ChromeDriver version mismatch
**Solution:** Update Chrome browser or download matching ChromeDriver version from:
https://googlechromelabs.github.io/chrome-for-testing/

### Issue: Connection refused
**Solution:** Ensure your dev server is running on http://localhost:5173

### Issue: Element not found
**Solution:** Increase timeout in tests or check if element selectors match your actual HTML

### Issue: Tests fail on Windows
**Solution:** Make sure ChromeDriver is in PATH and run PowerShell as Administrator

## Customizing Tests

To modify the base URL, edit the `BASE_URL` constant in test files:
```javascript
const BASE_URL = 'http://localhost:5173'; // Change to your URL
```

To adjust timeouts:
```javascript
const TIMEOUT = 10000; // Change timeout in milliseconds
```

## Additional Selenium Commands

### Useful Selenium WebDriver Methods:
```javascript
// Find elements
driver.findElement(By.id('elementId'))
driver.findElement(By.className('className'))
driver.findElement(By.css('css-selector'))
driver.findElement(By.xpath('//xpath'))

// Interact with elements
element.click()
element.sendKeys('text')
element.clear()
element.getText()
element.getAttribute('attribute')

// Navigation
driver.get('url')
driver.navigate().back()
driver.navigate().forward()
driver.navigate().refresh()

// Wait for elements
driver.wait(until.elementLocated(By.id('id')), 10000)
driver.wait(until.elementIsVisible(element), 10000)

// Screenshots
driver.takeScreenshot()

// Execute JavaScript
driver.executeScript('return document.title')
```

## Next Steps

1. Add more test cases specific to your business logic
2. Integrate with CI/CD pipeline
3. Add test reporting (e.g., with Mocha or Jest)
4. Consider adding E2E tests for complete user flows
5. Add data-testid attributes to your components for easier testing

## Resources

- Selenium WebDriver Docs: https://www.selenium.dev/documentation/webdriver/
- Selenium JavaScript API: https://www.selenium.dev/selenium/docs/api/javascript/
- ChromeDriver Downloads: https://googlechromelabs.github.io/chrome-for-testing/

