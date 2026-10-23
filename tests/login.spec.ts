import { test, expect } from '@fixtures/pages.fixture';
import { createUser, generateUniqueEmail, generatePassword } from '@data/user.factory';

test.describe('Login', () => {
  test('a customer with valid credentials is signed in and lands on the account page', async ({
    page,
    registerPage,
    loginPage,
  }) => {
    const user = createUser();

    await registerPage.goto();
    await registerPage.register(user);

    // Precondition: the registration redirect has landed on the login page before the form is filled
    await expect(page).toHaveURL(/login/);

    await loginPage.login(user);

    await expect(page).toHaveURL(/\/account/);
  });

  test('login with invalid credentials shows an error message', async ({ loginPage }) => {
    // A freshly generated, non-existent account is used on purpose: repeated failed
    // attempts against a shared account could lock it for other users.
    await loginPage.goto();
    await loginPage.login({ email: generateUniqueEmail(), password: generatePassword() });

    await expect(loginPage.loginError).toBeVisible();
  });
});