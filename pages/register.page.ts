import type { Locator, Page } from '@playwright/test';
import type { Address, User } from '@data/user.factory';
import { BasePage } from '@pages/base.page';

export class RegisterPage extends BasePage {
  protected readonly path = '/auth/register';

  public readonly firstNameInput: Locator;
  public readonly lastNameInput: Locator;
  public readonly dateOfBirthInput: Locator;
  public readonly countrySelect: Locator;
  public readonly postalCodeInput: Locator;
  public readonly houseNumberInput: Locator;
  public readonly streetInput: Locator;
  public readonly cityInput: Locator;
  public readonly stateInput: Locator;
  public readonly phoneInput: Locator;
  public readonly emailInput: Locator;
  public readonly passwordInput: Locator;
  public readonly submitButton: Locator;
  public readonly registerError: Locator;

  constructor(page: Page) {
    super(page);

    this.firstNameInput = page.getByTestId('first-name');
    this.lastNameInput = page.getByTestId('last-name');
    this.dateOfBirthInput = page.getByTestId('dob'); // VERIFY: assumes <input type="date"> accepting YYYY-MM-DD
    this.countrySelect = page.getByTestId('country');
    this.postalCodeInput = page.getByTestId('postal_code'); // VERIFY: may be "postcode"
    this.houseNumberInput = page.getByTestId('house_number'); // VERIFY
    this.streetInput = page.getByTestId('street'); // VERIFY: older versions used "address"
    this.cityInput = page.getByTestId('city');
    this.stateInput = page.getByTestId('state');
    this.phoneInput = page.getByTestId('phone');
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('register-submit');
    this.registerError = page.getByTestId('register-error'); // VERIFY
  }

  async register(user: User): Promise<void> {
    await this.fillPersonalDetails(user);
    await this.fillAddress(user.address);
    await this.phoneInput.fill(user.phone);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.submitButton.click();
  }

  async fillPersonalDetails(user: Pick<User, 'firstName' | 'lastName' | 'dateOfBirth'>): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.dateOfBirthInput.fill(user.dateOfBirth);
  }

  /**
   * Strict order required by the site's address lookup:
   * country → postcode → house number → wait for street autofill → overwrite fields.
   */
  async fillAddress(address: Address, options: { autofillTimeout?: number } = {}): Promise<void> {
    await this.countrySelect.selectOption({ label: address.country });
    await this.postalCodeInput.fill(address.postalCode);
    await this.houseNumberInput.fill(address.houseNumber);

    await this.waitForStreetAutofill(options.autofillTimeout);

    // Autofilled values are unreliable (and State may stay empty) — overwrite all of them.
    await this.streetInput.fill(address.street);
    await this.cityInput.fill(address.city);
    await this.stateInput.fill(address.state);
  }

  /** Synchronization (not an assertion): resolves once the street input has a value */
  private async waitForStreetAutofill(timeout = 10_000): Promise<void> {
    const streetHandle = await this.streetInput.elementHandle();
    try {
      await this.page.waitForFunction(
        (el) => (el as HTMLInputElement).value.trim() !== '',
        streetHandle,
        { timeout },
      );
    } finally {
      await streetHandle?.dispose();
    }
  }
}