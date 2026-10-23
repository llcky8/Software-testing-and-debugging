import { test, expect } from '@fixtures/pages.fixture';
import type { ProductCardInfo } from '@pages/product.page';

test.describe('Compare products', () => {
  test('name and price on the product detail page match the catalog for the first two products', async ({
    productPage,
  }) => {
    await productPage.goto();
    await expect(productPage.productCards).not.toHaveCount(0); // waits for the catalog to render

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