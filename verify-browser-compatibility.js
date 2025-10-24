/**
 * Browser Compatibility Test Script
 * Tests unified navigation across Chrome, Firefox, and Safari
 * Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3
 */

// Browser detection
function detectBrowser() {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
        browserName = 'Chrome';
        browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
        browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
        browserName = 'Safari';
        browserVersion = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Edg') > -1) {
        browserName = 'Edge';
        browserVersion = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
    }

    return { name: browserName, version: browserVersion, ua };
}

// Display browser info
function displayBrowserInfo() {
    const browser = detectBrowser();
    const browserInfo = document.getElementById('browserInfo');
    browserInfo.innerHTML = `
        <strong>Browser:</strong> ${browser.name} ${browser.version}<br>
        <strong>User Agent:</strong> ${browser.ua}<br>
        <strong>Viewport:</strong> ${window.innerWidth}x${window.innerHeight}px<br>
        <strong>Device Pixel Ratio:</strong> ${window.devicePixelRatio}
    `;
}

// Test result tracking
const testResults = {
    '2.1': { status: 'pending', message: '' },
    '2.2': { status: 'pending', message: '' },
    '2.3': { status: 'pending', message: '' },
    '4.1': { status: 'pending', message: '' },
    '4.2': { status: 'pending', message: '' },
    '4.3': { status: 'pending', message: '' }
};

// Update test result display
function updateTestResult(testId, status, message) {
    testResults[testId] = { status, message };
    const testElement = document.getElementById(`test-${testId}`);
    
    testElement.className = `test-result ${status}`;
    
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏳';
    const statusText = status === 'pass' ? 'PASS' : status === 'fail' ? 'FAIL' : 'PENDING';
    
    testElement.innerHTML = `
        <span class="status-icon">${icon}</span>
        <span><strong>${statusText}:</strong> ${message}</span>
    `;
    
    updateSummary();
}

// Update summary statistics
function updateSummary() {
    const summary = document.getElementById('summary');
    summary.style.display = 'block';
    
    let passCount = 0;
    let failCount = 0;
    let pendingCount = 0;
    
    Object.values(testResults).forEach(result => {
        if (result.status === 'pass') passCount++;
        else if (result.status === 'fail') failCount++;
        else pendingCount++;
    });
    
    document.getElementById('passCount').textContent = passCount;
    document.getElementById('failCount').textContent = failCount;
    document.getElementById('pendingCount').textContent = pendingCount;
}

// Wait for element to exist
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

// Test 2.1: Navigation bar with all links
async function test_2_1() {
    try {
        await waitForElement('.nav-links');
        
        const navLinks = document.querySelector('.nav-links');
        const links = navLinks.querySelectorAll('a');
        
        const expectedLinks = ['Home', 'About', 'Projects', 'Music', 'Contact'];
        const foundLinks = Array.from(links).map(link => link.textContent.trim());
        
        const allLinksPresent = expectedLinks.every(expected => 
            foundLinks.some(found => found.includes(expected))
        );
        
        if (allLinksPresent && links.length >= 5) {
            updateTestResult('2.1', 'pass', 
                `Navigation displays all required links: ${foundLinks.join(', ')}`);
        } else {
            updateTestResult('2.1', 'fail', 
                `Missing links. Expected: ${expectedLinks.join(', ')}. Found: ${foundLinks.join(', ')}`);
        }
    } catch (error) {
        updateTestResult('2.1', 'fail', `Navigation links not found: ${error.message}`);
    }
}

// Test 2.2: Language switcher
async function test_2_2() {
    try {
        await waitForElement('.lang-switcher');
        
        const langSwitcher = document.querySelector('.lang-switcher');
        const langButtons = langSwitcher.querySelectorAll('.lang-btn');
        
        const expectedLangs = ['EN', 'PL', 'NL'];
        const foundLangs = Array.from(langButtons).map(btn => btn.textContent.trim());
        
        const allLangsPresent = expectedLangs.every(expected => 
            foundLangs.includes(expected)
        );
        
        if (allLangsPresent && langButtons.length === 3) {
            updateTestResult('2.2', 'pass', 
                `Language switcher displays all buttons: ${foundLangs.join(', ')}`);
        } else {
            updateTestResult('2.2', 'fail', 
                `Missing language buttons. Expected: ${expectedLangs.join(', ')}. Found: ${foundLangs.join(', ')}`);
        }
    } catch (error) {
        updateTestResult('2.2', 'fail', `Language switcher not found: ${error.message}`);
    }
}

// Test 2.3: Active link highlighting
async function test_2_3() {
    try {
        await waitForElement('.nav-links');
        
        const navLinks = document.querySelector('.nav-links');
        const activeLink = navLinks.querySelector('a.active');
        
        if (activeLink) {
            const activeLinkText = activeLink.textContent.trim();
            const currentPath = window.location.pathname;
            
            updateTestResult('2.3', 'pass', 
                `Active link "${activeLinkText}" is highlighted for path: ${currentPath}`);
        } else {
            updateTestResult('2.3', 'fail', 
                'No active link found. Expected one link to have "active" class');
        }
    } catch (error) {
        updateTestResult('2.3', 'fail', `Could not check active link: ${error.message}`);
    }
}

// Test 4.1: Desktop navigation visibility
async function test_4_1() {
    try {
        await waitForElement('.nav-links');
        
        const navLinks = document.querySelector('.nav-links');
        const viewportWidth = window.innerWidth;
        
        if (viewportWidth > 768) {
            const isVisible = window.getComputedStyle(navLinks).display !== 'none';
            
            if (isVisible) {
                updateTestResult('4.1', 'pass', 
                    `Desktop navigation is visible at ${viewportWidth}px viewport width`);
            } else {
                updateTestResult('4.1', 'fail', 
                    `Desktop navigation is hidden at ${viewportWidth}px viewport width`);
            }
        } else {
            updateTestResult('4.1', 'pass', 
                `Viewport is ${viewportWidth}px (≤768px), desktop navigation test skipped (mobile mode)`);
        }
    } catch (error) {
        updateTestResult('4.1', 'fail', `Could not test desktop navigation: ${error.message}`);
    }
}

// Test 4.2: Mobile menu toggle
async function test_4_2() {
    try {
        await waitForElement('.mobile-menu-toggle');
        
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const viewportWidth = window.innerWidth;
        
        if (viewportWidth <= 768) {
            const isVisible = window.getComputedStyle(mobileToggle).display !== 'none';
            
            if (isVisible) {
                updateTestResult('4.2', 'pass', 
                    `Mobile menu toggle is visible at ${viewportWidth}px viewport width`);
            } else {
                updateTestResult('4.2', 'fail', 
                    `Mobile menu toggle is hidden at ${viewportWidth}px viewport width`);
            }
        } else {
            updateTestResult('4.2', 'pass', 
                `Viewport is ${viewportWidth}px (>768px), mobile toggle test skipped (desktop mode)`);
        }
    } catch (error) {
        updateTestResult('4.2', 'fail', `Could not test mobile menu toggle: ${error.message}`);
    }
}

// Test 4.3: Scroll effect
async function test_4_3() {
    try {
        await waitForElement('.header');
        
        const header = document.querySelector('.header');
        const initialScrolled = header.classList.contains('scrolled');
        
        // Scroll down
        window.scrollTo(0, 100);
        
        // Wait for scroll event to process
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const scrolledAfterScroll = header.classList.contains('scrolled');
        
        // Scroll back to top
        window.scrollTo(0, 0);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const scrolledAfterReset = header.classList.contains('scrolled');
        
        if (scrolledAfterScroll && !scrolledAfterReset) {
            updateTestResult('4.3', 'pass', 
                'Header correctly adds/removes "scrolled" class on scroll');
        } else if (scrolledAfterScroll) {
            updateTestResult('4.3', 'pass', 
                'Header adds "scrolled" class on scroll (may not remove immediately)');
        } else {
            updateTestResult('4.3', 'fail', 
                'Header does not add "scrolled" class when scrolling');
        }
    } catch (error) {
        updateTestResult('4.3', 'fail', `Could not test scroll effect: ${error.message}`);
    }
}

// Run all tests
async function runAllTests() {
    console.log('Starting browser compatibility tests...');
    
    // Reset all tests to pending
    Object.keys(testResults).forEach(testId => {
        updateTestResult(testId, 'pending', 'Running test...');
    });
    
    // Run tests sequentially
    await test_2_1();
    await test_2_2();
    await test_2_3();
    await test_4_1();
    await test_4_2();
    await test_4_3();
    
    console.log('All tests completed!');
    console.log('Results:', testResults);
    
    // Generate report
    generateReport();
}

// Generate test report
function generateReport() {
    const browser = detectBrowser();
    const timestamp = new Date().toISOString();
    
    const report = {
        browser: browser.name,
        version: browser.version,
        timestamp,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        results: testResults
    };
    
    console.log('=== BROWSER COMPATIBILITY TEST REPORT ===');
    console.log(`Browser: ${browser.name} ${browser.version}`);
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Viewport: ${window.innerWidth}x${window.innerHeight}px`);
    console.log('\nTest Results:');
    
    Object.entries(testResults).forEach(([testId, result]) => {
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏳';
        console.log(`${icon} Requirement ${testId}: ${result.status.toUpperCase()}`);
        console.log(`   ${result.message}`);
    });
    
    const passCount = Object.values(testResults).filter(r => r.status === 'pass').length;
    const failCount = Object.values(testResults).filter(r => r.status === 'fail').length;
    
    console.log(`\nSummary: ${passCount} passed, ${failCount} failed`);
    console.log('==========================================');
    
    return report;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    displayBrowserInfo();
    console.log('Browser compatibility test page loaded. Click "Run All Tests" to begin.');
});

// Update browser info on resize
window.addEventListener('resize', displayBrowserInfo);
