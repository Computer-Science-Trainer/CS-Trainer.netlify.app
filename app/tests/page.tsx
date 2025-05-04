"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionItem,
  CheckboxGroup,
  Checkbox,
  Card,
  CardFooter,
  Button,
  CardHeader,
  CardBody,
  Tabs,
  Tab,
  Spinner,
  addToast,
} from "@heroui/react";
import { useTranslations } from "next-intl";

import QuestionForm from "../../components/tests/QuestionForm";

import { makeApiRequest } from "@/config/api";

export interface AccordionState {
  label: string;
  options: string[];
  isSelected: boolean;
  selectedOptions: string[];
  description?: string;
}

export interface TopicState {
  label: string;
  accordions: AccordionState[];
}

// Константы
const TopicAccordions = ({
  t,
  topics,
  onAccordionChange,
  onCheckboxGroupChange,
  isCompact,
}: {
  t: ReturnType<typeof useTranslations>;
  topics: TopicState[];
  onAccordionChange: (
    topicIdx: number,
    accIdx: number,
    isSelected: boolean,
  ) => void;
  onCheckboxGroupChange: (
    topicIdx: number,
    accIdx: number,
    selected: string[],
  ) => void;
  isCompact: boolean;
}) => (
  <>
    {topics.map((topic, topicIndex) => (
      <Card key={topicIndex} className="mb-4" shadow="sm">
        <CardBody className="flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 dark:from-slate-900 dark:to-emerald-900">
          <h2 className="text-lg font-semibold mb-4 mt-3">
            {t(`tests.topics.${topic.label}`)}
          </h2>
          <div className="w-full flex flex-col gap-2">
            {topic.accordions.map((acc, accIndex) =>
              acc.options.length === 0 ? (
                <div key={accIndex} className="px-2">
                  <Card
                    isPressable
                    className="shadow-md w-full cursor-pointer select-none transition-none"
                    shadow="sm"
                    style={{ transform: "none" }}
                    onPress={(e) => {
                      if (
                        e.target instanceof HTMLElement &&
                        (e.target.closest("label") ||
                          e.target.tagName === "INPUT")
                      )
                        return;
                      onAccordionChange(topicIndex, accIndex, !acc.isSelected);
                    }}
                  >
                    <CardBody className="p-0">
                      <div className="flex w-full h-full gap-2 items-center px-4 py-3">
                        <Checkbox
                          className="pointer-events-auto"
                          color="primary"
                          isSelected={acc.isSelected}
                          onValueChange={(isSelected) =>
                            onAccordionChange(topicIndex, accIndex, isSelected)
                          }
                        />
                        <span className="text-md flex-1 text-left">
                          {t(`tests.topics.${acc.label}`)}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              ) : (
                <Accordion
                  key={accIndex}
                  className="w-full"
                  isCompact={isCompact}
                  variant="splitted"
                >
                  <AccordionItem
                    key={accIndex}
                    aria-label={`Accordion ${accIndex}`}
                    title={
                      <div className="flex items-center gap-2">
                        <Checkbox
                          isSelected={acc.isSelected}
                          onValueChange={(isSelected) =>
                            onAccordionChange(topicIndex, accIndex, isSelected)
                          }
                        />
                        <span>{t(`tests.topics.${acc.label}`)}</span>
                      </div>
                    }
                  >
                    <CheckboxGroup
                      value={acc.selectedOptions}
                      onValueChange={(selected) =>
                        onCheckboxGroupChange(topicIndex, accIndex, selected)
                      }
                    >
                      {acc.options.map((option) => (
                        <Checkbox key={option} value={option}>
                          {t(`tests.topics.${option}`)}
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                  </AccordionItem>
                </Accordion>
              ),
            )}
          </div>
        </CardBody>
      </Card>
    ))}
  </>
);

function useWindowWidth(defaultWidth = 1024) {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : defaultWidth,
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

function countSelected(topics: TopicState[]) {
  return topics.reduce(
    (acc, topic) =>
      acc +
      topic.accordions.reduce(
        (sum, accItem) =>
          sum +
          (accItem.options.length === 0
            ? accItem.isSelected
              ? 1
              : 0
            : accItem.selectedOptions.length),
        0,
      ),
    0,
  );
}

export default function TestsPage() {
  const t = useTranslations();
  const [topicStates, setTopicStates] = useState<TopicState[]>([]);
  const [asTopicStates, setAsTopicStates] = useState<TopicState[]>([]);
  const [loading, setLoading] = useState(true);
  const windowWidth = useWindowWidth();
  const isCompact = windowWidth < 640;

  useEffect(() => {
    setLoading(true);
    makeApiRequest("api/topics", "GET")
      .then((data: any[]) => {
        const getTopics = (label: string) =>
          data.find((t) => t.label === label)?.accordions || [];
        const mapToState = (items: any[]): TopicState[] =>
          items.map((item) => ({
            label: typeof item === "string" ? item : item.label,
            accordions: Array.isArray(item.accordions)
              ? item.accordions.map((sub: any) => ({
                  label: typeof sub === "string" ? sub : sub.label,
                  options: Array.isArray(sub.accordions) ? sub.accordions : [],
                  isSelected: false,
                  selectedOptions: [],
                  description: sub.description,
                }))
              : [],
          }));

        setTopicStates(mapToState(getTopics("fundamentals")));
        setAsTopicStates(mapToState(getTopics("algorithms")));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        addToast({
          title: t("tests.errors.ErrorTitle"),
          description: t("tests.errors.loadErrorDescription"),
          color: "danger",
        });
      });
  }, [t]);

  const updateTopic =
    (setter: typeof setTopicStates) =>
    (
      topicIdx: number,
      accIdx: number,
      updater: (acc: AccordionState) => AccordionState,
    ) => {
      setter((prev) =>
        prev.map((topic, tIdx) =>
          tIdx === topicIdx
            ? {
                ...topic,
                accordions: topic.accordions.map((acc, aIdx) =>
                  aIdx === accIdx ? updater(acc) : acc,
                ),
              }
            : topic,
        ),
      );
    };
  const handleCheckboxGroupChange =
    (setter: typeof setTopicStates) =>
    (topicIdx: number, accIdx: number, selected: string[]) => {
      updateTopic(setter)(topicIdx, accIdx, (acc) => ({
        ...acc,
        selectedOptions: selected,
        isSelected: selected.length === acc.options.length,
      }));
    };
  const handleAccordionChange =
    (setter: typeof setTopicStates) =>
    (topicIdx: number, accIdx: number, isSelected: boolean) => {
      updateTopic(setter)(topicIdx, accIdx, (acc) => ({
        ...acc,
        isSelected,
        selectedOptions: isSelected ? acc.options : [],
      }));
    };
  const handleResetSelections = () => {
    setTopicStates((prev) =>
      prev.map((topic) => ({
        ...topic,
        accordions: topic.accordions.map((acc) => ({
          ...acc,
          isSelected: false,
          selectedOptions: [],
        })),
      })),
    );
    setAsTopicStates((prev) =>
      prev.map((topic) => ({
        ...topic,
        accordions: topic.accordions.map((acc) => ({
          ...acc,
          isSelected: false,
          selectedOptions: [],
        })),
      })),
    );
  };

  const sectionRefs = useRef<HTMLDivElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollToSection = (index: number) => {
    const target = sectionRefs.current[index];

    if (target) {
      const start = window.scrollY;
      const end = target.offsetTop;
      const duration = 400;
      const startTime = performance.now();
      const animateScroll = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress < 1 ? 1 - Math.pow(1 - progress, 3) : 1;

        window.scrollTo(0, start + (end - start) * ease);
        if (progress < 1) requestAnimationFrame(animateScroll);
      };

      requestAnimationFrame(animateScroll);
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const center = window.scrollY + window.innerHeight / 2;
      const newIndex = sectionRefs.current.findIndex((sec) => {
        const top = sec.offsetTop;
        const bottom = top + sec.offsetHeight;

        return center >= top && center < bottom;
      });

      if (newIndex !== -1 && newIndex !== currentIndex)
        setCurrentIndex(newIndex);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [currentIndex]);

  const totalFI = countSelected(topicStates);
  const totalAS = countSelected(asTopicStates);
  const totalSelected = totalFI + totalAS;

  const recommendedSubsAll = topicStates.flatMap((topic, tIdx) =>
    topic.accordions.map((acc, aIdx) => ({
      label: acc.label,
      description: acc.description,
      topicIndex: tIdx,
      accIndex: aIdx,
    })),
  );
  const recommendedSubs =
    windowWidth < 640
      ? recommendedSubsAll.slice(0, 3)
      : recommendedSubsAll.slice(0, 6);

  return (
    <section className="max-w-7xl mx-auto p-4 flex gap-4 flex-col lg:flex-row lg:gap-4 items-start justify-center">
      {/* Левая панель */}
      <aside className="hidden lg:block w-[185px] flex-shrink-0 sticky top-32 h-fit self-start">
        <div className="mt-8 pl-4">
          <div className="relative flex flex-col items-start">
            <div className="absolute inset-y-6 left-2 w-[2px] bg-gray-300 dark:bg-gray-600 z-0" />
            {[
              "Рекомендованное Вам",
              "Создание собственного варианта",
              "Предложить вопрос",
            ].map((label, idx) => (
              <button
                key={label}
                className={`relative flex items-center gap-3 mb-4 transition-colors transition-shadow duration-150 text-left ${idx === currentIndex ? "bg-gray-100 dark:bg-gray-800 p-2 rounded-lg" : ""}`}
                onClick={() => scrollToSection(idx)}
              >
                <div
                  className={`z-10 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${idx === currentIndex ? "border-blue-500 bg-blue-500 animate-ping-slow" : "border-gray-300 bg-white dark:bg-gray-700"}`}
                />
                <span
                  className={`text-sm transition-colors ${idx === currentIndex ? "text-black dark:text-white font-semibold" : "text-gray-600 dark:text-gray-400"}`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
      {/* Центральная панель */}
      <aside className="flex flex-col items-center justify-center w-full">
        <div className="w-full">
          {/* Рекомендованное Вам */}
          <div
            ref={(el) => {
              if (el) sectionRefs.current[0] = el;
            }}
            className="mb-8 scroll-mt-24"
          >
            <h1 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              Рекомендованные тесты
            </h1>
            <Card className="mb-4 mt-4">
              <CardBody className="flex flex-col items-center justify-center gap-11">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                  {recommendedSubs.map((sub, idx) => (
                    <Card
                      key={idx}
                      isPressable
                      className="group relative overflow-hidden cursor-pointer p-0 bg-gradient-to-r from-purple-300 via-pink-300 to-red-300 dark:from-slate-800 dark:to-emerald-800 transition-shadow duration-200 hover:shadow-lg min-h-[220px] w-full max-w-[340px] mx-auto rounded-b-2xl"
                      shadow="sm"
                      style={{
                        minHeight: 220,
                        width: "100%",
                        maxWidth: 340,
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                      }}
                      onPress={() =>
                        handleAccordionChange(setTopicStates)(
                          sub.topicIndex,
                          sub.accIndex,
                          true,
                        )
                      }
                    >
                      <CardFooter
                        className="absolute left-0 right-0 bottom-0 top-0 px-4 py-3 flex flex-col bg-white/60 dark:bg-gray-900/60 backdrop-blur transition-all duration-300 z-10 pointer-events-none h-full rounded-b-2xl translate-y-[60%] group-hover:translate-y-0"
                        style={{ borderRadius: 12 }}
                      >
                        <div className="w-full flex flex-col h-full">
                          <div className="w-full flex flex-col items-end absolute right-0 px-4 transition-all duration-300 z-20 top-3 group-hover:top-9">
                            <span className="text-base font-bold text-right text-gray-900 dark:text-white transition-colors">
                              {t(`tests.topics.${sub.label}`)}
                            </span>
                            <span className="text-xs text-gray-700 dark:text-gray-300 text-right mt-1 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-32 transition-all duration-300">
                              {sub.description}
                            </span>
                          </div>
                          <div className="w-full flex justify-center absolute left-0 right-0 bottom-4 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                            <span className="text-primary text-sm font-semibold">
                              Начать тест
                            </span>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
          {/* Создание собственного варианта */}
          <div
            ref={(el) => {
              if (el) sectionRefs.current[1] = el;
            }}
            className="mb-8 scroll-mt-24"
          >
            <h1 className="text-2xl font-bold mb-4 flex items-center justify-center">
              Создание собственного варианта
            </h1>
            <Tabs fullWidth size="md">
              <Tab
                key="FI"
                title={
                  <>
                    <span className="block sm:hidden">ФИ</span>
                    <span className="hidden sm:block">
                      {t("leaderboard.topics.fundamentals")}
                    </span>
                  </>
                }
              >
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <Spinner label={t("loading")} size="lg" />
                  </div>
                ) : (
                  <TopicAccordions
                    isCompact={isCompact}
                    t={t}
                    topics={topicStates}
                    onAccordionChange={handleAccordionChange(setTopicStates)}
                    onCheckboxGroupChange={handleCheckboxGroupChange(
                      setTopicStates,
                    )}
                  />
                )}
              </Tab>
              <Tab
                key="AS"
                title={
                  <>
                    <span className="block sm:hidden">АиСД</span>
                    <span className="hidden sm:block">
                      {t("leaderboard.topics.algorithms")}
                    </span>
                  </>
                }
              >
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <Spinner label={t("loading")} size="lg" />
                  </div>
                ) : (
                  <TopicAccordions
                    isCompact={isCompact}
                    t={t}
                    topics={asTopicStates}
                    onAccordionChange={handleAccordionChange(setAsTopicStates)}
                    onCheckboxGroupChange={handleCheckboxGroupChange(
                      setAsTopicStates,
                    )}
                  />
                )}
              </Tab>
            </Tabs>
          </div>
          {/* Предложить вопрос */}
          <div
            ref={(el) => {
              if (el) sectionRefs.current[2] = el;
            }}
            className="mb-8 scroll-mt-24"
          >
            <h1 className="text-2xl font-bold mb-4 flex items-center justify-center">
              Предложить вопрос
            </h1>
            <QuestionForm />
          </div>
        </div>
      </aside>
      {/* Правая панель */}
      <aside className="hidden lg:block w-[200px] flex-shrink-0 sticky top-32 h-fit self-start">
        <div>
          <Card isFooterBlurred className="border-none" radius="lg">
            <CardHeader className="flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 dark:from-slate-900 dark:to-emerald-900">
              <h2 className="text-lg font-semibold">Выбранные темы</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Всего тем: {totalSelected}
              </p>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col items-start justify-left gap-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ФИ: {totalFI}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  АиСД: {totalAS}
                </p>
              </div>
            </CardBody>
            <CardFooter className="flex flex-col items-center justify-center gap-2">
              <Button
                className="w-full text-md font-semibold py-3"
                color="primary"
                radius="lg"
                size="lg"
                variant="shadow"
              >
                Генерация варианта
              </Button>
              <Button
                radius="lg"
                size="sm"
                variant="light"
                onPress={handleResetSelections}
              >
                Сбросить
              </Button>
            </CardFooter>
          </Card>
        </div>
      </aside>
    </section>
  );
}
