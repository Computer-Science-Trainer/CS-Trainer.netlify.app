import React from "react";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";

export interface SelectedTopicsProps {
  topics: string[];
  emptyLabel: string;
  onReset: () => void;
}

export const SelectedTopics: React.FC<SelectedTopicsProps> = ({
  topics,
  emptyLabel,
  onReset,
}) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col h-40 bg-white dark:bg-zinc-900 border-3 border-gray-200 dark:border-zinc-800 rounded-2xl overflow-y-auto">
      <div className="flex-1 overflow-y-auto">
        {topics.length > 0 ? (
          <ul className="p-3 list-disc text-sm text-gray-700 dark:text-gray-200">
            {topics.map((topic) => (
              <li key={topic} className="truncate">
                {t(`tests.topics.${topic}`)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-3 text-sm text-gray-400 italic">{emptyLabel}</p>
        )}
      </div>
      {topics.length > 0 && (
        <div className="mt-auto p-2">
          <Button
            className="w-full"
            size="sm"
            variant="ghost"
            onPress={onReset}
          >
            Сбросить
          </Button>
        </div>
      )}
    </div>
  );
};
