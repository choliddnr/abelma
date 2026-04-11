import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "e2e",
          include: ["test/e2e/*.{test,spec}.ts"],
          environment: "node",
        },
      },
      // You can add a unit test project later if needed:
      // {
      //   test: {
      //     name: 'unit',
      //     include: ['test/unit/*.{test,spec}.ts'],
      //     environment: 'nuxt', // or 'happy-dom'
      //   },
      // }
    ],
  },
});
