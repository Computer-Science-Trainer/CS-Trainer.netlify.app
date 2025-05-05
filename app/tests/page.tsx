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
      <Card key={topicIndex} className="mb-4 select-none rounded-3xl" shadow="none">
        <CardBody className="flex flex-col items-center bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 dark:from-slate-900 dark:to-emerald-900 rounded-3xl">
          <h2 className="text-lg font-semibold mb-4 mt-3">
            {t(`tests.topics.${topic.label}`)}
          </h2>
          <div className="flex w-full flex-col gap-2">
            {topic.accordions.map((acc, accIndex) =>
              acc.options.length === 0 ? (
                <div key={accIndex} className="px-2">
                  <Card
                    isPressable
                    className="w-full py-1 rounded-2xl"
                    shadow="none"
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
                      <div className="flex w-full h-full px-4 py-3">
                        <Checkbox
                          color="primary"
                          isSelected={acc.isSelected}
                          onValueChange={(isSelected) =>
                            onAccordionChange(topicIndex, accIndex, isSelected)
                          }
                        />
                        {t(`tests.topics.${acc.label}`)}
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
                    className="rounded-2xl shadow-none"
                    title={
                      <>
                        <Checkbox
                          isIndeterminate={
                            acc.selectedOptions.length > 0 &&
                            acc.selectedOptions.length < acc.options.length
                          }
                          isSelected={acc.isSelected}
                          onValueChange={(isSelected) =>
                            onAccordionChange(topicIndex, accIndex, isSelected)
                          }
                        />
                        {t(`tests.topics.${acc.label}`)}
                      </>
                    }
                  >
                    <CheckboxGroup
                      value={acc.selectedOptions}
                      onValueChange={(selected) =>
                        onCheckboxGroupChange(topicIndex, accIndex, selected)
                      }
                    >
                      {acc.options.map((option) => (
                        <Checkbox key={option} value={option} >
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
  const [isGenerateHovered, setIsGenerateHovered] = useState(false);
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
      target.scrollIntoView({ behavior: "smooth", block: "start" });
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
  // collect selected topic labels or sub-options for FI and AS
  const selectedFI = topicStates.flatMap(topic =>
    topic.accordions.flatMap(acc =>
      acc.options.length === 0
        ? acc.isSelected
          ? [acc.label]
          : []
        : acc.selectedOptions.length === acc.options.length
          ? [acc.label]
          : acc.selectedOptions
    )
  );
  const selectedAS = asTopicStates.flatMap(topic =>
    topic.accordions.flatMap(acc =>
      acc.options.length === 0
        ? acc.isSelected
          ? [acc.label]
          : []
        : acc.selectedOptions.length === acc.options.length
          ? [acc.label]
          : acc.selectedOptions
    )
  );

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

  // track which tab is active
  const [activeTab, setActiveTab] = useState<'FI' | 'AS'>('FI');

  // whenever the tab changes, clear all selections
  useEffect(() => {
    handleResetSelections();
  }, [activeTab]);

  return (
    <section className="pt-4 flex lg:gap-6">
      {/* Левая панель */}
      <aside className="hidden lg:block w-[250px] flex-shrink-0 sticky top-32 h-fit border-3 p-4 border-gray-200 dark:border-zinc-800 rounded-3xl dark:bg-zinc-900">
        <div className="relative flex flex-col items-start ">
          <div className="absolute inset-y-4 left-3.5 w-[4px] bg-gray-300 dark:bg-gray-600 bottom-5" />
          {[
            "Рекомендованное Вам",
            "Создание собственного варианта",
            "Предложить вопрос",
          ].map((label, idx) => (
            <button
              key={label}
              className={`relative flex items-center gap-3 mt-2 mb-2 transition-colors transition-shadow duration-150 text-left pl-2 rounded-lg ${idx === currentIndex ? "bg-gray-100 dark:bg-gray-800 p-2" : ""}`}
              onClick={() => scrollToSection(idx)}
            >
              <div
                className={`z-10 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                  idx === currentIndex
                    ? "border-blue-500 bg-blue-500 animate-ping-slow"
                    : "border-gray-300 bg-white dark:bg-gray-700"
                }`}
              />
              <span
                className={`text-sm transition-colors ${
                  idx === currentIndex
                    ? "text-black dark:text-white font-semibold"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {label}
              </span>
            </button>
          ))}
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
            <h1 className="text-2xl font-bold flex justify-center">
              Рекомендованные тесты
            </h1>
            <Card className="mb-4 mt-4 rounded-3xl shadow-none border-3 border-gray-200 dark:border-zinc-800">
              <CardBody className="flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-2 w-full">
                  {recommendedSubs.map((sub, idx) => (
                    <Card
                      key={idx}
                      isPressable
                      className="group bg-gradient-to-r from-purple-300 via-pink-300 to-red-300 dark:from-slate-800 dark:to-emerald-800 rounded-b-3xl shadow-none"
                      shadow="none"
                      style={{
                        minHeight: 220,
                        width: "100%",
                        maxWidth: 340,
                        borderRadius: 12
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
                        className="absolute flex bg-white/60 dark:bg-gray-900/60 duration-300 h-full translate-y-[60%] group-hover:translate-y-0"
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
            className="scroll-mt-24"
          >
            <h1 className="text-2xl font-bold mb-4 flex justify-center">
              Создание собственного варианта
            </h1>
            <Tabs
                fullWidth
                size="md"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as 'FI' | 'AS')}
            >
              <Tab
                key="FI"
                value="FI"
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
                  <div className="flex justify-center py-10">
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
                value="AS"
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
                  <div className="flex justify-center py-10">
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
            <h1 className="text-2xl font-bold mb-4 flex justify-center">
              Предложить вопрос
            </h1>
            <QuestionForm />
          </div>
        </div>
      </aside>
      {/* Правая панель */}
      <aside className="hidden lg:block w-[250px] flex-shrink-0 sticky top-32 h-fit">
        <div className="group">
          <Card className="group relative overflow-hidden rounded-3xl shadow-none border-3 dark:border-zinc-800 pb-2" radius="lg">
            <CardHeader className="flex flex-col justify-center gap-2 border-b-3 border-gray-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Выбранные темы</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Всего тем: {activeTab === 'FI' ? totalFI : totalAS}</p>
            </CardHeader>
            <CardBody className="p-2 mb-2">
              <div className="flex flex-col h-[9rem] bg-white dark:bg-zinc-900 border-3 border-gray-200 dark:border-zinc-800 rounded-2xl overflow-y-auto">
                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'FI' ? (
                    selectedFI.length > 0 ? (
                      <ul className="p-3 list-disc text-sm text-gray-700 dark:text-gray-200">
                        {selectedFI.map(l => (
                          <li key={l} className="truncate">{t(`tests.topics.${l}`)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="p-3 text-sm text-gray-400 italic">Нет выбранных тем ФИ</p>
                    )
                  ) : (
                    selectedAS.length > 0 ? (
                      <ul className="p-3 list-disc text-sm text-gray-700 dark:text-gray-200">
                        {selectedAS.map(l => (
                          <li key={l} className="truncate">{t(`tests.topics.${l}`)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="p-3 text-sm text-gray-400 italic">Нет выбранных тем АиСД</p>
                    )
                  )}
                </div>
                {((activeTab === 'FI' && selectedFI.length > 0) || (activeTab === 'AS' && selectedAS.length > 0)) && (
                  <div className="mt-auto p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onPress={handleResetSelections}
                    >
                      Сбросить
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
            <div className="mb-11"/>
            <CardFooter
                className={`absolute z-10 bg-gradient-to-r from-red-300 via-pink-300 to-purple-300 dark:from-emerald-900 dark:to-slate-800 duration-300 h-full ${isGenerateHovered ? 'translate-y-0' : 'translate-y-[82%]'}`}
                style={{ borderRadius: 12 }}
                >
                <div className="relative rounded-2xl w-full flex flex-col h-full">
                    <div className="w-full flex flex-col absolute justify-center items-center transition-all duration-300 mt-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <span className="text-base font-bold text-gray-900 dark:text-white transition-colors">
                                Генерация варианта
                            </span>
                            <div className="mt-3 w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-zinc-900/70 shadow-sm flex flex-col gap-1 text-[15px] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-800">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700 dark:text-gray-100">Кол-во вопросов:</span>
                                <span className="ml-auto font-mono text-primary">20</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700 dark:text-gray-100">Время:</span>
                                <span className="ml-auto font-mono text-primary">60 минут</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700 dark:text-gray-100">Макс. балл:</span>
                                <span className="ml-auto font-mono text-primary">100</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700 dark:text-gray-100">Раздел:</span>
                                <span className="ml-auto font-mono text-primary">{activeTab === 'FI' ? 'ФИ' : 'АиСД'}</span>
                              </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardFooter>
          </Card>
          <div className="absolute inset-x-0 bottom-0 z-20">
              <Button
                variant="solid"
                className="w-full h-16 rounded-t-2xl rounded-b-3xl border-3 dark:border-zinc-800 bg-gradient-to-r from-red-300 via-pink-300 to-purple-300 dark:from-emerald-800 dark:to-slate-900 font-bold text-lg shadow-none"
                onMouseEnter={() => setIsGenerateHovered(true)}
                onMouseLeave={() => setIsGenerateHovered(false)}
                // onPress={handleStartTest}
            >
                Начать тест
              </Button>
          </div>
        </div>
      </aside>
    </section>
  );
}
