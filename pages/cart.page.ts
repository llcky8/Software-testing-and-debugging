import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

/** Step 1 of the checkout wizard (the cart) */
export class CartPage extends BasePage {
  protected readonly path = '/checkout';

  public readonly cartRows: Locator;
  public readonly cartTotal: Locator;
  public readonly proceedToCheckoutButton: Locator;

  constructor(page: Page) {
    super(page);

    // Rows containing a product title, so header/footer rows are excluded
    this.cartRows = page.getByRole('row').filter({ has: page.getByTestId('product-title') });
    this.cartTotal = page.getByTestId('cart-total');
    this.proceedToCheckoutButton = page.getByTestId('proceed-1');
  }

  cartRow(productName: string): Locator {
    return this.cartRows.filter({
      has: this.page.getByTestId('product-title').filter({ hasText: productName }),
    });
  }

  quantityInput(productName: string): Locator {
    return this.cartRow(productName).getByTestId('product-quantity');
  }

  unitPrice(productName: string): Locator {
    return this.cartRow(productName).getByTestId('product-price');
  }

  lineTotal(productName: string): Locator {
    return this.cartRow(productName).getByTestId('line-price');
  }

  removeButton(productName: string): Locator {
    // VERIFY: icon-only delete button with no data-test; assumes it's the only button in the row
    return this.cartRow(productName).getByRole('button');
  }

  async updateQuantity(productName: string, quantity: number): Promise<void> {
    const input = this.quantityInput(productName);
    await input.fill(String(quantity));
    await input.press('Tab'); // VERIFY: triggers the (change) handler that recalculates totals
  }

  async removeItem(productName: string): Promise<void> {
    await this.removeButton(productName).click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
  }
}