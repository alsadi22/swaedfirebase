const puppeteer = require('puppeteer');

async function testAdminLoginForm() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable request interception to monitor network requests
  await page.setRequestInterception(true);
  
  const requests = [];
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData()
    });
    request.continue();
  });
  
  const responses = [];
  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status(),
      headers: response.headers()
    });
  });
  
  try {
    console.log('Navigating to admin login page...');
    await page.goto('https://swaeduae.ae/auth/admin/login', { waitUntil: 'networkidle2' });
    
    console.log('Filling login form...');
    await page.type('input[name="email"]', 'admin@swaeduae.ae');
    await page.type('input[name="password"]', 'admin123');
    
    console.log('Submitting form...');
    await page.click('button[type="submit"]');
    
    // Wait for potential redirect or response
    await page.waitForTimeout(3000);
    
    console.log('\n=== NETWORK REQUESTS ===');
    requests.forEach((req, index) => {
      if (req.url.includes('/api/admin/auth') || req.url.includes('login')) {
        console.log(`Request ${index + 1}:`);
        console.log(`  URL: ${req.url}`);
        console.log(`  Method: ${req.method}`);
        console.log(`  Post Data: ${req.postData}`);
      }
    });
    
    console.log('\n=== NETWORK RESPONSES ===');
    responses.forEach((res, index) => {
      if (res.url.includes('/api/admin/auth') || res.url.includes('login')) {
        console.log(`Response ${index + 1}:`);
        console.log(`  URL: ${res.url}`);
        console.log(`  Status: ${res.status}`);
        console.log(`  Headers: ${JSON.stringify(res.headers, null, 2)}`);
      }
    });
    
    console.log('\n=== CURRENT URL ===');
    console.log(page.url());
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testAdminLoginForm();
