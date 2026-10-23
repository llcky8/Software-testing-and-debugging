import type { Locator, Page } from '@playwright/test';
import type { Credentials } from '@data/user.factory';
import { BasePage } from '@pages/base.page';

export class LoginPage extends BasePage {
  protected readonly path = '/auth/login';
  public readonly forgotPasswordPath = '/auth/forgot-password'; // VERIFY: route

  // --- Login form ---
  public readonly emailInput: Locator;
  public readonly passwordInput: Locator;
  public readonly submitButton: Locator;
  public readonly loginError: Locator;
  public readonly emailError: Locator;
  public readonly passwordError: Locator;
  public readonly registerLink: Locator;

  // --- Forgot password flow ---
  public readonly forgotPasswordLink: Locator;
  public readonly forgotPasswordEmailInput: Locator;
  public readonly forgotPasswordSubmitButton: Locator;
  public readonly forgotPasswordConfirmation: Locator;
  public readonly forgotPasswordError: Locator;

  constructor(page: Page) {
    super(page);

    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('login-submit');
    this.loginError = page.getByTestId('login-error');
    this.emailError = page.getByTestId('email-error'); // VERIFY
    this.passwordError = page.getByTestId('password-error'); // VERIFY
    this.registerLink = page.getByTestId('register-link');

    this.forgotPasswordLink = page.getByTestId('forgot-password-link'); // VERIFY
    // The forgot-password form is on its own route, so its email field
    // does not clash with the login form's "email" field.
    this.forgotPasswordEmailInput = page.getByTestId('email'); // VERIFY
    this.forgotPasswordSubmitButton = page.getByTestId('forgot-password-submit'); // VERIFY
    this.forgotPasswordConfirmation = page.getByRole('alert');
    this.forgotPasswordError = page.getByTestId('email-error');
  }

  async login({ email, password }: Credentials): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async openRegistration(): Promise<void> {
    await this.registerLink.click();
  }

  async openForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async submitForgotPassword(email: string): Promise<void> {
    await this.forgotPasswordEmailInput.fill(email);
    await this.forgotPasswordSubmitButton.click();
  }

  /** Full flow: login page → forgot-password form → submit */
  async requestPasswordReset(email: string): Promise<void> {
    await this.openForgotPassword();
    await this.submitForgotPassword(email);
  }
}