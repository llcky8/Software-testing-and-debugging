import type { Locator, Page } from '@playwright/test';

/**
 * Shared header/navigation elements and navigation helpers.
 * No assertions here: tests assert directly on the exposed locators.
 */
export abstract class BasePage {
  /** Relative path of the page (resolved against baseURL) */
  protected abstract readonly path: string;

  public readonly homeLink: Locator;
  public readonly signInLink: Locator;
  public readonly cartLink: Locator;
  public readonly cartQuantity: Locator;
  public readonly userMenu: Locator;
  public readonly signOutLink: Locator;

  constructor(protected readonly page: Page) {
    this.homeLink = page.getByTestId('nav-home');
    this.signInLink = page.getByTestId('nav-sign-in');
    this.cartLink = page.getByTestId('nav-cart');
    /** Only rendered when the cart contains at least one item */
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.userMenu = page.getByTestId('nav-menu'); // VERIFY: logged-in user dropdown
    this.signOutLink = page.getByTestId('nav-sign-out'); // VERIFY
  }

  /** Navigates to this page's path, or to a custom relative path */
  async goto(path: string = this.path): Promise<void> {
    await this.page.goto(path);
  }

  async openSignIn(): Promise<void> {
    await this.signInLink.click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async signOut(): Promise<void> {
    await this.userMenu.click();
    await this.signOutLink.click();
  }
}