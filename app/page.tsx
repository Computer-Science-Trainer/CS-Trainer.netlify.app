import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { TelegramIcon } from "@/components/icons";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-5 py-8 md:py-16">
      <div className="inline-block max-w-xxl text-center justify-center">
        <span className={title({ color: "violet" })}>CS&nbsp;</span>
        <span className={title()}>
          Trainer
        </span>
        <div className={subtitle({ class: "mt-4" })}>
        Fundamental Computer Science, Algorithms and Data Structures
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
          Problems
        </Link>
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={siteConfig.links.github}
        >
          <TelegramIcon size={20} />
          Telegram-bot
        </Link>
      </div>

      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="bordered">
          <span>
            Get started by <Code color="primary">register or login</Code>
          </span>
        </Snippet>
      </div>
    </section>
  );
}
