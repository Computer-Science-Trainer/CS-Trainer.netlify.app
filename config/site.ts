export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Next.js + HeroUI",
  description: "Make beautiful websites regardless of your design experience.",
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
    github: "https://github.com/heroui-inc/heroui",
    telegram_bot: "https://t.me/",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
