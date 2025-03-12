export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "CS Trainer",
  description: "Interactive learning platform designed to help you grasp the computer science",
  navItems: [
    {
      label: "Problems",
      href: "/problems",
    },
    {
      label: "News",
      href: "/news",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Rating",
      href: "/rating",
    },
    {
      label: "Problems",
      href: "/problems",
    },
    {
      label: "News",
      href: "/news",
    },
    {
        label: "About",
        href: "/news",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    telegram_bot: "https://t.me/CS_Trainer_bot",
  },
};
