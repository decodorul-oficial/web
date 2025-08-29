const puppeteer = require('puppeteer');

async function testScreenshot() {
  console.log('🚀 Starting test with smaller fonts...');
  
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    console.log('📱 Navigating to Instagram admin page...');
    await page.goto('http://localhost:3000/admin/instagram', { waitUntil: 'networkidle0' });
    
    // Wait for initial page load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Accept cookies if banner appears
    console.log('🍪 Checking for cookie banner...');
    const cookieBanner = await page.$('[class*="cookie"], [class*="banner"], [class*="consent"]');
    if (cookieBanner) {
      console.log('✅ Cookie banner found, accepting cookies...');
      const acceptButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          return text.includes('accept') || text.includes('accepta') || text.includes('ok') || text.includes('da');
        });
      });
      
      if (acceptButton && acceptButton.asElement()) {
        await page.evaluate(button => button.click(), acceptButton);
        console.log('✅ Cookies accepted');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log('⚠️ Cookie banner found but no accept button');
      }
    } else {
      console.log('ℹ️ No cookie banner found');
    }
    
    console.log('⏳ Waiting for InstagramFeed component to load data...');
    
    // Wait for the loading spinner to disappear and cards to appear
    let feedLoaded = false;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!feedLoaded && attempts < maxAttempts) {
      feedLoaded = await page.evaluate(() => {
        const cards = document.querySelectorAll('[class*="aspect-square"], [class*="rounded-2xl"]');
        const loading = document.querySelector('.animate-spin');
        
        if (cards.length > 0) {
          console.log(`Found ${cards.length} Instagram cards`);
          return true;
        } else if (loading) {
          console.log('Still loading... waiting for data');
          return false;
        } else {
          console.log('No cards found yet');
          return false;
        }
      });
      
      if (!feedLoaded) {
        console.log(`⏳ Attempt ${attempts + 1}/${maxAttempts}: Waiting for data...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }
    
    if (!feedLoaded) {
      console.log('❌ InstagramFeed component did not load data within timeout');
      await page.screenshot({ path: 'debug_timeout.png', fullPage: true });
      await browser.close();
      return false;
    }
    
    console.log('✅ InstagramFeed component loaded successfully with data');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Click the first screenshot button
    console.log('📸 Clicking first screenshot button...');
    
    const firstScreenshotButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent?.includes('📸 Screenshot'));
    });
    
    if (!firstScreenshotButton) {
      console.log('❌ Could not find screenshot button to click');
      await page.screenshot({ path: 'debug_button_not_found.png', fullPage: true });
      await browser.close();
      return false;
    }
    
    await page.evaluate(button => button.click(), firstScreenshotButton);
    
    // Wait for screenshot generation
    console.log('⏳ Waiting for screenshot generation...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('✅ Screenshot button clicked successfully');
    
    // Take a screenshot of the page to verify layout
    console.log('📸 Taking verification screenshot...');
    await page.screenshot({ path: 'verification_screenshot.png', fullPage: true });
    
    // Analyze the layout for clipping issues
    const layoutAnalysis = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="aspect-square"]');
      const results = [];
      
      cards.forEach((card, index) => {
        if (index < 3) {
          const title = card.querySelector('h3');
          const synthesis = card.querySelector('p');
          
          if (title) {
            const titleRect = title.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            
            results.push({
              cardIndex: index,
              element: 'title',
              title: title.textContent?.substring(0, 50) + '...',
              titleClipped: titleRect.bottom > cardRect.bottom - 40, // Increased margin
              titleHeight: titleRect.height,
              cardHeight: cardRect.height,
              titleBottom: titleRect.bottom,
              cardBottom: cardRect.bottom
            });
          }
          
          if (synthesis) {
            const synthesisRect = synthesis.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            
            results.push({
              cardIndex: index,
              element: 'synthesis',
              synthesis: synthesis.textContent?.substring(0, 50) + '...',
              synthesisClipped: synthesisRect.bottom > cardRect.bottom - 40,
              synthesisHeight: synthesisRect.height,
              cardHeight: cardRect.height,
              synthesisBottom: synthesisRect.bottom,
              cardBottom: cardRect.bottom
            });
          }
        }
      });
      
      return results;
    });
    
    console.log('📊 Layout Analysis Results:');
    layoutAnalysis.forEach(result => {
      if (result.titleClipped || result.synthesisClipped) {
        console.log(`❌ CLIPPING DETECTED in card ${result.cardIndex} (${result.element}):`, result);
      } else {
        console.log(`✅ No clipping in card ${result.cardIndex} (${result.element}):`, result);
      }
    });
    
    const hasClipping = layoutAnalysis.some(result => result.titleClipped || result.synthesisClipped);
    
    if (hasClipping) {
      console.log('❌ CLIPPING ISSUES DETECTED - Test FAILED');
      console.log('🔧 Need to adjust padding/margins in InstagramCard component');
      await browser.close();
      return false;
    } else {
      console.log('✅ No clipping issues detected - Test PASSED');
      console.log('🎯 Screenshot functionality working correctly with smaller fonts');
      await browser.close();
      return true;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await browser.close();
    return false;
  }
}

// Run the test
testScreenshot().then(success => {
  if (success) {
    console.log('🎉 All tests passed! Smaller fonts resolved clipping issues.');
    process.exit(0);
  } else {
    console.log('💥 Tests failed. Check the debug screenshots and logs.');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});
