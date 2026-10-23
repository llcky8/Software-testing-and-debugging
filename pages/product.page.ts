import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export interface ProductCardInfo {
  name: string;
  price: number;
}

/** Converts "$14.15" → 14.15 */
const parsePrice = (text: string | null): number => {
  const value = Number.parseFloat((text ?? '').replace(/[^0-9.]/g, ''));
  if (Number.isNaN(value)) {
    throw new Error(`Cannot parse price from "${text}"`);
  }
  return value;
};

/**
 * Covers both the catalog (home page product grid) and the product detail page.
 */
export class ProductPage extends BasePage {
  protected readonly path = '/';

  // --- Catalog ---
  public readonly searchInput: Locator;
  public readonly searchSubmitButton: Locator;
  public readonly sortSelect: Locator;
  /** All product cards; ids look like "product-<26-char ULID>" */
  public readonly productCards: Locator;
  public readonly productCardNames: Locator;

  // --- Product detail ---
  public readonly productName: Locator;
  public readonly unitPrice: Locator;
  public readonly description: Locator;
  public readonly quantityInput: Locator;
  public readonly increaseQuantityButton: Locator;
  public readonly decreaseQuantityButton: Locator;
  public readonly addToCartButton: Locator;
  public readonly addToFavoritesButton: Locator;
  /** Toast notification shown after adding to cart */
  public readonly toast: Locator;

  constructor(page: Page) {
    super(page);

    this.searchInput = page.getByTestId('search-query');
    this.searchSubmitButton = page.getByTestId('search-submit');
    this.sortSelect = page.getByTestId('sort');
    this.productCards = page.getByTestId(/^product-[0-9A-Z]{26}$/); // VERIFY: card id format
    this.productCardNames = this.productCards.getByTestId('product-name');

    this.productName = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.description = page.getByTestId('product-description'); // VERIFY
    this.quantityInput = page.getByTestId('quantity');
    this.increaseQuantityButton = page.getByTestId('increase-quantity');
    this.decreaseQuantityButton = page.getByTestId('decrease-quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.addToFavoritesButton = page.getByTestId('add-to-favorites');
    this.toast = page.getByRole('alert'); // VERIFY: toast container role
  }

  // --- Catalog ---

  /** A single product card, matched by its exact name */
  productCard(name: string): Locator {
    return this.productCards.filter({
      has: this.page.getByTestId('product-name').filter({ hasText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`) }),
    });
  }

  productCardPrice(name: string): Locator {
    return this.productCard(name).getByTestId('product-price');
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchSubmitButton.click();
  }

  /** Reads name and price from a product card */
  async getProductCardInfo(name: string): Promise<ProductCardInfo> {
    const card = this.productCard(name);
    const cardName = (await card.getByTestId('product-name').textContent())?.trim() ?? '';
    const price = parsePrice(await card.getByTestId('product-price').textContent());
    return { name: cardName, price };
  }

  /** Names of all currently rendered product cards */
  async getAllProductNames(): Promise<string[]> {
    return (await this.productCardNames.allTextContents()).map((n) => n.trim());
  }

  /** Clicks a product card and waits for the detail page URL */
  async openProduct(name: string): Promise<void> {
    await this.productCard(name).click();
    await this.page.waitForURL(/\/product\//);
  }

  /**
   * Opens the first catalog card that has no out-of-stock marker and returns its name.
   * `.first()` is used deliberately: "first in-stock" is the requirement, and specs never
   * assert on catalog order. textContent() auto-waits until such a card is rendered.
   */
  async openFirstInStockProduct(): Promise<string> {
    const firstInStockCard = this.productCards
      .filter({ hasNot: this.page.getByTestId('out-of-stock') })
      .first();

    const name = (await firstInStockCard.getByTestId('product-name').textContent())?.trim() ?? '';
    if (!name) {
      throw new Error('First in-stock product card has an empty name');
    }

    await firstInStockCard.click();
    await this.page.waitForURL(/\/product\//);
    return name;
  }

  // --- Product detail ---

  async getUnitPrice(): Promise<number> {
    return parsePrice(await this.unitPrice.textContent());
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart(quantity = 1): Promise<void> {
    if (quantity !== 1) {
      await this.setQuantity(quantity);
    }
    await this.addToCartButton.click();
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}