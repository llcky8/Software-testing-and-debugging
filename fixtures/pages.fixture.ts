import { test as base } from '@playwright/test';
import { CUSTOMER, type Credentials } from '@data/user.factory';
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
  /** Signs in as CUSTOMER before the test body runs and yields its credentials */
  loggedInCustomer: Readonly<Credentials>;
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

  loggedInCustomer: async ({ page, loginPage }, use) => {
    await loginPage.goto();
    await loginPage.login(CUSTOMER);

    // Synchronization, not an assertion: resolves once the SPA routes away from the login page.
    // VERIFY: customers are expected to land on "/account"; the predicate below deliberately
    // avoids depending on the exact destination. If login fails, this times out (check loginPage.loginError).
    await page.waitForURL((url) => !url.pathname.startsWith(LOGIN_PATH));

    await use(CUSTOMER);
  },
});

export { expect } from '@playwright/test';