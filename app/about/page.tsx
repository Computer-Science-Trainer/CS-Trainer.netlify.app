import { title } from "@/components/primitives";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon, BookOpenIcon, Mail02Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations();
  return (
    <div className="max-w-6xl mx-auto leading-relaxed">
      <h1 className={title()}>{t("about.title")}</h1>
      <p className="mt-4 text-lg leading-7">
        {t("about.description")}
      </p>
      <ul className="list-none mt-4 text-base space-y-1">
        <li className="flex items-center gap-2 text-left">
          <HugeiconsIcon icon={BookOpenIcon} className="text-xl text-primary" />
          {t("about.features.tests")}
        </li>
        <li className="flex items-center gap-2 text-left">
          <HugeiconsIcon icon={InformationCircleIcon} className="text-xl text-primary" />
          {t("about.features.feedback")}
        </li>
      </ul>
      <div className="mt-8">
        <p className="font-semibold text-lg">{t("about.contacts")}:</p>
        <p className="flex items-center gap-2 mt-2">
          <HugeiconsIcon icon={Mail02Icon} className="text-xl text-primary" />
          info@cs-trainer.netlify.app
        </p>
      </div>
    </div>
  );
}
