import type { Locator, Page } from '@playwright/test';
import type { Address, Credentials } from '@data/user.factory';
import { BasePage } from '@pages/base.page';

export type PaymentMethod =
  | 'Bank Transfer'
  | 'Cash on Delivery'
  | 'Credit Card'
  | 'Buy Now Pay Later'
  | 'Gift Card'; // VERIFY: exact option labels

export interface CreditCardDetails {
  number: string;
  /** Format MM/YYYY */
  expirationDate: string;
  cvv: string;
  holderName: string;
}

/** Steps 2–4 of the checkout wizard: sign-in, billing address, payment */
export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout';

  // --- Step 2: sign in ---
  public readonly emailInput: Locator;
  public readonly passwordInput: Locator;
  public readonly loginButton: Locator;
  public readonly loginError: Locator;
  public readonly proceedToBillingButton: Locator;

  // --- Step 3: billing address ---
  public readonly streetInput: Locator;
  public readonly houseNumberInput: Locator;
  public readonly postalCodeInput: Locator;
  public readonly cityInput: Locator;
  public readonly stateInput: Locator;
  public readonly countryField: Locator;
  public readonly proceedToPaymentButton: Locator;

  // --- Step 4: payment ---
  public readonly paymentMethodSelect: Locator;
  public readonly creditCardNumberInput: Locator;
  public readonly expirationDateInput: Locator;
  public readonly cvvInput: Locator;
  public readonly cardHolderNameInput: Locator;
  public readonly confirmButton: Locator;
  public readonly paymentSuccessMessage: Locator;
  public readonly orderConfirmation: Locator;

  constructor(page: Page) {
    super(page);

    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-submit');
    this.loginError = page.getByTestId('login-error');
    this.proceedToBillingButton = page.getByTestId('proceed-2');

    this.streetInput = page.getByTestId('street'); // VERIFY
    this.houseNumberInput = page.getByTestId('house_number'); // VERIFY
    this.postalCodeInput = page.getByTestId('postal_code'); // VERIFY
    this.cityInput = page.getByTestId('city');
    this.stateInput = page.getByTestId('state');
    this.countryField = page.getByTestId('country'); // VERIFY: <select> or text input on this step
    this.proceedToPaymentButton = page.getByTestId('proceed-3');

    this.paymentMethodSelect = page.getByTestId('payment-method');
    this.creditCardNumberInput = page.getByTestId('credit_card_number');
    this.expirationDateInput = page.getByTestId('expiration_date');
    this.cvvInput = page.getByTestId('cvv');
    this.cardHolderNameInput = page.getByTestId('card_holder_name');
    this.confirmButton = page.getByTestId('finish');
    this.paymentSuccessMessage = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.getByTestId('order-confirmation'); // VERIFY: unconfirmed attribute
  }

  // --- Step 2 ---

  /** Sign in from the checkout wizard, then continue to billing */
  async signIn({ email, password }: Credentials): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.proceedToBillingButton.click();
  }

  /** For a user who is already logged in */
  async continueAsSignedIn(): Promise<void> {
    await this.proceedToBillingButton.click();
  }

  // --- Step 3 ---

  /** Overwrites the billing address (prefilled from the user profile) */
  async fillBillingAddress(address: Address): Promise<void> {
    await this.setCountry(address.country);
    await this.postalCodeInput.fill(address.postalCode);
    await this.houseNumberInput.fill(address.houseNumber);
    await this.streetInput.fill(address.street);
    await this.cityInput.fill(address.city);
    await this.stateInput.fill(address.state);
  }

  async continueToPayment(): Promise<void> {
    await this.proceedToPaymentButton.click();
  }

  // --- Step 4 ---

  async selectPaymentMethod(method: PaymentMethod): Promise<void> {
    await this.paymentMethodSelect.selectOption({ label: method });
  }

  async fillCreditCard(card: CreditCardDetails): Promise<void> {
    await this.creditCardNumberInput.fill(card.number);
    await this.expirationDateInput.fill(card.expirationDate);
    await this.cvvInput.fill(card.cvv);
    await this.cardHolderNameInput.fill(card.holderName);
  }

  /** First "Confirm" click: submits payment and shows the success message */
  async confirmPayment(): Promise<void> {
    await this.confirmButton.click();
  }

  /** Second "Confirm" click: places the order and shows the confirmation/invoice */
  async placeOrder(): Promise<void> {
    await this.confirmButton.click(); // VERIFY: same data-test reused for the final confirm
  }

  async payWithCreditCard(card: CreditCardDetails): Promise<void> {
    await this.selectPaymentMethod('Credit Card');
    await this.fillCreditCard(card);
    await this.confirmPayment();
  }

  async payWithCashOnDelivery(): Promise<void> {
    await this.selectPaymentMethod('Cash on Delivery');
    await this.confirmPayment();
  }

  /**
   * The country field may be a <select> or a text input depending on app version,
   * so detect it at runtime instead of guessing.
   */
  private async setCountry(country: string): Promise<void> {
    const tagName = await this.countryField.evaluate((el) => el.tagName);
    if (tagName === 'SELECT') {
      await this.countryField.selectOption({ label: country });
    } else {
      await this.countryField.fill(country);
    }
  }
}