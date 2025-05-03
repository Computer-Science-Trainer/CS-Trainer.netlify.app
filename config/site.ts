export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "CS Trainer",
  description: "site.description",
  navItems: [
    {
      label: "nav.problems",
      href: "/problems",
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
      label: "nav.problems",
      href: "/problems",
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
