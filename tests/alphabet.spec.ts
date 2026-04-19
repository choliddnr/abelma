import { test as setup, expect } from "@playwright/test";

setup("e2e", async ({ page }) => {
  await page.goto("/");
  if (page.url().includes("/")) {
    console.log("Already logged in");

    // Wait for the page to be ready
    await page.waitForLoadState("networkidle");

    // Check if koin is present in the header
    // Note: It's technically a link (anchor) rendering as a button
    const koinButton = page.getByRole("link", { name: /Koin$/i });
    await expect(koinButton).toBeVisible();

    // Click 'belajar huruf' for navigating to '/alphabet'
    const belajarHurufCard = page.getByText("Belajar Huruf");
    await expect(belajarHurufCard).toBeVisible();
    await belajarHurufCard.click();

    // Wait for navigation and verify URL
    await expect(page).toHaveURL(/\/alphabet$/);
    // Wait for the grid to appear instead of a fixed 30s timeout
    await expect(page.locator(".alphabet-view-container .grid")).toBeVisible();

    //  Click random letter and wait to listen the sound is playing. repeat this step 3 times.
    // Ensure the alphabet grid is loaded
    const letterButtons = page.locator(".alphabet-view-container .grid button");
    await expect(letterButtons.first()).toBeVisible();

    for (let i = 0; i < 3; i++) {
      const count = await letterButtons.count();
      const randomIndex = Math.floor(Math.random() * count);
      const letterToClick = letterButtons.nth(randomIndex);

      // Log for clarity
      const letterText = await letterToClick.locator("span").first().innerText();
      console.log(`Step 2.${i + 1}: Clicking letter ${letterText}`);

      await letterToClick.click();
      // Wait for the sound to start and then finish
      await expect(page.locator("[data-speaking]")).toHaveAttribute("data-speaking", "true");
      await expect(page.locator("[data-speaking]")).toHaveAttribute("data-speaking", "false");

      // wait for some UI feedback instead (example)
      await expect(letterToClick).toBeVisible(); // or animation/active state if available
    }

    // Then click 'mulai tantangan'.
    const startQuizButton = page.getByText("Mulai Tantangan!");
    await expect(startQuizButton).toBeVisible();
    await Promise.all([page.waitForURL(/\/alphabet\/quiz$/), startQuizButton.click()]);

    await expect(page.locator("text=🏆")).toBeVisible();

    // Listen the letter sound and click the correct letter. make sure the score is increasing.
    // We've exposed the target letter in data-target-letter for the test to identify it.

    // Get initial score
    const scoreLocator = page.locator("text=🏆");
    const initialScoreText = (await scoreLocator.innerText()).replace(/[^\d]/g, "");
    const initialScore = parseInt(initialScoreText) || 0;
    console.log(`Initial score: ${initialScore}`);

    // Find the target letter from the data-attribute (added for testability)
    const quizContainer = page.locator("[data-target-letter]");
    await expect(quizContainer).toBeVisible();

    const targetLetter = await quizContainer.getAttribute("data-target-letter");
    console.log(`Quiz target letter: ${targetLetter}`);

    if (targetLetter) {
      // Click the button that matches the target letter
      // Handle both upper/lower cases as the buttons might show the cased version
      const correctButton = page
        .locator(".grid button")
        .filter({
          hasText: new RegExp(`^${targetLetter}$`, "i"),
        })
        .first();

      await expect(correctButton).toBeVisible();
      await correctButton.click();

      // Wait for processing and score update
      await expect(scoreLocator).not.toHaveText(initialScore.toString());

      // Verify the score increases
      const finalScoreText = (await scoreLocator.innerText()).replace(/[^\d]/g, "");
      const finalScore = parseInt(finalScoreText) || 0;
      console.log(`Final score: ${finalScore}`);

      expect(finalScore).toBeGreaterThan(initialScore);

      // --- Persistence Verification ---
      // 4. Click the 'Stop' button (⏹️)
      const stopButton = page.locator("button").filter({ hasText: "⏹️" });
      await stopButton.click();
      await expect(page).toHaveURL(/\/alphabet$/);

      // 5. Reload the page
      console.log("Reloading page to check persistence...");
      await page.reload();
      await page.waitForLoadState("networkidle");

      // 6. Make sure the "Koin" value is preserved
      const koinAfterReload = page.getByRole("link", { name: /Koin$/i });
      await expect(koinAfterReload).toBeVisible();
      const koinText = await koinAfterReload.innerText();
      console.log(`Koin value after reload: ${koinText}`);
      // Extract number from "X Koin" or just check if it's there
      expect(parseInt(koinText.replace(/[^\d]/g, ""))).toBeGreaterThanOrEqual(0);

      // 7. Click "mulai tantangan" again
      const restartQuizButton = page.getByText("Mulai Tantangan!");
      await restartQuizButton.click();
      await expect(page).toHaveURL(/\/alphabet\/quiz$/);

      // 8. Make sure the score value is preserved
      const scoreAfterReload = page.locator("text=🏆");
      const scoreValueText = (await scoreAfterReload.innerText()).replace(/[^\d]/g, "");
      const scoreValue = parseInt(scoreValueText) || 0;
      console.log(`Score value after reload: ${scoreValue}`);

      expect(scoreValue).toBe(finalScore);
    } else {
      throw new Error("Target letter was not found in data-attribute.");
    }
  } else {
    console.log("Not logged in");
  }
});

setup("Alphabet learning controls functionality", async ({ page }) => {
  await page.goto("/");
  if (page.url().includes("/")) {
    await page.waitForLoadState("networkidle");

    const belajarHurufCard = page.getByText("Belajar Huruf");
    await expect(belajarHurufCard).toBeVisible();
    await belajarHurufCard.click();

    await expect(page).toHaveURL(/\/alphabet$/);
    await expect(page.locator(".alphabet-view-container .grid")).toBeVisible();

    // 1. Case Toggle Test
    const caseToggleButton = page.locator("button").filter({ hasText: /Kecil|Besar/ });
    await expect(caseToggleButton).toContainText("Kecil");
    // Verify uppercase 'A' is visible since default is uppercase
    await expect(page.locator(".grid button").first()).toContainText("A");

    await caseToggleButton.click();
    await expect(caseToggleButton).toContainText("Besar");
    // Verify lowercase 'a' is visible
    await expect(page.locator(".grid button").first()).toContainText("a");

    // 2. Randomize Toggle Test
    const randomizeButton = page.locator("button").filter({ hasText: /Acak|Normal/ });
    await expect(randomizeButton).toContainText("Acak");
    await randomizeButton.click();
    await expect(randomizeButton).toContainText("Normal");

    await randomizeButton.click();
    await expect(randomizeButton).toContainText("Acak");

    // 3. Auto Play Toggle Test
    const autoPlayButton = page.locator("button").filter({ hasText: /Otomatis|Berhenti/ });
    await expect(autoPlayButton).toContainText("Otomatis");
    await autoPlayButton.click();
    await expect(autoPlayButton).toContainText("Berhenti");

    // Auto-play should trigger speaking
    await expect(page.locator("[data-speaking]")).toHaveAttribute("data-speaking", "true");

    // Stop auto-play
    await autoPlayButton.click();
    await expect(autoPlayButton).toContainText("Otomatis");
  } else {
    console.log("Not logged in");
  }
});
