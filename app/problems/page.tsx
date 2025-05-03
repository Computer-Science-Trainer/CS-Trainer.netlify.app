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
} from "@heroui/react";

import ProblemsLayout from "./ProblemsLayout"; // Заменили локальную функцию ProblemsLayout на импорт
import { initialFiTopics, initialAsTopics } from "./topicsState";
import QuestionForm from "./QuestionForm"; // Импорт нового компонента формы

// Константы
const sections = [
  "Рекомендованное Вам",
  "Создание собственного варианта",
  "Предложить вопрос",
];

// Функции
function createAccordion(
  key: number,
  title: string,
  selectedOptions: string[],
  onValueChange: (selected: string[]) => void,
  options: { value: string; label: string }[],
  isSelected: boolean,
  onAccordionChange: (isSelected: boolean) => void,
) {
  if (options.length === 0) {
    return (
      <div key={key}>
        <Checkbox isSelected={isSelected} onValueChange={onAccordionChange} />
        <span>{title}</span>
      </div>
    );
  }

  return (
    <AccordionItem
      key={key}
      aria-label={`Accordion ${key}`}
      title={
        <div className="flex items-center gap-2">
          <Checkbox isSelected={isSelected} onValueChange={onAccordionChange} />
          <span>{title}</span>
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <CheckboxGroup
          label={`Options for ${title}`}
          value={selectedOptions}
          onValueChange={onValueChange}
        >
          {options.map((option) => (
            <Checkbox key={option.value} value={option.value}>
              {option.label}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>
    </AccordionItem>
  );
}

// Основной компонент
export default function ProblemsPage() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const check = () => setIsCompact(window.innerWidth < 640);

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  // Используем импортированные начальные значения для состояний тем
  const [topicStates, setTopicStates] = useState(initialFiTopics);
  const [asTopicStates, setAsTopicStates] = useState(initialAsTopics);

  const handleTopicCheckboxGroupChange = (
    topicIndex: number,
    accordionIndex: number,
    selected: string[],
  ) => {
    setTopicStates((prev) =>
      prev.map((topic, tIdx) =>
        tIdx === topicIndex
          ? {
              ...topic,
              accordions: topic.accordions.map((acc, aIdx) =>
                aIdx === accordionIndex
                  ? {
                      ...acc,
                      selectedOptions: selected,
                      isSelected: selected.length === acc.options.length,
                    }
                  : acc,
              ),
            }
          : topic,
      ),
    );
  };

  const handleTopicAccordionChange = (
    topicIndex: number,
    accordionIndex: number,
    isSelected: boolean,
  ) => {
    setTopicStates((prev) =>
      prev.map((topic, tIdx) =>
        tIdx === topicIndex
          ? {
              ...topic,
              accordions: topic.accordions.map((acc, aIdx) =>
                aIdx === accordionIndex
                  ? {
                      ...acc,
                      isSelected,
                      selectedOptions: isSelected ? acc.options : [],
                    }
                  : acc,
              ),
            }
          : topic,
      ),
    );
  };

  const handleAstopicCheckboxGroupChange = (
    topicIndex: number,
    accordionIndex: number,
    selected: string[],
  ) => {
    setAsTopicStates((prev) =>
      prev.map((topic, tIdx) =>
        tIdx === topicIndex
          ? {
              ...topic,
              accordions: topic.accordions.map((acc, aIdx) =>
                aIdx === accordionIndex
                  ? {
                      ...acc,
                      selectedOptions: selected,
                      isSelected: selected.length === acc.options.length,
                    }
                  : acc,
              ),
            }
          : topic,
      ),
    );
  };

  const handleAstopicAccordionChange = (
    topicIndex: number,
    accordionIndex: number,
    isSelected: boolean,
  ) => {
    setAsTopicStates((prev) =>
      prev.map((topic, tIdx) =>
        tIdx === topicIndex
          ? {
              ...topic,
              accordions: topic.accordions.map((acc, aIdx) =>
                aIdx === accordionIndex
                  ? {
                      ...acc,
                      isSelected,
                      selectedOptions: isSelected ? acc.options : [],
                    }
                  : acc,
              ),
            }
          : topic,
      ),
    );
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
      const duration = 400; // миллисекунд, увеличьте для более медленной прокрутки
      const startTime = performance.now();
      const animateScroll = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress < 1 ? 1 - Math.pow(1 - progress, 3) : 1; // easeOutCubic

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

      if (newIndex !== -1 && newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [currentIndex]);

  // Обновлённый расчёт суммы выбранных подтем с учётом подтем без опций:
  const totalFI = topicStates.reduce(
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
  const totalAS = asTopicStates.reduce(
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
  const totalSelected = totalFI + totalAS;

  // получаем первые 6 подтем из всех тем, теперь с description
  const recommendedSubsAll = topicStates.flatMap((topic, tIdx) =>
    topic.accordions.map((acc, aIdx) => ({
      label: acc.label,
      description: acc.description,
      topicIndex: tIdx,
      accIndex: aIdx,
    })),
  );
  // Показываем 4 карточки на маленьких экранах, 6 на >=sm
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const recommendedSubs =
    windowWidth !== null && windowWidth < 640
      ? recommendedSubsAll.slice(0, 3)
      : recommendedSubsAll.slice(0, 6);

  return (
    <ProblemsLayout
      centralPanel={
        <div>
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
                      className={`
                        group relative overflow-hidden cursor-pointer
                        p-0 bg-gradient-to-r from-purple-300 via-pink-300 to-red-300 dark:from-slate-800 dark:to-emerald-800
                        transition-shadow duration-200 hover:shadow-lg
                        min-h-[220px] w-full max-w-[340px] mx-auto
                        rounded-b-2xl
                      `}
                      shadow="sm"
                      style={{
                        minHeight: 220,
                        width: "100%",
                        maxWidth: 340,
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                      }}
                      onPress={() =>
                        handleTopicAccordionChange(
                          sub.topicIndex,
                          sub.accIndex,
                          true,
                        )
                      }
                    >
                      <CardFooter
                        className={`
                          absolute left-0 right-0 bottom-0 top-0
                          px-4 py-3
                          flex flex-col
                          bg-white/60 dark:bg-gray-900/60
                          backdrop-blur
                          transition-all duration-300
                          z-10
                          pointer-events-none
                          h-full
                          rounded-b-2xl
                          translate-y-[60%] group-hover:translate-y-0
                        `}
                        style={{ borderRadius: 12 }}
                      >
                        <div className="w-full flex flex-col h-full">
                          {/* Название темы: изначально сверху справа, при ховере — плавно смещается вниз */}
                          <div
                            className={`
                              w-full flex flex-col items-end
                              absolute right-0
                              px-4
                              transition-all duration-300
                              z-20
                              ${/* top-3 в обычном состоянии, top-8 при ховере */ ""}
                              top-3 group-hover:top-9
                            `}
                          >
                            <span className="text-base font-bold text-right text-gray-900 dark:text-white transition-colors">
                              {sub.label}
                            </span>
                            {/* Описание всегда под названием, появляется при ховере */}
                            <span
                              className={`
                                text-xs text-gray-700 dark:text-gray-300 text-right
                                mt-1
                                opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-32
                                transition-all duration-300
                              `}
                            >
                              {sub.description}
                            </span>
                          </div>
                          {/* "Начать тест" появляется снизу при ховере */}
                          <div
                            className={`
                              w-full flex justify-center absolute left-0 right-0 bottom-4 px-4
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300
                              z-20
                            `}
                          >
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
                      Фундаментальная информатика
                    </span>
                  </>
                }
              >
                {topicStates.map((topic, topicIndex) => (
                  <Card key={topicIndex} className="mb-4" shadow="sm">
                    <CardBody className="flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 dark:from-slate-900 dark:to-emerald-900">
                      <h2 className="text-lg font-semibold mb-4 mt-3">
                        {topic.label}
                      </h2>
                      <div className="w-full flex flex-col gap-2">
                        {/* простые чекбоксы для подтем без опций */}
                        {topic.accordions.map((acc, accIndex) =>
                          acc.options.length === 0 ? (
                            <div key={accIndex} className="px-2">
                              <Card
                                isPressable
                                className="shadow-md w-full cursor-pointer select-none transition-none"
                                shadow="sm"
                                style={{ transform: "none" }}
                                onPress={(e) => {
                                  // Не срабатывает, если клик по чекбоксу
                                  if (
                                    e.target instanceof HTMLElement &&
                                    (e.target.closest("label") ||
                                      e.target.tagName === "INPUT")
                                  ) {
                                    return;
                                  }
                                  handleTopicAccordionChange(
                                    topicIndex,
                                    accIndex,
                                    !acc.isSelected,
                                  );
                                }}
                              >
                                <CardBody className="p-0">
                                  <div className="flex w-full h-full gap-2 items-center px-4 py-3">
                                    <Checkbox
                                      className="pointer-events-auto"
                                      color="primary"
                                      isSelected={acc.isSelected}
                                      onValueChange={(isSelected) =>
                                        handleTopicAccordionChange(
                                          topicIndex,
                                          accIndex,
                                          isSelected,
                                        )
                                      }
                                    />
                                    <span className="text-md flex-1 text-left">
                                      {acc.label}
                                    </span>
                                  </div>
                                </CardBody>
                              </Card>
                            </div>
                          ) : null,
                        )}
                        {/* аккордеон для подтем с опциями */}
                        <Accordion
                          className="w-full"
                          isCompact={isCompact}
                          variant="splitted"
                        >
                          {topic.accordions.map((acc, accIndex) =>
                            acc.options.length > 0
                              ? createAccordion(
                                  accIndex + 1,
                                  acc.label,
                                  acc.selectedOptions,
                                  (selected) =>
                                    handleTopicCheckboxGroupChange(
                                      topicIndex,
                                      accIndex,
                                      selected,
                                    ),
                                  acc.options.map((option) => ({
                                    value: option,
                                    label: option,
                                  })),
                                  acc.isSelected,
                                  (isSelected) =>
                                    handleTopicAccordionChange(
                                      topicIndex,
                                      accIndex,
                                      isSelected,
                                    ),
                                )
                              : null,
                          )}
                        </Accordion>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </Tab>
              <Tab
                key="AS"
                title={
                  <>
                    <span className="block sm:hidden">АиСД</span>
                    <span className="hidden sm:block">
                      Алгоритмы и структуры данных
                    </span>
                  </>
                }
              >
                {asTopicStates.map((topic, topicIndex) => (
                  <Card key={topicIndex} className="mb-4" shadow="sm">
                    <CardBody className="flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 dark:from-slate-900 dark:to-emerald-900">
                      <h2 className="text-lg font-semibold mb-4 mt-3">
                        {topic.label}
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
                                  ) {
                                    return;
                                  }
                                  handleAstopicAccordionChange(
                                    topicIndex,
                                    accIndex,
                                    !acc.isSelected,
                                  );
                                }}
                              >
                                <CardBody className="p-0">
                                  <div className="flex w-full h-full gap-2 items-center px-4 py-3">
                                    <Checkbox
                                      className="pointer-events-auto"
                                      color="primary"
                                      isSelected={acc.isSelected}
                                      onValueChange={(isSelected) =>
                                        handleAstopicAccordionChange(
                                          topicIndex,
                                          accIndex,
                                          isSelected,
                                        )
                                      }
                                    />
                                    <span className="text-md flex-1 text-left">
                                      {acc.label}
                                    </span>
                                  </div>
                                </CardBody>
                              </Card>
                            </div>
                          ) : null,
                        )}
                        <Accordion
                          className="w-full"
                          isCompact={isCompact}
                          variant="splitted"
                        >
                          {topic.accordions.map((acc, accIndex) =>
                            acc.options.length > 0
                              ? createAccordion(
                                  accIndex + 1,
                                  acc.label,
                                  acc.selectedOptions,
                                  (selected) =>
                                    handleAstopicCheckboxGroupChange(
                                      topicIndex,
                                      accIndex,
                                      selected,
                                    ),
                                  acc.options.map((option) => ({
                                    value: option,
                                    label: option,
                                  })),
                                  acc.isSelected,
                                  (isSelected) =>
                                    handleAstopicAccordionChange(
                                      topicIndex,
                                      accIndex,
                                      isSelected,
                                    ),
                                )
                              : null,
                          )}
                        </Accordion>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </Tab>
            </Tabs>
          </div>
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
      }
      leftPanel={
        <div className="mt-8 pl-4">
          <div className="relative flex flex-col items-start">
            <div className="absolute inset-y-6 left-2 w-[2px] bg-gray-300 dark:bg-gray-600 z-0" />
            {/* Кнопки из массива sections */}
            {sections.map((label, idx) => (
              <button
                key={label}
                className={`
                  relative flex items-center gap-3 mb-4 transition-colors transition-shadow duration-150 text-left
                  ${idx === currentIndex ? "bg-gray-100 dark:bg-gray-800 p-2 rounded-lg" : ""}
                `}
                onClick={() => scrollToSection(idx)}
              >
                <div
                  className={`
                  z-10 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all
                  ${idx === currentIndex ? "border-blue-500 bg-blue-500 animate-ping-slow" : "border-gray-300 bg-white dark:bg-gray-700"}
                `}
                />
                <span
                  className={`
                  text-sm transition-colors
                  ${idx === currentIndex ? "text-black dark:text-white font-semibold" : "text-gray-600 dark:text-gray-400"}
                `}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      }
      rightPanel={
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
      }
    />
  );
}
