"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@heroui/react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Custom404Page() {
  const router = useRouter();
  const t = useTranslations("notFound");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center px-4"
    >
      <Card className="p-8 text-center max-w-md w-full p-6">
        <h1 className="text-6xl font-bold mb-4">{t("title")}</h1>
        <p className="text-default-500 mb-6" dangerouslySetInnerHTML={{ __html: t("description") }} />
        <Button color="primary" onPress={() => router.push("/")}>{t("button")}</Button>
      </Card>
    </motion.div>
  );
}