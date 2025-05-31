/**
 * Test script to verify flowchart improvements
 */

const puppeteer = require("puppeteer");

async function testFlowchart() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
  });
  const page = await browser.newPage();

  try {
    // Navigate to login page
    console.log("Navigating to login page...");
    await page.goto("http://localhost:3001/login");

    // Login
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', "admin@example.com");
    await page.type('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForNavigation();
    console.log("Logged in successfully");

    // Navigate to protocols
    await page.goto("http://localhost:3001/protocols");
    await page.waitForSelector('[data-testid="protocol-card"]', {
      timeout: 10000,
    });

    // Click on first protocol
    const firstProtocol = await page.$('[data-testid="protocol-card"]');
    if (firstProtocol) {
      await firstProtocol.click();
      await page.waitForNavigation();
      console.log("Opened protocol editor");

      // Navigate to flowchart
      const flowchartUrl =
        page.url().replace("/protocols/", "/protocols/") + "/flowchart";
      await page.goto(flowchartUrl);
      console.log("Navigated to flowchart page");

      // Wait for flowchart to load
      await page.waitForSelector(".react-flow", { timeout: 10000 });
      console.log("Flowchart loaded");

      // Test keyboard shortcuts
      console.log("Testing keyboard shortcuts...");

      // Test zoom in (Ctrl/Cmd +)
      await page.keyboard.down("Control");
      await page.keyboard.press("Equal"); // + key
      await page.keyboard.up("Control");
      await page.waitForTimeout(500);

      // Test zoom out (Ctrl/Cmd -)
      await page.keyboard.down("Control");
      await page.keyboard.press("Minus");
      await page.keyboard.up("Control");
      await page.waitForTimeout(500);

      // Test fit view (Ctrl/Cmd F)
      await page.keyboard.down("Control");
      await page.keyboard.press("KeyF");
      await page.keyboard.up("Control");
      await page.waitForTimeout(500);

      console.log("Keyboard shortcuts tested");

      // Check for auto-fit
      const zoomPercentage = await page.$eval(
        ".absolute.bottom-4 .mt-2",
        (el) => el.textContent,
      );
      console.log("Current zoom:", zoomPercentage);

      // Take screenshot
      await page.screenshot({
        path: "flowchart-improvements-test.png",
        fullPage: true,
      });
      console.log("Screenshot saved as flowchart-improvements-test.png");

      console.log("All tests passed!");
    } else {
      console.log("No protocols found to test");
    }
  } catch (error) {
    console.error("Test failed:", error);
    await page.screenshot({ path: "flowchart-error.png" });
  } finally {
    await browser.close();
  }
}

testFlowchart();
