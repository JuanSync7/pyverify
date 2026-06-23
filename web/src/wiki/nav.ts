// Sidebar structure for the wiki. Order here is the order a newcomer should
// read: hook first, understand the model, then reference, then go hands-on.

export interface NavItem {
  to: string;
  label: string;
  /** index route (exact match) */
  end?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    title: "Start here",
    items: [
      { to: "/", label: "Overview", end: true },
      { to: "/start", label: "Get started" },
    ],
  },
  {
    title: "Understand",
    items: [
      { to: "/concepts", label: "Why multi-dimensional" },
      { to: "/pipeline", label: "The pipeline" },
      { to: "/steps", label: "The seven steps" },
    ],
  },
  {
    title: "Reference",
    items: [
      { to: "/tools", label: "Deterministic tools" },
      { to: "/agents", label: "Agents & backends" },
      { to: "/config", label: "Configuration" },
    ],
  },
  {
    title: "Try it",
    items: [
      { to: "/playground", label: "Playground" },
      { to: "/tutorials", label: "Tutorials" },
    ],
  },
];

export const GITHUB_URL = "https://github.com/JuanSync7/pyverify";
