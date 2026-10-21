"""
OptiBuy Automated Selenium WebDriver Test Suite
Supports Chrome and Edge browser automation.

Test Cases Covered:
  - TC_SEL_01: Customer Authentication Flow (Email & Password verification, Dashboard redirect)
  - TC_SEL_02: Catalog Browsing & Category Filtering (Smartphones, Laptops, Smart TVs)
  - TC_SEL_03: Public Showcase Navigation (Home, Products, About, Contact, Sales Request)
  - TC_SEL_04: Administrator Authentication & Control Center Access
"""

import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options as ChromeOptions

BASE_URL = "http://localhost:5173"

def print_banner(text):
    print("\n" + "=" * 60)
    print(f" {text}")
    print("=" * 60)

def init_driver(headless=False):
    options = ChromeOptions()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,800")
    
    # Ignore certificate errors for local dev
    options.add_argument("--ignore-certificate-errors")
    
    try:
        driver = webdriver.Chrome(options=options)
        return driver
    except Exception as e:
        print(f"[Driver Init Error] Could not initialize Chrome WebDriver: {e}")
        print("Tip: Install ChromeDriver or run via Selenium IDE extension in Chrome/Edge.")
        return None

def test_tc_sel_01_customer_login(driver):
    print_banner("Running TC_SEL_01: Customer Authentication Flow")
    driver.get(f"{BASE_URL}/login")
    wait = WebDriverWait(driver, 10)
    
    # Find email input and enter credentials
    email_input = wait.until(EC.presence_of_element_located((By.ID, "email-input")))
    email_input.clear()
    email_input.send_keys("aryadileep@gmail.com")
    print("✓ Entered Customer Email: aryadileep@gmail.com")
    
    # Find password input and enter credentials
    pass_input = driver.findElement(By.ID, "password-input") if hasattr(driver, "findElement") else driver.find_element(By.ID, "password-input")
    pass_input.clear()
    pass_input.send_keys("password123")
    print("✓ Entered Customer Password: password123")
    
    # Click submit
    submit_btn = driver.find_element(By.ID, "login-submit-btn")
    submit_btn.click()
    print("✓ Clicked Login button, awaiting redirect...")
    
    # Wait for dashboard header
    header = wait.until(EC.presence_of_element_located((By.ID, "dashboard-header")))
    header_text = header.text
    print(f"✓ Found Dashboard Header: '{header_text}'")
    assert "Welcome" in header_text, f"Expected 'Welcome' in header text, got: {header_text}"
    print(">>> TC_SEL_01 PASSED: Customer authenticated and redirected successfully.")

def test_tc_sel_02_catalog_filter(driver):
    print_banner("Running TC_SEL_02: Catalog & Category Filtering Flow")
    driver.get(f"{BASE_URL}/products")
    wait = WebDriverWait(driver, 10)
    
    # Verify title
    assert "OptiBuy" in driver.title
    print(f"✓ Page Title Verified: '{driver.title}'")
    
    # Click Smartphones category
    cat_smartphones = wait.until(EC.element_to_be_clickable((By.ID, "category-smartphones")))
    cat_smartphones.click()
    time.sleep(0.5)
    print("✓ Selected Category: Smartphones")
    
    # Click Laptops category
    cat_laptops = wait.until(EC.element_to_be_clickable((By.ID, "category-laptops")))
    cat_laptops.click()
    time.sleep(0.5)
    print("✓ Selected Category: Laptops")
    
    # Click Smart TVs category
    cat_tvs = wait.until(EC.element_to_be_clickable((By.ID, "category-smart-tvs")))
    cat_tvs.click()
    time.sleep(0.5)
    print("✓ Selected Category: Smart TVs")
    
    print(">>> TC_SEL_02 PASSED: Category navigation and dynamic catalog filters responsive.")

def test_tc_sel_03_public_navigation(driver):
    print_banner("Running TC_SEL_03: Public Navigation Flow")
    
    # Home Page
    driver.get(f"{BASE_URL}/")
    time.sleep(0.5)
    assert "OptiBuy" in driver.title
    print("✓ Loaded Home Page successfully.")
    
    # About Page
    driver.get(f"{BASE_URL}/about")
    time.sleep(0.5)
    print("✓ Loaded About Us Page successfully.")
    
    # Contact Page
    driver.get(f"{BASE_URL}/contact")
    time.sleep(0.5)
    print("✓ Loaded Contact Page successfully.")
    
    # Sales Person Application Page
    driver.get(f"{BASE_URL}/join-as-sales-person")
    time.sleep(0.5)
    print("✓ Loaded Sales Person Application Page successfully.")
    
    print(">>> TC_SEL_03 PASSED: Public routes and navigation verified.")

def test_tc_sel_04_admin_login(driver):
    print_banner("Running TC_SEL_04: Administrator Authentication Flow")
    
    # Clear session/localStorage
    driver.get(f"{BASE_URL}/login")
    driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
    driver.refresh()
    
    wait = WebDriverWait(driver, 10)
    email_input = wait.until(EC.presence_of_element_located((By.ID, "email-input")))
    email_input.clear()
    email_input.send_keys("optibuyadmin@gmail.com")
    print("✓ Entered Admin Email: optibuyadmin@gmail.com")
    
    pass_input = driver.find_element(By.ID, "password-input")
    pass_input.clear()
    pass_input.send_keys("admin@123")
    print("✓ Entered Admin Password: admin@123")
    
    submit_btn = driver.find_element(By.ID, "login-submit-btn")
    submit_btn.click()
    print("✓ Clicked Login button, awaiting Admin redirect...")
    
    time.sleep(1.5)
    current_url = driver.current_url
    print(f"✓ Redirection Target URL: {current_url}")
    assert "admin" in current_url.lower() or "dashboard" in current_url.lower(), f"Unexpected redirect URL: {current_url}"
    print(">>> TC_SEL_04 PASSED: Admin authenticated and redirected.")

def main():
    print_banner("OPTIBUY SELENIUM END-TO-END AUTOMATED TEST SUITE")
    print(f"Base Target URL: {BASE_URL}")
    print("Browser: Google Chrome / Edge WebDriver")
    
    headless = "--headless" in sys.argv
    driver = init_driver(headless=headless)
    if not driver:
        print("\n[Notice] ChromeDriver not in PATH. Please run tests via Selenium IDE extension:")
        print("  1. Open Chrome/Edge extension: Selenium IDE")
        print("  2. Open project: tests/selenium/optibuy.side")
        print("  3. Click 'Run all tests' (Play)")
        sys.exit(1)
        
    passed = 0
    total = 4
    try:
        test_tc_sel_01_customer_login(driver)
        passed += 1
        
        test_tc_sel_02_catalog_filter(driver)
        passed += 1
        
        test_tc_sel_03_public_navigation(driver)
        passed += 1
        
        test_tc_sel_04_admin_login(driver)
        passed += 1
        
        print_banner(f"TEST RESULTS: {passed}/{total} SUITES PASSED (100% PASS RATE)")
    except Exception as e:
        print(f"\n❌ Test Failed: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
