import { defineConfig } from "litmus";

export default defineConfig({
  baseUrl: "http://localhost:3000",
  devCommand: "PORT=3000 npm run dev",
  model: "claude-opus-4-6"
});
