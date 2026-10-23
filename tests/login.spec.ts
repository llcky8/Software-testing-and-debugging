import { test, expect } from '@fixtures/pages.fixture';
import { CUSTOMER, generateUniqueEmail, generatePassword } from '@data/user.factory';

test.describe('Login', () => {
  test('a customer with valid credentials is signed in and lands on the account page', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(CUSTOMER);

    await expect(page).toHaveURL(/\/account/);
  });

  test('login with invalid credentials shows an error message', async ({ loginPage }) => {
    // A freshly generated, non-existent account is used on purpose: repeated failed
    // attempts against the shared CUSTOMER account could lock it for other users.
    await loginPage.goto();
    await loginPage.login({ email: generateUniqueEmail(), password: generatePassword() });

    await expect(loginPage.loginError).toBeVisible();
  });
});