import { test, expect } from '@fixtures/pages.fixture';
import type { ProductCardInfo } from '@pages/product.page';

const CATALOG_LOAD_TIMEOUT = 20_000;

test.describe('Compare products', () => {
  test('name and price on the product detail page match the catalog for the first two products', async ({
    productPage,
  }) => {
    await productPage.goto();
    // The catalog is fetched from a public API that sometimes needs more than the default
    // 5 s expect timeout, so the first render gets a longer, explicit wait
    await expect(productPage.productCards.first()).toBeVisible({ timeout: CATALOG_LOAD_TIMEOUT });

    const names = await productPage.getAllProductNames();
    expect(names.length).toBeGreaterThanOrEqual(2);

    const catalogProducts: ProductCardInfo[] = [];
    for (const name of names.slice(0, 2)) {
      catalogProducts.push(await productPage.getProductCardInfo(name));
    }

    for (const catalogProduct of catalogProducts) {
      await productPage.goto();
      await productPage.openProduct(catalogProduct.name);

      await expect(productPage.productName).toHaveText(catalogProduct.name);
      expect(await productPage.getUnitPrice()).toBe(catalogProduct.price);
    }
  });
});