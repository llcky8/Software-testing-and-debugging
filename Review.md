# Review: automated tests and working with AI

Project: E2E tests for practicesoftwaretesting.com. 5 test cases, 7 automated tests.

## 1. How I worked with the AI

I wrote the prompts myself and discussed them with Claude before sending them; Claude pointed out gaps, and I decided which advice to take. Every raw AI answer is saved as a separate commit named "AI output after prompt N (raw, unchanged)", and the screenshots are in `screenshots/`. `Description.md` and `README.md` were drafted with Claude and checked by me against the code.

## 2. General settings

- **Path aliases** (`@fixtures`, `@pages`, `@data`): the AI suggested them, I kept them and set them in `tsconfig.json`: imports are shorter and do not break when files are moved.
- **Browsers:** the AI generated three (chromium, firefox, webkit). The assignment and the teacher's example (slide 19) use only Chromium, so I removed Firefox and Webkit from the config, `package.json` and the README: it is simpler to run and there is less risk of failures on the reviewer's machine.
- **`@faker-js/faker`:** the AI added it without being asked. I kept it but wrote down the risk: random data makes failures harder to reproduce.
- **Parallelism:** with 6 workers the pages sometimes did not load (a white screen in the failure screenshots). I set `workers: 3`, `timeout: 60_000`, `actionTimeout: 15_000` and `navigationTimeout: 45_000`. Failures dropped to 0–1 out of 21 (before it was 3).
- **`retries: 1`:** because of the delays of the public site. A test that passes only on the second attempt is shown in the report as flaky.

## 3. Findings

**1. Registration form.**
AI: the `Address` type had no house number and the country was a code (`'US'`).
I checked: the site has a house number field (`data-test="house_number"`) and the country is selected by its text, `United States of America (the)`.
I did: added `houseNumber` to `Address` and the exact country string.

**2. Address autofill.**
AI: did not know about it (it cannot open the site).
I checked by hand: after the country, postcode and house number are entered, the site fills in street and state by itself; for Kazakhstan it fills in California.
I did: wrote the order into the prompt: country → postcode → house number → wait until the street is filled → overwrite street, city, state and phone with my own values. The AI implemented this in the page object.

**3. Password reset (prompts 3 and 5).**
AI: invented `forgot-password-success` and `forgot-password-error` (marked `// VERIFY` in prompt 3), and understood "invalid email" as an unregistered address.
I checked: these attributes do not exist in the real DOM. Success is a `<div role="alert">`, a format error is `data-test="email-error"`. For an unregistered email the site shows nothing (maybe protection against guessing, not verified).
I did: fixed the locators in `pages/login.page.ts`. The second test in `tests/reset-password.spec.ts` now uses an invalid format (`not-an-email`).

**4. Locked account (prompts 4 and 6).**
AI: used the shared `CUSTOMER` account; the usage example contained a pointless check, `expect(email).toBe(...)`, which I did not use.
I checked: the account was locked ("Account locked"); who locked it is unknown, it is public.
I did: with my prompt 6 the AI rewrote `loggedInCustomer`: every test registers a new user. The tests no longer depend on a shared account.

**5. Out-of-stock products (prompt 7).**
AI: with my prompt it added `openFirstInStockProduct()` using a `hasNot` filter.
I checked: the first product is often out of stock (`data-test="out-of-stock"` inside the card) and the buy test failed because of it. The AI used `.first()`, which formally breaks my own rule from prompt 3 about positional locators.
I did: kept `.first()`: taking the first of the in-stock products is exactly the requirement. In the latest runs `buy-product` passes.

## 4. The buggy build and the strength of the assertions

The first run against `with-bugs.practicesoftwaretesting.com` was intentional. The later runs (my manual breaking of expectations) also went there by mistake because `BASE_URL` was not reset. Direct links on that site return 404 and the registration form is a different version (no House number, the Country and State labels are swapped), so the run proved nothing.

Assertion strength on the normal site: I broke one expectation at a time and ran only that file; after each check I reverted the change with `git checkout -- tests/`.
- `login.spec.ts`: `/\/account/` → `/\/accounttt/`. Failed with `toHaveURL ... failed` (`screenshots/mutation-login.png`).
- `compare-products.spec.ts`: added `XYZ` to the expected name. Failed with `toHaveText ... failed` (`screenshots/mutation-compare.png`). My first attempt did not count: I had broken the wrong line and the test failed with a click timeout instead.
- `reset-password.spec.ts`: `toBeVisible()` → `toBeHidden()` on the error in the second test. Failed with `toBeHidden ... failed` (`screenshots/mutation-reset.png`).

## 5. Not verified

Not used by the tests and not checked by hand: `nav-menu`, `nav-sign-out`, `order-confirmation`, the remove button in the cart.

## 6. Current status

The latest single run: 7 of 7 passed. I also ran the suite from a fresh clone of the GitHub repository (`npm install`, `npx playwright install chromium`, `npx playwright test`): 7 of 7 passed. In a series of 21 runs one test failed because the login page did not load within 15 seconds (the site).

I also searched the cloned repository by text: it contains no `waitForTimeout`, no XPath, no locators in the specs and no `expect` in the page objects.