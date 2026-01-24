import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("unauthenticated user is redirected to sign-in page", async ({
    page,
  }) => {
    // Try to access the main app
    await page.goto("/");

    // Should be redirected to sign-in page
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("sign-in page displays Continue with Google button", async ({
    page,
  }) => {
    await page.goto("/auth/signin");

    // Check that the sign-in page is displayed
    await expect(page.getByText("Sign in")).toBeVisible();

    // Check for Google sign-in button
    const signInButton = page.getByRole("button", {
      name: /continue with google/i,
    });
    await expect(signInButton).toBeVisible();
  });

  test("clicking Google sign-in shows loading state", async ({ page }) => {
    await page.goto("/auth/signin");

    // Click the sign-in button
    const signInButton = page.getByRole("button", {
      name: /continue with google/i,
    });

    // Click and verify loading state shows
    await signInButton.click();

    // The button becomes disabled and shows "Signing in..."
    await expect(page.getByText(/signing in/i)).toBeVisible({ timeout: 3000 });
  });

  test("protected routes redirect unauthenticated users", async ({ page }) => {
    // Try to access items page directly
    await page.goto("/items");
    await expect(page).toHaveURL(/\/auth\/signin/);

    // Try to access scan page directly
    await page.goto("/scan");
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("error page displays when auth fails", async ({ page }) => {
    // Navigate to auth error page with a simulated error
    await page.goto("/auth/error?error=OAuthCallback");

    // Check error message is displayed
    await expect(page.getByText(/sign-in error/i)).toBeVisible();
    await expect(page.getByText(/google sign-in failed/i)).toBeVisible();
    await expect(page.getByText(/back to sign in/i)).toBeVisible();
  });

  test("sign-in page is accessible on mobile viewport", async ({ page }) => {
    await page.goto("/auth/signin");

    // Verify viewport is mobile-sized (Pixel 5 or iPhone 12 as per config)
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThan(500);

    // Check that UI elements are visible and accessible
    await expect(page.getByText("Sign in")).toBeVisible();
    const signInButton = page.getByRole("button", {
      name: /continue with google/i,
    });
    await expect(signInButton).toBeVisible();

    // Button should be clickable (not hidden or obscured)
    await expect(signInButton).toBeEnabled();
  });

  test("sign-in page helper text is visible", async ({ page }) => {
    await page.goto("/auth/signin");

    // Check that helper text is displayed
    await expect(
      page.getByText(/continue with google to start using letgo/i)
    ).toBeVisible();
  });

  test("error page has back to sign in button", async ({ page }) => {
    await page.goto("/auth/error?error=AccessDenied");

    // Check for back button
    const backButton = page.getByRole("link", { name: /back to sign in/i });
    await expect(backButton).toBeVisible();

    // Clicking should go back to sign-in
    await backButton.click();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("different error types show appropriate messages", async ({ page }) => {
    // Test OAuthCallback error
    await page.goto("/auth/error?error=OAuthCallback");
    await expect(page.getByText(/google sign-in failed/i)).toBeVisible();

    // Test AccessDenied error
    await page.goto("/auth/error?error=AccessDenied");
    await expect(page.getByText(/access denied/i)).toBeVisible();

    // Test Configuration error
    await page.goto("/auth/error?error=Configuration");
    await expect(page.getByText(/not configured correctly/i)).toBeVisible();

    // Test default error
    await page.goto("/auth/error?error=Unknown");
    await expect(page.getByText(/something went wrong/i)).toBeVisible();
  });
});
