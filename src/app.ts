import { LABS } from "./labs/catalog.js";
import { AppShell } from "./ui/app-shell.js";

const root = document.querySelector<HTMLElement>("#app");
if (root === null) {
  throw new Error("Missing #app mount point.");
}

const app = new AppShell(root, LABS);
app.start();

window.addEventListener("beforeunload", () => app.destroy(), { once: true });
