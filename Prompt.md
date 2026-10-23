# Claude.ai model Opus 3.5 with medium effort level

## Prompt 1. Setup & Configuration

Please create the configuration and project structure files for an automation testing project using Playwright and TypeScript for https://practicesoftwaretesting.com. 

Requirements:
- Set up `playwright.config.ts` with:
  - `baseURL: 'https://practicesoftwaretesting.com'`
  - `testIdAttribute: 'data-test'` (the website uses `data-test` attributes for automation)
  - `trace: 'on-first-retry'`
  - `retries: process.env.CI ? 2 : 0`
  - `fullyParallel: true`
- Create the following config/meta files:
  - `README.md` (short installation and execution guide via `git clone`, `npm install`, `npx playwright test`)
  - `package.json` (with required dependencies and scripts)
  - `tsconfig.json`
  - `.gitignore`
- Define the exact folder structure (just create the configuration files for now): `tests/`, `pages/`, `fixtures/`, `data/`.

Output the code file by file, with file paths before each code block.

## Prompt 2. Data Factory

Based on the project structure from the previous step, implement the data generation layer for https://practicesoftwaretesting.com:

- `data/user.factory.ts`: Create a utility/factory to dynamically generate unique user data (e.g., unique email, password, first name, last name, address) for registration and testing on each test run. 
- EXPORT CONSTANTS: Additionally, export constants in this file for the two pre-existing accounts provided for login testing: `customer@practicesoftwaretesting.com` / `welcome01` and `customer2@practicesoftwaretesting.com` / `welcome01`.

Output the code file by file, with file paths before each code block.

## Prompt 3. Page Objects

Implement the Page Object Model (POM) classes for https://practicesoftwaretesting.com.

Required pages:
- `pages/base.page.ts` (This base page holds the shared header elements like sign-in link, cart link, cart quantity, and a general `goto()` helper).
- `pages/login.page.ts` (This must also cover the forgot-password flow: opening the form, submitting an email, and exposing the confirmation and error message locators).
- `pages/register.page.ts`
- `pages/product.page.ts` (This must also cover the catalog / home page product list: reading a product card's name and price, and clicking to open a product).
- `pages/cart.page.ts`
- `pages/checkout.page.ts`

Strict Rules:
- Page objects must contain business-level methods (e.g., `login(...)`, `addToCart()`) for actions.
- Architectural Rule for Assertions: Assertions belong ONLY in spec files, not in page objects. Do not use `expect()` in page objects. 
- Locators as Properties: Page objects must expose Playwright `Locator` objects as `public readonly` properties so that tests can perform web-first assertions directly on them. Do not return boolean flags (e.g., `isErrorVisible()`) for visibility checks.
- Data Types & Factories: 
  - The `Address` type now explicitly includes a `houseNumber` property.
  - The user factory is located at `data/user.factory.ts`. Import and use the types and functions from it (e.g., for user registration data, billing/shipping addresses during checkout) to keep data passing consistent.
- Import Aliases: You MUST use path aliases for imports. Use `@data/...` for data/factories and `@pages/...` for page objects.
- Registration Address Flow (CRITICAL): The AI is unaware of this specific behavior, so you must strictly follow this order when filling out the address during registration:
  1. Select Country. Country must be selected by visible text (e.g., `United States of America (the)`), NOT by code.
  2. Fill Zip/Postcode.
  3. Fill House number.
  4. Wait for the Street field to become non-empty (populated automatically). To do this without violating the "no assertions" rule, use `this.page.waitForFunction` to check that the street input field's value is no longer empty. Do NOT use `expect()`.
  5. Fill the remaining address fields: overwrite street, city, and state with the user’s values (the autofill data is often wrong, and for some countries, State stays empty).
- NO `waitForTimeout` anywhere. 
- Locators Strategy: NO CSS classes, XPath, `getByText`, or positional locators. Use strictly only `getByTestId()`, `getByRole()`, and `getByLabel()`. Note that `getByTestId()` should target the `data-test` attribute (Playwright must be configured to use `data-test`).
- Be fully honest: if you are unsure about an exact selector, DO NOT GUESS OR INVENT LOCATORS. Mark the uncertain spot with a `// VERIFY` comment.

Output the code file by file, with file paths before each code block.

## Prompt 4. Fixtures

Implement a custom Playwright fixture to inject the page objects:

- `fixtures/pages.fixture.ts`: Create a custom fixture that initializes and injects all page objects directly into the tests so that spec files do not need to use the `new` keyword.
Strict Rules:
1. **Exact Property Names & Classes:** You must use EXACTLY the following fixture property names and their corresponding classes from the page objects you generated in the previous step: 
   - `loginPage` (class `LoginPage`)
   - `registerPage` (class `RegisterPage`)
   - `productPage` (class `ProductPage`)
   - `cartPage` (class `CartPage`)
   - `checkoutPage` (class `CheckoutPage`)
   *Note: `BasePage` is abstract/inherited and should not be instantiated. The forgot-password flow is part of `loginPage`, so do not create a separate fixture for it.*
2. **Exports:** Extend the base `test` from `@playwright/test`. You MUST export the extended `test` and re-export `expect` directly from this file, so that spec files can import both exclusively from `@fixtures/pages.fixture`.
3. **Authenticated Fixture:** Add a custom fixture named `loggedInCustomer`. This fixture must:
   - Depend on `loginPage` (and `page` if needed).
   - Open the login page first (e.g., `loginPage.goto()`).
   - Log the user in using the `CUSTOMER` data from `data/user.factory.ts`.
   - Wait until the URL is no longer the login page to ensure the test starts only after sign-in finishes. Use Playwright's `page.waitForURL()` (do NOT use `expect`). If you are unsure about the exact redirect URL, mark it with a `// VERIFY` comment.
   - Yield the `CUSTOMER` credentials/data, so specs can use the email or other details in assertions.
   - Do not use `expect()` inside this or any other fixture; specs do the assertions.
4. **Import Aliases:** Use path aliases for your imports: `@pages/...` for page objects and `@data/...` for the user factory. *(Note: `@fixtures/...` is available for specs to import this file).*
5. **Be fully honest:** If you are unsure about any implementation detail, DO NOT GUESS. Mark the uncertain spot with a `// VERIFY` comment.
Output the code file by file, with file paths before each code block.

## Prompt 5. Test Specifications

Implement the test specifications for https://practicesoftwaretesting.com using the previously created Page Objects and fixtures.

Required test files (exactly 5 files in the `tests/` folder):
1. `tests/register.spec.ts` - Register a new customer (unique new account is created. Expected result: user is redirected to the login page, verify URL contains `login`).
2. `tests/login.spec.ts` - Must contain exactly TWO tests: one for successful login with valid credentials (expected result: URL contains `/account`), and one for failure with invalid credentials (expected result: an error message is visible).
3. `tests/buy-product.spec.ts` - Buy a product (add to cart -> cart shows correct item/quantity -> complete checkout. Choose the simplest available payment method and explicitly state which one you chose in a comment. Expected result: a payment success confirmation is shown). Note: the buy-product test is one end-to-end scenario; intermediate assertions in it are allowed.
4. `tests/compare-products.spec.ts` - Compare two products (take the first two products in the catalog, read their names through the page object, do not hardcode product names. Save names/prices, and perform this exact assertion: the product name and price on the detail view match the corresponding values from the catalog).
5. `tests/reset-password.spec.ts` - Must contain exactly TWO tests: password reset confirmation for a known email (expected result: a confirmation message is visible and no error), and reset error for an invalid email (expected result: an error message is visible).

Strict Rules for Tests:
- Exactly one behaviour per test. The test name must state the requirement.
- Imports & Fixtures: Import test and expect ONLY from @fixtures/pages.fixture; use createUser() from @data/user.factory for registration data; use the loggedInCustomer fixture when a test needs a signed-in user.
- Test bodies (spec files) must NOT contain any raw locators (no `page.getByTestId()`, no `page.locator()`, etc.). All page interactions go exclusively through Page Objects.
- Assertions only in specs: Use web-first assertions (`await expect(...)`) directly on the locator properties exposed by page objects. Do NOT use `waitForTimeout`.
- Exception for URL assertions: You are allowed to use the underlying Playwright `page` fixture for URL verifications (e.g., `await expect(page).toHaveURL(/.*login/)`).
- Use exactly the method names from the page objects and fixtures generated in the previous steps. Do not invent new ones.
- Shared Environment Constraints: The site is public. Do not assert global static states (e.g., total number of products). Assert only entities created by the test itself.
- Pre-existing accounts (customer@practicesoftwaretesting.com and customer2@practicesoftwaretesting.com): Use the exported constants from data/user.factory.ts ONLY for login steps. It is also allowed as the known email in the reset-password test (only request the reset, never complete it). Do not modify their passwords or profiles.
- Every test must contain at least one meaningful assertion that can fail.
- TODO-ORACLE Rule: If an expected result is not specified for a step or you are unsure what the assertion should be, write `TODO-ORACLE` and stop; do not invent assertions. (Follow the exact expected results provided above).

At the very end of your response, include a list titled "Items to verify on the site" (highlighting any locators marked with `// VERIFY`) and a short explanation of your primary architectural decisions. Do NOT generate Description.md or Review.md files.

## Prompt 6: Auth Refactoring — Creating the `loggedInCustomer` Fixture & Updating Tests

Let's improve the independence of our tests and stop using hardcoded users for login. Please implement the following changes strictly following the rules below.

1. **Create a new `loggedInCustomer` fixture in `fixtures/pages.fixture.ts`:**
   * Generate a new, unique user via `createUser()`.
   * Open the registration page first with `registerPage.goto()`.
   * Register the user via `registerPage.register(user)`.
   * **Crucial Wait:** After registering, wait until the URL contains `/auth/login` using `page.waitForURL` (remember: no `expect()` in fixtures). If you immediately call login, the fields will be filled on a page that isn't fully ready, causing flakiness.
   * **No Double Navigation:** Do not call `loginPage.goto()` again after registration, the redirect already lands on the login page.
   * Log in via `loginPage.login(user)`.
   * **Post-login Wait:** Wait until the URL leaves the login page.
   * **Yield:** Yield the `User` object returned by `createUser()` so specs can use the email and password. Do not yield the hardcoded `CUSTOMER`.

2. **Update the successful login test (Login) in `tests/login.spec.ts`:**
   * Open the registration page first with `registerPage.goto()`.
   * Register a new user via `registerPage.register(user)`.
   * **Crucial Wait:** Between register and login, assert with `await expect(page).toHaveURL(/login/)`, which also confirms the redirect.
   * Log in with this new user's credentials.
   * The successful login assertion remains unchanged: verify that the URL contains `/account`.

3. **Forgot password test:**
   * Keep using `CUSTOMER.email` here. Since this test only requests a password reset and doesn't require an actual login, the hardcoded email is sufficient.

4. **Test data factory:**
   * Keep `CUSTOMER` and `CUSTOMER_2` in the factory (do not delete them). We simply won't use them for the login flow anymore.

5. **Impact on `buy-product.spec.ts`:**
   * `buy-product.spec.ts` uses the `loggedInCustomer` fixture, so it will now receive a dynamically generated user. This test must keep working with the new fixture; if it needs any change, show it.

6. **Scope of changes & Cleanup:**
   * Change only `fixtures/pages.fixture.ts` and `tests/login.spec.ts`; do not touch other files unless required, and if so, say which and why.
   * Remove imports that become unused so `tsc --noEmit` passes.

7. **General Rules Reminder (Apply strictly):**
   * Keep all earlier rules: no `expect()` in fixtures or page objects, no raw locators in specs, imports only through `@fixtures`, `@pages`, `@data`, no `waitForTimeout`, mark uncertain spots with `// VERIFY`.

Please provide the updated code for the affected files.

## Prompt 7: Handling Out-of-Stock Products in Purchase Flow:

We need to fix a flakiness issue in `tests/buy-product.spec.ts` caused by out-of-stock items. Please implement the following changes strictly following the guidelines below.

1. **Problem Statement:**
   The test currently picks the first product from the catalog, but that product can sometimes be out of stock (causing the "Add to Cart" button to be disabled and failing the test).

2. **DOM Structure & Locator Filtering:**
   * Out-of-stock items contain an element with `data-test="out-of-stock"`.
   * **Filtering Logic:** Out-of-stock marker is a descendant inside the product card element. Filter the product cards strictly using `locator.filter({ hasNot: ... })` to select only cards that do NOT contain the out-of-stock marker.

3. **Page Object Method (`pages/product.page.ts`):**
   * Add a method named `openFirstInStockProduct()` in `pages/product.page.ts`.
   * Do not change the behaviour of existing methods and locators in `ProductPage`, only add the new method.
   * It must find the first in-stock product card, click it to open the product details page, and return the product name (`string`) so the test can verify it against the cart later.

4. **Update Test (`tests/buy-product.spec.ts`):**
   * Update `tests/buy-product.spec.ts` to use `openFirstInStockProduct()` instead of picking the first product blindly from the catalog.
   * Keep the existing `toBeEnabled()` assertion guard on the "Add to Cart" button in the test (it provides a clear error message if an item state changes between selection and purchase).

5. **Scope of Changes & Cleanup:**
   * Modify **ONLY** `pages/product.page.ts` and `tests/buy-product.spec.ts`. Do not touch any other files.
   * Remove any unused imports so `tsc --noEmit` passes without errors.

6. **General Rules Reminder (Apply strictly):**
   * No `expect()` assertions inside page objects.
   * No `waitForTimeout()`.
   * No raw CSS/XPath locators in specs — use user-facing locators (`getByTestId`, `getByRole`, `getByLabel`).
   * Mark any uncertain implementations with `// VERIFY`.

Please provide the updated code for `pages/product.page.ts` and `tests/buy-product.spec.ts`.