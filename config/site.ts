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
      label: "nav.news",
      href: "/news",
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
      label: "menu.rating",
      href: "/rating",
    },
    {
      label: "nav.problems",
      href: "/problems",
    },
    {
      label: "nav.news",
      href: "/news",
    },
    {
      label: "nav.about",
      href: "/about",
    },
    {
      label: "menu.logout",
      href: "/logout",
    },
  ],
  links: {
    telegram_bot: "https://t.me/CS_Trainer_bot",
  },
};
