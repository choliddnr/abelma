import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // 1. Perform automated login
  console.log("Navigating to login page...");
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  if (page.url().includes("/login")) {
    console.log("Filling login form...");
    await page.getByPlaceholder("Username").fill("wadidaw");
    await page.getByPlaceholder("Kata Sandi").fill("12341234");
    await page.getByRole("button", { name: /Masuk Sekarang/i }).click();

    // Wait for the login to complete and redirect
    await page.waitForURL(
      (url) => url.pathname === "/" || url.pathname.startsWith("/welcome"),
      {
        timeout: 30000,
      },
    );
  } else {
    console.log("Already logged in, skipped login form.");
  }

  // Final wait for the page to settle
  await page.waitForLoadState("networkidle");

  // Save the authentication state to the file
  await page.context().storageState({ path: authFile });
  console.log("Temporary session saved.");

  // 3. Handle mandatory profile creation if at /welcome
  // Navigate to root to trigger redirect check
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  if (page.url().includes("/welcome")) {
    console.log("Redirected to welcome page. Creating a default profile...");
    await page.getByPlaceholder(/Andi, Susi/i).fill("Test Explorer");
    await page.getByRole("button", { name: /Mulai Petualangan/i }).click();

    // Wait for redirect back to home
    await page.waitForURL((url) => url.pathname === "/", { timeout: 30000 });
    await page.waitForLoadState("networkidle");

    // Save the finalized session state
    await page.context().storageState({ path: authFile });
    console.log("Profile created and session finalized!");
  }

  console.log("Login successful! Session saved to", authFile);
});
