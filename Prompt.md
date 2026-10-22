# Use Calude.ai model Opus 5.5

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
- `pages/base.page.ts`
- `pages/login.page.ts` (This must also cover the forgot-password flow: opening the form, submitting an email, and exposing the confirmation and error message locators).
- `pages/register.page.ts`
- `pages/product.page.ts` (This must also cover the catalog / home page product list: reading a product card's name and price, and clicking to open a product).
- `pages/cart.page.ts`
- `pages/checkout.page.ts`

Strict Rules:
- Page objects must contain business-level methods (e.g., `login(...)`, `addToCart()`) for actions.
- Architectural Rule for Assertions: Assertions belong ONLY in spec files, not in page objects. Do not use `expect()` in page objects. 
- Locators as Properties: Page objects must expose Playwright `Locator` objects as `public readonly` properties so that tests can perform web-first assertions directly on them. Do not return boolean flags (e.g., `isErrorVisible()`) for visibility checks.
- Data Types: Import and use the types and functions from `data/user.factory.ts` (e.g., for user registration data, billing/shipping addresses during checkout) to keep data passing consistent.
- NO `waitForTimeout` anywhere. 
- NO CSS classes, XPath, `getByText`, or positional locators. Use strictly only `getByTestId()`, `getByRole()`, and `getByLabel()`.
- Be fully honest: if you are unsure about an exact selector, DO NOT GUESS OR INVENT LOCATORS. Mark the uncertain spot with a `// VERIFY` comment.

Output the code file by file, with file paths before each code block.

## Prompt 4. Fixtures

Implement a custom Playwright fixture to inject the page objects:

- `fixtures/pages.fixture.ts`: Create a custom fixture that initializes and injects all page objects directly into the tests so that spec files do not need to use the `new` keyword.
- CRITICAL: You must use EXACTLY the class names and constructors from the page objects you generated in the previous step (e.g., `LoginPage`, `RegisterPage`, etc.). Do not invent new names or parameters.

Output the code file by file, with file paths before each code block.

## Prompt 5. Test Specifications

Implement the test specifications for https://practicesoftwaretesting.com using the previously created Page Objects and fixtures.

Required test files (exactly 5 files in the `tests/` folder):
1. `tests/register.spec.ts` - Register a new customer (unique new account is created. Expected result: user is redirected to the login page, verify URL contains `login`).
2. `tests/login.spec.ts` - Must contain exactly TWO tests: one for successful login with valid credentials (expected result: URL contains `/account`), and one for failure with invalid credentials (expected result: an error message is visible).
3. `tests/buy-product.spec.ts` - Buy a product (add to cart -> cart shows correct item/quantity -> complete checkout. Choose the simplest available payment method and explicitly state which one you chose in a comment. Expected result: a payment success confirmation is shown).
4. `tests/compare-products.spec.ts` - Compare two products (open two products, save names/prices, and perform this exact assertion: the product name and price on the detail view match the corresponding values from the catalog).
5. `tests/reset-password.spec.ts` - Must contain exactly TWO tests: password reset confirmation for a known email (expected result: a confirmation message is visible and no error), and reset error for an invalid email (expected result: an error message is visible).

Strict Rules for Tests:
- Exactly one behaviour per test. The test name must state the requirement.
- Test bodies (spec files) must NOT contain any raw locators (no `page.getByTestId()`, no `page.locator()`, etc.). All page interactions go exclusively through Page Objects.
- Assertions only in specs: Use web-first assertions (`await expect(...)`) directly on the locator properties exposed by page objects. Do NOT use `waitForTimeout`.
- Exception for URL assertions: You are allowed to use the underlying Playwright `page` fixture for URL verifications (e.g., `await expect(page).toHaveURL(/.*login/)`).
- Use exactly the method names from the page objects and fixtures generated in the previous steps. Do not invent new ones.
- Shared Environment Constraints: The site is public. Do not assert global static states (e.g., total number of products). Assert only entities created by the test itself.
- Pre-existing accounts (`customer@practicesoftwaretesting.com` and `customer2@practicesoftwaretesting.com`): Use the exported constants from `data/user.factory.ts` ONLY for login steps. Do not modify their passwords or profiles.
- Every test must contain at least one meaningful assertion that can fail.
- TODO-ORACLE Rule: If an expected result is not specified for a step or you are unsure what the assertion should be, write `TODO-ORACLE` and stop; do not invent assertions. (Follow the exact expected results provided above).

At the very end of your response, include a list titled "Items to verify on the site" (highlighting any locators marked with `// VERIFY`) and a short explanation of your primary architectural decisions. Do NOT generate Description.md or Review.md files.