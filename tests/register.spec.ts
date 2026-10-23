import { test, expect } from '@fixtures/pages.fixture';
import { createUser } from '@data/user.factory';

test.describe('Registration', () => {
  test('a new customer can register and is redirected to the login page', async ({ page, registerPage }) => {
    const user = createUser();

    await registerPage.goto();
    await registerPage.register(user);

    await expect(page).toHaveURL(/login/);
  });
});