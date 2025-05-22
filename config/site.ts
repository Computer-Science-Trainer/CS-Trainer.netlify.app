export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "CS Trainer",
  description: "",
  navItems: [
    {
      label: "nav.tests",
      href: "/tests",
    },
    {
      label: "nav.leaderboard",
      href: "/leaderboard",
    },
    {
      label: "nav.about",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "menu.profile",
      href: "/profile",
    },
    {
      label: "nav.tests",
      href: "/tests",
    },
    {
      label: "menu.leaderboard",
      href: "/leaderboard",
    },
    {
      label: "nav.about",
      href: "/about",
    },
  ],
  links: {
    telegram_bot: "https://t.me/CS_Trainer_bot",
  },
};
