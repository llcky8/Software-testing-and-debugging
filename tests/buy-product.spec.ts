import { test, expect } from '@fixtures/pages.fixture';
import { createAddress } from '@data/user.factory';

test.describe('Buy product', () => {
  test('a signed-in customer can buy a product and sees a payment success confirmation', async ({
    loggedInCustomer, // activates registration + sign-in of a fresh user before the test body
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    await productPage.goto();
    const productName = await productPage.openFirstInStockProduct();

    // Guard with a clear failure if the product's stock state changed after selection
    await expect(productPage.addToCartButton).toBeEnabled();
    await productPage.addToCart();

    // The cart belongs to this test's fresh browser context, so its contents are owned by this test
    await expect(productPage.cartQuantity).toHaveText('1');

    await productPage.openCart();
    await expect(cartPage.cartRow(productName)).toBeVisible();
    await expect(cartPage.quantityInput(productName)).toHaveValue('1');
    await cartPage.proceedToCheckout();

    await checkoutPage.continueAsSignedIn();

    // Overwrite the profile-prefilled billing address with generated data so every required field is set
    await checkoutPage.fillBillingAddress(createAddress());
    await expect(checkoutPage.proceedToPaymentButton).toBeEnabled();
    await checkoutPage.continueToPayment();

    // Payment method: "Cash on Delivery" — the simplest option, it requires no extra input fields
    await checkoutPage.payWithCashOnDelivery();

    await expect(checkoutPage.paymentSuccessMessage).toBeVisible();

    // TODO-ORACLE: the final order placement (checkoutPage.placeOrder()) has no specified
    // expected result, so the scenario stops at the payment success confirmation.
  });
});