import { test, expect } from '@fixtures/pages.fixture';
import { CUSTOMER, generateUniqueEmail } from '@data/user.factory';

test.describe('Reset password', () => {
  test('requesting a reset for a known email shows a confirmation and no error', async ({ loginPage }) => {
    // Only the request is made; the reset is never completed, so CUSTOMER's password stays unchanged
    await loginPage.goto();
    await loginPage.requestPasswordReset(CUSTOMER.email);

    await expect(loginPage.forgotPasswordConfirmation).toBeVisible();
    await expect(loginPage.forgotPasswordError).toBeHidden();
  });

  test('requesting a reset for an invalid email shows an error message', async ({ loginPage }) => {
    // "Invalid" is interpreted as a well-formed but unregistered address (see VERIFY list below)
    await loginPage.goto();
    await loginPage.requestPasswordReset(generateUniqueEmail());

    await expect(loginPage.forgotPasswordError).toBeVisible();
  });
});