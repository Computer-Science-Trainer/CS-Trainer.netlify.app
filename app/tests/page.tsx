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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import QuestionForm from "../../components/tests/QuestionForm";
import { SelectedTopics } from "../../components/SelectedTopics";

import LoginWindow from "@/components/login";
import { useAuth } from "@/context/auth";
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

// Reusable component to render topic accordions
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
      // Card per topic
      <Card
        key={topicIndex}
        className="mb-4 select-none rounded-3xl"
        shadow="none"
      >
        <CardBody className="flex flex-col items-center bg-linear-to-r from-purple-200 via-pink-200 dark:via-none to-red-200 dark:from-slate-900 dark:to-emerald-900 rounded-3xl">
          <h2 className="text-lg font-semibold mb-4 mt-3">
            {t(`tests.topics.${topic.label}`)}
          </h2>
          {/* Render each accordion or simple checkbox */}
          <div className="flex w-full flex-col gap-2">
            {topic.accordions.map((acc, accIndex) =>
              acc.options.length === 0 ? (
                <div key={accIndex} className="px-2">
                  <Card
                    isPressable
                    className="w-full py-1 rounded-2xl data-[pressed=true]:scale-100"
                    shadow="none"
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

// Custom hook: track current window width
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

// Helper: count total selected items across topics
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
  const router = useRouter();
  const { user } = useAuth();
  // State: topics, loading, UI flags
  const [topicStates, setTopicStates] = useState<TopicState[]>([]);
  const [asTopicStates, setAsTopicStates] = useState<TopicState[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerateHovered, setIsGenerateHovered] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isStartingTest, setIsStartingTest] = useState(false);
  const windowWidth = useWindowWidth();
  const isCompact = windowWidth < 640;

  // Effect: detect dark mode by observing <html> class
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDarkMode(root.classList.contains("dark"));
    const obs = new MutationObserver(update);

    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    update();

    return () => obs.disconnect();
  }, []);

  // Load topics from API on mount
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
  const selectedFI = topicStates.flatMap((topic) =>
    topic.accordions.flatMap((acc) =>
      acc.options.length === 0
        ? acc.isSelected
          ? [acc.label]
          : []
        : acc.selectedOptions.length === acc.options.length
          ? [acc.label]
          : acc.selectedOptions,
    ),
  );
  const selectedAS = asTopicStates.flatMap((topic) =>
    topic.accordions.flatMap((acc) =>
      acc.options.length === 0
        ? acc.isSelected
          ? [acc.label]
          : []
        : acc.selectedOptions.length === acc.options.length
          ? [acc.label]
          : acc.selectedOptions,
    ),
  );

  // --- Recommendations logic ---
  const [recommendedTopics, setRecommendedTopics] = useState<string[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!user?.username) return;
      setLoadingRecommendations(true);
      try {
        const recs = await makeApiRequest(
          `api/user/${user.username}/recommendations`,
          "GET",
        );

        setRecommendedTopics(Array.isArray(recs) ? recs : []);
      } catch {
        setRecommendedTopics([]);
      } finally {
        setLoadingRecommendations(false);
      }
    }
    fetchRecommendations();
  }, [user]);

  let recommendedSubs = [
    ...topicStates.map((topic, tIdx) => ({
      label: topic.label,
      description: undefined,
      topicIndex: tIdx,
      accIndex: undefined,
      section: "FI",
      isTopic: true,
      isOption: false,
      optionValue: undefined,
    })),
    ...asTopicStates.map((topic, tIdx) => ({
      label: topic.label,
      description: undefined,
      topicIndex: tIdx,
      accIndex: undefined,
      section: "AS",
      isTopic: true,
      isOption: false,
      optionValue: undefined,
    })),
    ...topicStates.flatMap((topic, tIdx) =>
      topic.accordions.map((acc, aIdx) => ({
        label: acc.label,
        description: acc.description,
        topicIndex: tIdx,
        accIndex: aIdx,
        section: "FI",
        isTopic: false,
        isOption: false,
        optionValue: undefined,
      })),
    ),
    ...asTopicStates.flatMap((topic, tIdx) =>
      topic.accordions.map((acc, aIdx) => ({
        label: acc.label,
        description: acc.description,
        topicIndex: tIdx,
        accIndex: aIdx,
        section: "AS",
        isTopic: false,
        isOption: false,
        optionValue: undefined,
      })),
    ),
    ...topicStates.flatMap((topic, tIdx) =>
      topic.accordions.flatMap((acc, aIdx) =>
        acc.options.map((option) => ({
          label: option,
          description: undefined,
          topicIndex: tIdx,
          accIndex: aIdx,
          section: "FI",
          isTopic: false,
          isOption: true,
          optionValue: option,
        })),
      ),
    ),
    ...asTopicStates.flatMap((topic, tIdx) =>
      topic.accordions.flatMap((acc, aIdx) =>
        acc.options.map((option) => ({
          label: option,
          description: undefined,
          topicIndex: tIdx,
          accIndex: aIdx,
          section: "AS",
          isTopic: false,
          isOption: true,
          optionValue: option,
        })),
      ),
    ),
  ];

  if (user?.username) {
    recommendedSubs = recommendedSubs.filter((sub) =>
      recommendedTopics.includes(sub.label),
    );
  } else {
    recommendedSubs = recommendedSubs.slice(0, 6);
  }

  // Generate circular color pairs once per mount
  const lightThemeColors = [
    "#FFAF64",
    "#FD8462",
    "#FF608D",
    "#C77ECC",
    "#ACA0D4",
  ];
  const darkThemeColors = [
    "#5F0F40",
    "#9A031E",
    "#FB8B24",
    "#E36414",
    "#0F4C5C",
  ];
  const [lightThemeCombos] = useState<[string, string][]>(() => {
    const start = Math.floor(Math.random() * lightThemeColors.length);

    return lightThemeColors.map((_, idx) => {
      const i1 = (start + idx) % lightThemeColors.length;
      const i2 = (i1 + 1) % lightThemeColors.length;

      return [lightThemeColors[i1], lightThemeColors[i2]];
    });
  });
  const [darkThemeCombos] = useState<[string, string][]>(() => {
    const start = Math.floor(Math.random() * darkThemeColors.length);

    return darkThemeColors.map((_, idx) => {
      const i1 = (start + idx) % darkThemeColors.length;
      const i2 = (i1 + 1) % darkThemeColors.length;

      return [darkThemeColors[i1], darkThemeColors[i2]];
    });
  });

  // track which tab is active
  const [activeTab, setActiveTab] = useState<"FI" | "AS">("FI");

  // whenever the tab changes, clear all selections
  useEffect(() => {
    handleResetSelections();
  }, [activeTab]);

  const sectionLabels = [
    t("tests.leftNav.recommended"),
    t("tests.leftNav.custom"),
    t("tests.leftNav.suggest"),
  ];

  const handleStartTest = async () => {
    if (!user?.username) {
      setLoginModalOpen(true);

      return;
    }
    const selected = activeTab === "FI" ? selectedFI : selectedAS;

    if (selected.length === 0) return;
    setIsStartingTest(true);
    try {
      const payload = { section: activeTab, topics: selected };
      const data = await makeApiRequest("api/tests", "POST", payload);

      if (data?.id) router.push(`/tests/${data.id}`);
    } catch {
      addToast({
        title: t("tests.errors.ErrorTitle"),
        description: t("tests.errors.loadErrorDescription"),
        color: "danger",
      });
    } finally {
      setIsStartingTest(false);
    }
  };

  const handleStartTestSingle = async (
    sub: (typeof recommendedSubs)[number],
  ) => {
    if (!user?.username) {
      setLoginModalOpen(true);

      return;
    }
    setIsStartingTest(true);
    try {
      const payload = { section: sub.section, topics: [sub.label] };
      const data = await makeApiRequest("api/tests", "POST", payload);

      if (data?.id) router.push(`/tests/${data.id}`);
    } catch {
      addToast({
        title: t("tests.errors.ErrorTitle"),
        description: t("tests.errors.loadErrorDescription"),
        color: "danger",
      });
    } finally {
      setIsStartingTest(false);
    }
  };

  // Render main layout: left nav, central content, right panel
  return (
    <section className="pt-4 flex lg:gap-6">
      {/* Left navigation panel */}
      <aside className="hidden lg:block w-[250px] shrink-0 sticky top-32 h-fit border-3 p-4 border-gray-200 dark:border-zinc-800 rounded-3xl dark:bg-zinc-900">
        <div className="relative flex flex-col items-start ">
          <div className="absolute inset-y-4 left-3.5 w-[4px] bg-gray-300 dark:bg-gray-600 bottom-5" />
          {sectionLabels.map((label, idx) => (
            <button
              key={idx}
              className={`relative flex items-center gap-3 mt-2 mb-2 transition-colors transition-shadow duration-150 text-left pl-2 rounded-lg ${idx === currentIndex ? "bg-gray-100 dark:bg-gray-800 p-2" : ""}`}
              onClick={() => scrollToSection(idx)}
            >
              <div
                className={`z-10 w-4 h-4 rounded-full border-2 shrink-0 transition-all ${
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
      {/* Central panel: recommendations, custom test, question form */}
      <aside className="flex flex-col items-center justify-center w-full">
        <div className="w-full">
          {/* Recommended tests section */}
          <div
            ref={(el) => {
              if (el) sectionRefs.current[0] = el;
            }}
            className="mb-8 scroll-mt-24"
          >
            <h1 className="text-2xl font-bold flex justify-center">
              {t("tests.labels.recommendedTests")}
            </h1>
            <Card className="mb-4 mt-4 p-2 rounded-3xl shadow-none border-3 border-gray-200 dark:border-zinc-800">
              <CardBody className="flex flex-col">
                {loadingRecommendations ? (
                  <div className="flex justify-center py-10">
                    <Spinner label={t("loading")} size="lg" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {recommendedSubs.map((sub, idx) => {
                      const [lightFrom, lightTo] =
                        lightThemeCombos[idx % lightThemeCombos.length];
                      const [darkFrom, darkTo] =
                        darkThemeCombos[idx % darkThemeCombos.length];
                      const [from, to] = isDarkMode
                        ? [darkFrom, darkTo]
                        : [lightFrom, lightTo];

                      const onPress = () => {
                        if (!user?.username) {
                          setLoginModalOpen(true);

                          return;
                        }
                        handleStartTestSingle(sub);
                      };

                      return (
                        // Card with dynamic gradient
                        <Card
                          key={idx}
                          isPressable
                          className="group mx-auto rounded-b-3xl shadow-none"
                          shadow="none"
                          style={{
                            backgroundImage: `linear-gradient(to right, ${from}, ${to})`,
                            minHeight: 220,
                            width: "100%",
                            maxWidth: 340,
                            borderRadius: 12,
                          }}
                          onPress={onPress}
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
                                  {t("tests.labels.startTest")}
                                </span>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
          {/* Custom test creation section */}
          <div
            ref={(el) => {
              if (el) sectionRefs.current[1] = el;
            }}
            className="scroll-mt-24"
          >
            <h1 className="text-2xl font-bold mb-4 flex justify-center">
              {t("tests.labels.createCustomTest")}
            </h1>
            <Tabs
              fullWidth
              selectedKey={activeTab}
              size="md"
              onSelectionChange={(key) => setActiveTab(key as "FI" | "AS")}
            >
              <Tab
                key="FI"
                title={
                  <>
                    <span className="block sm:hidden">
                      {t("tests.sections.fundamentalsShort")}
                    </span>
                    <span className="hidden sm:block">
                      {t("leaderboard.topics.fundamentals")}
                    </span>
                  </>
                }
                value="FI"
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
                title={
                  <>
                    <span className="block sm:hidden">
                      {t("tests.sections.algorithmsShort")}
                    </span>
                    <span className="hidden sm:block">
                      {t("leaderboard.topics.algorithms")}
                    </span>
                  </>
                }
                value="AS"
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
          {/* Question suggestion form */}
          <div
            ref={(el) => {
              if (el) sectionRefs.current[2] = el;
            }}
            className="mb-8 scroll-mt-24"
          >
            <h1 className="text-2xl font-bold mb-4 flex justify-center">
              {t("tests.labels.suggestQuestion")}
            </h1>
            <QuestionForm />
          </div>
        </div>
      </aside>
      {/* Right summary panel */}
      <aside className="hidden lg:block w-[250px] shrink-0 sticky top-32 h-fit">
        <div className="group">
          <Card
            className="group relative overflow-hidden rounded-3xl shadow-none border-3 border-gray-200 dark:border-zinc-800 pb-2"
            radius="lg"
          >
            <CardHeader className="flex flex-col justify-center gap-2 border-b-3 border-gray-200 dark:border-zinc-800 p-6 bg-linear-to-r from-red-300 via-pink-300 to-purple-300 dark:from-emerald-800 dark:via-none dark:to-slate-900">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("tests.labels.selectedTopicsHeader")}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("tests.summary.totalTopics", {
                  count: activeTab === "FI" ? totalFI : totalAS,
                })}
              </p>
            </CardHeader>
            <CardBody className="p-2 mb-2">
              <SelectedTopics
                emptyLabel={
                  activeTab === "FI"
                    ? t("tests.empty.FITopics")
                    : t("tests.empty.ASTopics")
                }
                topics={activeTab === "FI" ? selectedFI : selectedAS}
                onReset={handleResetSelections}
              />
            </CardBody>
            <div className="mb-11" />
            <CardFooter
              className={`absolute z-10 bg-linear-to-r from-red-300 via-pink-300 to-purple-300 dark:from-emerald-900 dark:via-none dark:to-slate-800 duration-300 h-full ${isGenerateHovered ? "translate-y-0" : "translate-y-[85%]"}`}
              style={{ borderRadius: 12 }}
            >
              <div className="relative rounded-2xl w-full flex flex-col h-full">
                <div className="w-full flex flex-col absolute justify-center items-center transition-all duration-300 mt-8">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-base font-bold text-gray-900 dark:text-white transition-colors">
                      {t("tests.generation.modalTitle")}
                    </span>
                    <div className="mt-3 w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-zinc-900/70 shadow-sm flex flex-col gap-1 text-[15px] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-100">
                          {t("tests.generation.questionCount")}
                        </span>
                        <span className="ml-auto font-mono text-primary">
                          10
                        </span>
                      </div>
                      {/* <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-100">
                          {t("tests.generation.time")}
                        </span>
                        <span className="ml-auto font-mono text-primary">
                          60 {t("tests.generation.minutes")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-100">
                          {t("tests.generation.maxScore")}
                        </span>
                        <span className="ml-auto font-mono text-primary">
                          100
                        </span>
                      </div> */}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-100">
                          {t("tests.generation.section")}
                        </span>
                        <span className="ml-auto font-mono text-primary">
                          {activeTab === "FI"
                            ? t("tests.sections.fundamentals")
                            : t("tests.sections.algorithms")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
          <div className="absolute inset-x-0 bottom-0 z-20">
            <Button
              className={`w-full h-16 rounded-b-3xl border-3 border-gray-200 dark:border-zinc-800 font-bold text-lg shadow-none opacity-100! hover:color-blue-450! hover:dark:color-blue-450-dark! ${totalSelected === 0 ? "bg-gray-300 text-gray-500 dark:bg-zinc-800 dark:text-gray-400 cursor-not-allowed" : ""}`}
              color="primary"
              isDisabled={totalSelected === 0 || isStartingTest}
              variant="solid"
              onMouseEnter={() => setIsGenerateHovered(true)}
              onMouseLeave={() => setIsGenerateHovered(false)}
              onPress={handleStartTest}
            >
              {isStartingTest ? (
                <Spinner color="current" size="sm" />
              ) : (
                t("tests.labels.startTest")
              )}
            </Button>
          </div>
        </div>
      </aside>
      {/* Mobile Start Test Button (visible on small screens) */}
      {totalSelected !== 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-20 p-4">
          <Card className="rounded-3xl shadow-none border-3 border-gray-200 dark:border-zinc-800">
            <span className="text-lg font-semibold text-center mb-2 mt-2">
              {t("tests.selected.mobileCount", { count: totalSelected })}
            </span>
            <Button
              className="w-full h-16 rounded-3xl border-3 dark:border-zinc-800 font-bold text-lg shadow-none"
              color="primary"
              variant="solid"
              onPress={() => setMobileModalOpen(true)}
            >
              {t("tests.generation.modalTitle")}
            </Button>
          </Card>
        </div>
      )}
      {/* Mobile Modal for generation info */}
      <Modal
        isOpen={mobileModalOpen}
        placement="center"
        size="md"
        onOpenChange={setMobileModalOpen}
      >
        <ModalContent className="m-6">
          <ModalHeader className="text-lg font-semibold text-center">
            {t("tests.generation.modalTitle")}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col items-center gap-4 mt-2">
              <div className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-zinc-900/70 shadow-sm flex flex-col gap-2 text-base text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {t("tests.generation.questionCount")}
                  </span>
                  <span className="font-mono text-primary">10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {t("tests.generation.section")}
                  </span>
                  <span className="font-mono text-primary">
                    {activeTab === "FI"
                      ? t("tests.sections.fundamentals")
                      : t("tests.sections.algorithms")}
                  </span>
                </div>
              </div>
              {/* Unified SelectedTopics component */}
              <div className="w-full">
                <SelectedTopics
                  emptyLabel={
                    activeTab === "FI"
                      ? t("tests.empty.FITopics")
                      : t("tests.empty.ASTopics")
                  }
                  topics={activeTab === "FI" ? selectedFI : selectedAS}
                  onReset={() => {
                    handleResetSelections();
                    setMobileModalOpen(false);
                  }}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setMobileModalOpen(false)}>
              {t("tests.modal.close")}
            </Button>
            <Button
              color="primary"
              isDisabled={totalSelected === 0 || isStartingTest}
              variant="solid"
              onMouseEnter={() => setIsGenerateHovered(true)}
              onMouseLeave={() => setIsGenerateHovered(false)}
              onPress={handleStartTest}
            >
              {isStartingTest ? (
                <Spinner color="current" size="sm" />
              ) : (
                t("tests.labels.startTest")
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Login modal for unauthenticated users */}
      <LoginWindow isOpen={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </section>
  );
}
