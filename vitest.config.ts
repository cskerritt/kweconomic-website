import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Source pins read the stylesheet as text through `?raw`; vitest blanks CSS ids, ".css?raw" included, unless let through.
    css: { include: [/\.css\?raw\b/] },
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
