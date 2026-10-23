import { test as base } from '@playwright/test';
import { createUser, type User } from '@data/user.factory';
import { LoginPage } from '@pages/login.page';
import { RegisterPage } from '@pages/register.page';
import { ProductPage } from '@pages/product.page';
import { CartPage } from '@pages/cart.page';
import { CheckoutPage } from '@pages/checkout.page';

type PageFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** Registers a fresh unique user, signs them in, and yields that user */
  loggedInCustomer: User;
};

const LOGIN_PATH = '/auth/login';

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  loggedInCustomer: async ({ page, registerPage, loginPage }, use) => {
    const user = createUser();

    await registerPage.goto();
    await registerPage.register(user);

    // Synchronization, not an assertion: wait for the post-registration redirect so the
    // login form is rendered before it is filled. No loginPage.goto() — the redirect lands there.
    // If registration fails, this times out (check registerPage.registerError).
    await page.waitForURL((url) => url.pathname.includes(LOGIN_PATH));

    await loginPage.login(user);

    // Synchronization, not an assertion: resolves once the SPA routes away from the login page.
    // VERIFY: customers are expected to land on "/account"; the predicate deliberately
    // avoids depending on the exact destination. If login fails, this times out (check loginPage.loginError).
    await page.waitForURL((url) => !url.pathname.startsWith(LOGIN_PATH));

    await use(user);
  },
});

export { expect } from '@playwright/test';