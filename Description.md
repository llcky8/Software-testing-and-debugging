# Description: test cases

Project: Playwright + TypeScript automated tests for https://practicesoftwaretesting.com

There are **5 test cases**, implemented as **7 automated tests** (two of the cases have two tests each: a positive and a negative scenario).

| # | Test case | File | Automated tests |
| --- | --- | --- | --- |
| TC-1 | Register a new customer | `tests/register.spec.ts` | 1 |
| TC-2 | Log in | `tests/login.spec.ts` | 2 |
| TC-3 | Buy a product | `tests/buy-product.spec.ts` | 1 |
| TC-4 | Compare two products | `tests/compare-products.spec.ts` | 1 |
| TC-5 | Reset a password | `tests/reset-password.spec.ts` | 2 |

## Test data

- Every test that needs a user creates a **new** one with `createUser()` from `data/user.factory.ts`: a unique email (timestamp + random part), a password, a name and an address (`@faker-js/faker`). The country is selected by its visible text: `United States of America (the)`.
- The site's shared accounts (`customer@practicesoftwaretesting.com` and similar) are **not** used for logging in: they are public and can be locked by anyone. `CUSTOMER.email` is used only as the "known email" in the reset-password test, and only to request a reset.

---

## TC-1. Register a new customer

**File:** `tests/register.spec.ts`
**Test:** `a new customer can register and is redirected to the login page`

**Preconditions:** none (the data is created inside the test).

**Steps:**
1. Generate a new user (`createUser()`).
2. Open the registration page.
3. Fill in the form: personal details, address, phone, email and password. Address order: country → postcode → house number → wait for the autofilled street → overwrite street, city and state with the user's own values.
4. Submit the form.

**Expected result:** the user is redirected to the login page.

**Assertion:** the URL contains `login`.

---

## TC-2. Log in

**File:** `tests/login.spec.ts`

### TC-2.1 Successful login
**Test:** `a customer with valid credentials is signed in and lands on the account page`

**Steps:**
1. Register a new user (as in TC-1).
2. Make sure the site has redirected to the login page.
3. Log in with this user's email and password.

**Expected result:** the account page is opened.

**Assertions:**
- after registration the URL contains `login` (a precondition that confirms the redirect);
- after login the URL contains `/account`.

### TC-2.2 Login with invalid credentials
**Test:** `login with invalid credentials shows an error message`

**Steps:**
1. Open the login page.
2. Enter the email and password of a non-existent (generated) account.
3. Submit the form.

**Expected result:** an error message is shown.

**Assertion:** the login error message (`login-error`) is visible.

**Note:** the negative test uses a non-existent account so that it never triggers a lock on a shared account.

---

## TC-3. Buy a product

**File:** `tests/buy-product.spec.ts`
**Test:** `a signed-in customer can buy a product and sees a payment success confirmation`

**Preconditions:** the `loggedInCustomer` fixture registers a new user and signs in as that user.

**Steps:**
1. Open the catalog and open the **first in-stock product** (cards with the `out-of-stock` marker are skipped).
2. Add the product to the cart.
3. Open the cart and proceed to checkout.
4. Continue as the signed-in user, fill the billing address with generated data and proceed to payment.
5. Choose the payment method **Cash on Delivery** (the simplest one, it needs no extra input fields) and confirm the payment.

**Expected result:** a payment success confirmation is shown.

**Assertions:**
- the "Add to cart" button is enabled (a guard in case the product's state changed after it was selected);
- the cart counter shows `1`;
- the cart shows the row of the selected product and its quantity is `1`;
- the button that leads to payment is enabled;
- the payment success message is visible.

**Not checked (TODO-ORACLE):** the final order placement after the payment is confirmed, because no expected result is specified for it.

---

## TC-4. Compare two products

**File:** `tests/compare-products.spec.ts`
**Test:** `name and price on the product detail page match the catalog for the first two products`

**Steps:**
1. Open the catalog and wait until the product cards are rendered.
2. Read the names and prices of the first two products (the names are not hardcoded in the test).
3. Open the detail page of each of the two products.

**Expected result:** the name and the price on the detail page match the catalog.

**Assertions:**
- the catalog has at least two products;
- the name on the detail page equals the name in the catalog;
- the price on the detail page equals the price in the catalog.

---

## TC-5. Reset a password

**File:** `tests/reset-password.spec.ts`

### TC-5.1 Reset for a known email
**Test:** `requesting a reset for a known email shows a confirmation and no error`

**Steps:**
1. Open the login page and go to the "Forgot password" form.
2. Enter a known email and submit the form (the reset is never completed, so the account's password stays unchanged).

**Expected result:** a confirmation is shown and there is no error.

**Assertions:**
- the confirmation (an element with the `alert` role) is visible;
- the error message (`email-error`) is hidden.

### TC-5.2 Reset for an email with an invalid format
**Test:** `requesting a reset for an invalid email shows an error message`

**Steps:**
1. Open the login page and go to the "Forgot password" form.
2. Enter `not-an-email` and submit the form.

**Expected result:** an error is shown.

**Assertion:** the error block (`email-error`) is visible.

---

## Observations about the site's behaviour (used in the tests)

- For a well-formed but unregistered email the reset form shows nothing, so "invalid email" in TC-5.2 means an email with an invalid format.
- The registration form fills in street, city and state by itself after the country, postcode and house number are entered, so the test overwrites those fields with its own values.