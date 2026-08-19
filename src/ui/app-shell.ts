import { audioRuntime } from "../audio/audio-runtime.js";
import type { LabModule } from "../labs/types.js";
import { createDashboard, navStatusClass } from "./dashboard.js";
import { button, clear, el } from "./dom.js";

export class AppShell {
  private readonly root: HTMLElement;
  private readonly labs: readonly LabModule[];
  private readonly content: HTMLElement;
  private readonly nav: HTMLElement;
  private cleanupActiveView: (() => void) | undefined;

  public constructor(root: HTMLElement, labs: readonly LabModule[]) {
    this.root = root;
    this.labs = labs;
    this.nav = el("nav", { className: "sidebar-nav", attributes: { "aria-label": "Laboratories" } });
    this.content = el("main", { className: "main-content", id: "main-content" });
  }

  public start(): void {
    const sidebar = el(
      "aside",
      { className: "sidebar" },
      el(
        "a",
        { className: "brand", attributes: { href: "#/" } },
        el("span", { className: "brand-mark", text: "AG" }),
        el("span", { className: "brand-copy" }, el("strong", { text: "Aural Geometry" }), el("small", { text: "Mathematical Music Lab" })),
      ),
      el("span", { className: "sidebar-section-label", text: "Laboratories" }),
      this.nav,
      el(
        "div",
        { className: "sidebar-footer" },
        el("span", { text: "Foundation build" }),
        el("strong", { text: "v0.1.0" }),
      ),
    );

    const emergencyStop = button("Stop all audio", {
      className: "button button-quiet global-stop",
      onClick: () => audioRuntime.stopAll(),
    });
    const topbar = el(
      "header",
      { className: "topbar" },
      el("div", {}, el("span", { className: "topbar-program", text: "Aural Geometry Lab" }), el("span", { className: "topbar-phase", text: "MVP program start" })),
      emergencyStop,
    );

    const workspace = el("div", { className: "workspace" }, topbar, this.content);
    this.root.append(sidebar, workspace);
    this.renderNavigation();
    window.addEventListener("hashchange", this.handleRoute);
    this.handleRoute();
  }

  public destroy(): void {
    window.removeEventListener("hashchange", this.handleRoute);
    this.cleanupActiveView?.();
    audioRuntime.stopAll();
  }

  private readonly handleRoute = (): void => {
    this.cleanupActiveView?.();
    this.cleanupActiveView = undefined;
    audioRuntime.stopAll();
    clear(this.content);

    const route = window.location.hash.replace(/^#\/?/, "");
    this.updateActiveNavigation(route);
    if (route === "") {
      this.content.append(createDashboard(this.labs));
      document.title = "Aural Geometry Lab";
      this.content.scrollTo({ top: 0 });
      return;
    }

    const lab = this.labs.find((candidate) => candidate.id === route);
    if (lab === undefined) {
      this.content.append(
        el(
          "div",
          { className: "not-found" },
          el("span", { className: "eyebrow", text: "404" }),
          el("h1", { text: "That laboratory is not in the current catalog." }),
          el("a", { className: "button button-primary", text: "Return to program dashboard", attributes: { href: "#/" } }),
        ),
      );
      return;
    }

    document.title = `${lab.name} · Aural Geometry Lab`;
    try {
      this.cleanupActiveView = lab.mount(this.content);
    } catch (error) {
      this.content.append(
        el(
          "div",
          { className: "inline-error fatal-error" },
          el("strong", { text: "The lab failed to mount." }),
          el("pre", { text: error instanceof Error ? error.stack ?? error.message : String(error) }),
        ),
      );
    }
    this.content.scrollTo({ top: 0 });
  };

  private renderNavigation(): void {
    clear(this.nav);
    this.nav.append(
      el(
        "a",
        { className: "nav-item nav-home", attributes: { href: "#/", "data-route": "" } },
        el("span", { className: "nav-icon", text: "⌂" }),
        el("span", { text: "Program dashboard" }),
      ),
    );
    for (const [index, lab] of this.labs.entries()) {
      this.nav.append(
        el(
          "a",
          { className: "nav-item", attributes: { href: `#/${lab.id}`, "data-route": lab.id } },
          el("span", { className: "nav-index", text: String(index + 1).padStart(2, "0") }),
          el("span", { className: "nav-copy" }, el("strong", { text: lab.shortName }), el("small", { text: lab.category })),
          el("span", { className: navStatusClass(lab.status), title: lab.statusLabel }),
        ),
      );
    }
  }

  private updateActiveNavigation(route: string): void {
    for (const item of this.nav.querySelectorAll<HTMLAnchorElement>("[data-route]")) {
      item.classList.toggle("is-active", item.dataset["route"] === route);
    }
  }
}
