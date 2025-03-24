import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { TelegramIcon } from "@/components/icons";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();

  return (
    <section className="flex flex-col items-center justify-center gap-5 py-8 md:py-16">
      <div className="inline-block max-w-xxl text-center justify-center">
        <span className={title({ color: "violet" })}>Computer Science&nbsp;</span>
        <span className={title()}>
          Trainer
        </span>
        <div className={subtitle({ class: "mt-4" })}>
            <h1>{t("subtitle")}</h1>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
          href="/problems"
        >
        <h1>{t("problems")}</h1>
        </Link>
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={siteConfig.links.telegram_bot}
        >
          <TelegramIcon size={20} />
            <h1>{t("telegramBot")}</h1>
        </Link>
      </div>
    </section>
  );
}
