import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import jev from "./server/jev-plugin.ts";

export default defineConfig({
  plugins: [react(), tailwindcss(), jev()],
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
});
