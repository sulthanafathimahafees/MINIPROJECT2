# OptiBuy Selenium Automated Test Suite

This directory contains the automated end-to-end browser test suites documented in **Chapter 5 (System Testing)** of the OptiBuy Project Report.

---

## Files in this Directory

| File | Type | Purpose |
| :--- | :--- | :--- |
| **[`optibuy.side`](./optibuy.side)** | Selenium IDE Project | Native JSON project file for the official **Selenium IDE** Chrome / Edge extension. |
| **[`run_selenium_tests.py`](./run_selenium_tests.py)** | Python Selenium Script | Standalone Selenium WebDriver script for running automated headless or visual tests via Python. |

---

## Test Cases Covered

1. **`TC_SEL_01` (Customer Authentication Flow):**
   - Navigates to `/login`
   - Inputs Customer email (`aryadileep@gmail.com`) and password (`password123`)
   - Clicks Login button
   - Verifies redirection to `/customer-dashboard` and checks welcome heading.

2. **`TC_SEL_02` (Catalog Browsing & Category Filtering):**
   - Navigates to `/products`
   - Verifies page title and loads dynamic catalog
   - Tests category filtering across Smartphones, Laptops, and Smart TVs.

3. **`TC_SEL_03` (Public Navigation & Showcase Flow):**
   - Navigates across Home (`/`), About Us (`/about`), Contact (`/contact`), and Sales Representative Application (`/join-as-sales-person`).

4. **`TC_SEL_04` (Administrator Authentication Flow):**
   - Navigates to `/login`
   - Enters Admin credentials (`optibuyadmin@gmail.com` / `admin@123`)
   - Verifies redirection to `/admin-dashboard`.

---

## Method 1: Running with the Selenium IDE Browser Extension (Recommended GUI)

1. **Verify Development Servers are Running:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000/api`

2. **Install / Open Selenium IDE:**
   - If not installed, install the **Selenium IDE** extension from the Chrome Web Store or Edge Add-ons store.
   - Click the Selenium IDE extension icon in your browser toolbar.

3. **Open the Project:**
   - In the Selenium IDE welcome dialog, click **"Open an existing project"**.
   - Browse to: `d:\optibuy\tests\selenium\optibuy.side`.

4. **Execute the Suite:**
   - Verify the Base URL is set to: `http://localhost:5173`.
   - Click the **"Run all tests"** button (double-play icon `▶▶`) at the top of the Selenium IDE window.
   - Watch the tests execute in the browser and display green checkmarks for all 4 test cases.

---

## Method 2: Running via Python Selenium WebDriver (CLI)

Ensure you have Python and `selenium` installed:
```bash
pip install selenium
```

Run the automated test suite in visual mode:
```bash
python tests/selenium/run_selenium_tests.py
```

Or in headless mode:
```bash
python tests/selenium/run_selenium_tests.py --headless
```

