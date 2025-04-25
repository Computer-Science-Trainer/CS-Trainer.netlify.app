"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { User as UserComponent } from "@heroui/user";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Settings01Icon,
  ArrowRight01Icon,
  Globe02Icon,
} from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import { TelegramIcon, SearchIcon, Logo } from "@/components/icons";
import LoginWindow from "@/components/login";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { useAuth } from "@/context/auth";

export const SettingsDropdown = () => {
  const router = useRouter();

  const safeStopPropagation = (e: any) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
  };

  const switchLanguage = (lang: string) => {
    document.cookie = `NEXT_LOCALE=${lang}; path=/;`;
    router.refresh();
  };

  return (
    <Dropdown
      closeOnSelect={false}
      placement="bottom-end"
      shouldBlockScroll={false}
    >
      <DropdownTrigger>
        <Button isIconOnly aria-label="Settings" variant="light">
          <HugeiconsIcon
            className="text-default-500"
            icon={Settings01Icon}
            strokeWidth={2.5}
          />
        </Button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Settings menu">
        <DropdownItem key="toggle-theme" className="p-0">
          <div className="w-full">
            <ThemeSwitch />
          </div>
        </DropdownItem>

        <DropdownItem
          key="language"
          className="p-0"
          onMouseDown={safeStopPropagation}
          onPress={safeStopPropagation}
        >
          <Dropdown
            closeOnSelect={false}
            placement="right-start"
            shouldBlockScroll={false}
          >
            <DropdownTrigger
              onMouseDown={safeStopPropagation}
              onPress={safeStopPropagation}
            >
              <div className="flex items-center w-full gap-2 p-2 cursor-pointer">
                <HugeiconsIcon icon={Globe02Icon} />
                <span>Language</span>
                <div className="ml-auto">
                  <HugeiconsIcon icon={ArrowRight01Icon} />
                </div>
              </div>
            </DropdownTrigger>

            <DropdownMenu aria-label="Language selection">
              <DropdownItem
                key="en"
                onPress={(e) => {
                  safeStopPropagation(e);
                  switchLanguage("en");
                }}
              >
                <div className="flex items-center gap-2">
                  <span>English</span>
                </div>
              </DropdownItem>
              <DropdownItem
                key="ru"
                onPress={(e) => {
                  safeStopPropagation(e);
                  switchLanguage("ru");
                }}
              >
                <div className="flex items-center gap-2">
                  <span>Русский</span>
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export const Navbar = () => {
  const { user } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const t = useTranslations();

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">CS Trainer</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden sm:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {t(item.label)}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <Link
            isExternal
            aria-label="Telegram"
            href={siteConfig.links.telegram_bot}
          >
            <TelegramIcon className="text-default-500" />
          </Link>
          <SettingsDropdown />
        </NavbarItem>
        {user ? (
          <NextLink
            className="flex items-center gap-2 hover:bg-default-100 rounded-xl p-2 transition-colors duration-200 ease-in-out cursor-pointer"
            href={`/${user.username}`}
          >
            <UserComponent
              avatarProps={{
                radius: "full",
                size: "sm",
                src: user.avatar,
              }}
              description={user.email}
              name={user.username}
            />
          </NextLink>
        ) : (
          <Button color="primary" onPress={onOpen}>
            {t("nav.login")}
          </Button>
        )}
      </NavbarContent>
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle className="" />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href={item.href}
                size="lg"
              >
                {t(item.label)}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
      <LoginWindow isOpen={isOpen} onOpenChange={onOpenChange} />
    </HeroUINavbar>
  );
};
