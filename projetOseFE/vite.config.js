import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { ViteToml } from "vite-plugin-toml";

export default defineConfig({
  plugins: [tailwindcss(), react(), ViteToml()],
});
