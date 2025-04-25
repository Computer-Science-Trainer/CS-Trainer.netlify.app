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

// Константы
const topics = [
  "Introduction",
  "Getting Started",
  "Advanced Techniques",
  "Best Practices",
  "Summary",
];

// Функции
function ProblemsLayout({
  leftPanel,
  rightPanel,
  centralPanel,
}: {
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  centralPanel?: React.ReactNode;
}) {
  return (
    <section className="max-w-7xl mx-auto p-4 flex gap-4 flex-col lg:flex-row lg:gap-4">
      {leftPanel && (
        <aside className="hidden lg:block w-[150px] flex-shrink-0 sticky top-20 h-fit">
          <div>{leftPanel}</div>
        </aside>
      )}

      {/* Центральная панель */}
      {centralPanel && (
        <aside className="flex-grow bg-white dark:bg-zinc-900 p-4 rounded-lg shadow">
          <div>{centralPanel}</div>
        </aside>
      )}

      {/* Правая панель (только на больших экранах) */}
      {rightPanel && (
        <aside className="hidden lg:block w-[200px] flex-shrink-0 sticky top-20 h-fit">
          <div>{rightPanel}</div>
        </aside>
      )}
    </section>
  );
}

function createCustomAccordion(
  key: number,
  title: string,
  selectedOptions: string[],
  onValueChange: (selected: string[]) => void,
) {
  const options = [
    { value: "short-answer", label: "Краткий ответ" },
    { value: "detailed-answer", label: "Развернутый ответ" },
  ];

  return (
    <AccordionItem
      key={key}
      aria-label={`Accordion ${key}`}
      title={<span>{title}</span>}
    >
      <div className="flex flex-col gap-2">
        <CheckboxGroup
          label={`Выберите тип ответа для "${title}"`}
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

function createAccordion(
  key: number,
  title: string,
  selectedOptions: string[],
  onValueChange: (selected: string[]) => void,
  options: { value: string; label: string }[],
  isSelected: boolean,
  onAccordionChange: (isSelected: boolean) => void,
) {
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

function createCard(
  key: number,
  title: string,
  description: string,
  onAdd: () => void,
) {
  return (
    <Card key={key} className="p-4" shadow="sm">
      <CardHeader>
        <h3 className="text-md font-bold ">{title}</h3>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </CardBody>
      <CardFooter>
        <Button color="primary" size="sm" onClick={onAdd}>
          Добавить
        </Button>
      </CardFooter>
    </Card>
  );
}

// Основной компонент
export default function ProblemsPage() {
  const [accordionStates, setAccordionStates] = useState<
    {
      label: string;
      isSelected: boolean;
      selectedOptions: string[];
      options: { value: string; label: string }[];
      description?: string;
    }[]
  >([
    {
      label: "Основы программирования",
      isSelected: false,
      selectedOptions: [],
      options: [
        { value: "variables", label: "Переменные" },
        { value: "loops", label: "Циклы" },
        { value: "functions", label: "Функции" },
      ],
      description:
        "Изучение основ программирования, включая переменные, циклы и функции.",
    },
    {
      label: "Алгоритмы",
      isSelected: false,
      selectedOptions: [],
      options: [
        { value: "sorting", label: "Сортировка" },
        { value: "searching", label: "Поиск" },
        { value: "graphs", label: "Графы" },
      ],
      description:
        "Основные алгоритмы, такие как сортировка, поиск и работа с графами.",
    },
    {
      label: "Структуры данных",
      isSelected: false,
      selectedOptions: [],
      options: [
        { value: "arrays", label: "Массивы" },
        { value: "linked-lists", label: "Связные списки" },
        { value: "trees", label: "Деревья" },
      ],
      description:
        "Изучение структур данных, включая массивы, списки и деревья.",
    },
    {
      label: "Базы данных",
      isSelected: false,
      selectedOptions: [],
      options: [
        { value: "sql", label: "SQL" },
        { value: "normalization", label: "Нормализация" },
        { value: "transactions", label: "Транзакции" },
      ],
      description: "Основы работы с базами данных, включая SQL и нормализацию.",
    },
  ]);

  const sectionRefs = useRef<HTMLDivElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCheckboxGroupChange = (index: number, selected: string[]) => {
    setAccordionStates((prev) =>
      prev.map((state, i) =>
        i === index
          ? {
              ...state,
              selectedOptions: selected,
              isSelected: selected.length === state.options.length, // Галочка аккордеона включается, если все опции выбраны
            }
          : state,
      ),
    );
  };

  const handleAccordionChange = (index: number, isSelected: boolean) => {
    setAccordionStates((prev) =>
      prev.map((state, i) =>
        i === index
          ? {
              ...state,
              isSelected,
              selectedOptions: isSelected
                ? state.options.map((option) => option.value) // Если аккордеон включен, выбираем все опции
                : [], // Если аккордеон выключен, очищаем все опции
            }
          : state,
      ),
    );
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.findIndex(
              (ref) => ref === entry.target,
            );

            if (index !== -1) {
              setCurrentIndex(index);
            }
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.5 },
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <ProblemsLayout
      centralPanel={
        <div>
          <Card className="mb-4">
            <CardBody className="flex flex-col items-center justify-center gap-8">
              {/* Первая строка карточек */}
              <h1 className="text-2xl font-bold mt-4">Рекомендованное Вам</h1>
              <div className="grid grid-cols-3 gap-4">
                {/* Особенная карточка */}
                <Card key="special" className="p-4" shadow="sm">
                  <CardHeader>
                    <h3 className="text-xl font-bold">
                      Генерация личного варианта
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Создайте свой вариант с выбором вопросов.
                    </p>
                  </CardBody>
                  <CardFooter>
                    <Button
                      color="primary"
                      size="lg" // Увеличиваем размер кнопки "Создать"
                    >
                      Создать
                    </Button>
                  </CardFooter>
                </Card>
                {/* Остальные карточки */}
                {accordionStates.slice(0, 5).map((state, index) => (
                  <Card
                    key={index}
                    className="p-4" // Убираем кликабельность карточек
                    shadow="sm"
                  >
                    <CardHeader>
                      <h3 className="text-md font-bold">{state.label}</h3>
                    </CardHeader>
                    <CardBody>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {state.description || ""}
                      </p>
                    </CardBody>
                    <CardFooter>
                      <Button
                        color="primary"
                        size="md" // Увеличиваем размер кнопки "Добавить"
                        onClick={() => handleAccordionChange(index, true)}
                      >
                        Добавить
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
          <Tabs fullWidth size="md">
            <Tab key="FI" title="Фундаментальная информатика">
              <Card shadow="sm">
                <CardHeader className="flex flex-col items-start justify-center gap-2 bg-gray-100 dark:bg-gray-800">
                  <h2 className="text-lg font-semibold">Выбранные задания:</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Start your journey with us today!
                  </p>
                </CardHeader>
                <CardBody className="flex flex-col items-center justify-center gap-2">
                  <Accordion variant="splitted">
                    {accordionStates.map((state, index) =>
                      createAccordion(
                        index + 1,
                        state.label,
                        state.selectedOptions,
                        (selected) =>
                          handleCheckboxGroupChange(index, selected),
                        state.options,
                        state.isSelected,
                        (isSelected) =>
                          handleAccordionChange(index, isSelected),
                      ),
                    )}
                  </Accordion>
                </CardBody>
              </Card>
            </Tab>
            <Tab key="AS" title="Алгоритмы и структуры данных">
              <Accordion variant="splitted">
                {accordionStates.map((state, index) =>
                  createAccordion(
                    index + 1,
                    `Accordion ${index + 2}`,
                    state.selectedOptions,
                    (selected) => handleCheckboxGroupChange(index, selected),
                    state.options,
                    state.isSelected,
                    (isSelected) => handleAccordionChange(index, isSelected),
                  ),
                )}
              </Accordion>
            </Tab>
          </Tabs>

          <div className="mt-8">
            {topics.map((topic, index) => (
              <div
                key={index}
                ref={(el) => {
                  if (el) sectionRefs.current[index] = el;
                }}
                className="mb-6 scroll-mt-24"
              >
                <h2 className="text-lg font-semibold">{topic}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
                  a neque risus. Pellentesque dictum massa in tortor
                  pellentesque, quis dapibus ante pulvinar. Donec erat leo,
                  tempus vitae placerat ac, pulvinar non sapien. Curabitur
                  finibus fermentum libero eget mollis. Proin velit nisi,
                  tincidunt quis auctor in, aliquam vitae nibh. In magna enim,
                  auctor condimentum ornare ut, hendrerit suscipit neque. Ut
                  pulvinar cursus arcu eu suscipit. Cras nisi lectus, suscipit
                  id turpis a, dapibus ullamcorper dui. Maecenas suscipit erat
                  urna, et tincidunt mi vulputate id. Aliquam condimentum ante
                  at metus ultricies, eu pharetra nisi consectetur. Suspendisse
                  volutpat sem quis convallis auctor. Morbi malesuada consequat
                  turpis id vestibulum. Duis libero tellus, eleifend eu felis
                  lacinia, luctus facilisis dolor. Mauris varius tincidunt justo
                  sed bibendum. Nullam nec scelerisque mauris. Aenean
                  sollicitudin blandit nisl, non ornare nunc egestas in. Aliquam
                  gravida sodales faucibus. Nam dictum auctor nunc, ut dignissim
                  justo sodales eu. Curabitur mattis libero et nisl gravida,
                  fermentum mattis tellus consequat. In accumsan ullamcorper
                  metus, in lobortis justo iaculis et. Praesent condimentum eget
                  sem non ultricies. Nunc suscipit sapien orci, ac semper nibh
                  pretium vitae. Nulla non lacinia ex, sit amet rhoncus est. Sed
                  rutrum ultrices nibh, vel vulputate magna sodales nec. Proin
                  blandit feugiat dui placerat aliquam. Donec auctor libero
                  nisl. Nullam rutrum rutrum ultrices. Sed fermentum leo nisl.
                  Mauris mattis vitae sem eu convallis. Mauris vestibulum, ante
                  in lacinia efficitur, nisl est feugiat nulla, in ultricies
                  neque massa nec lacus. Pellentesque iaculis at magna vel
                  faucibus.
                </p>
              </div>
            ))}
          </div>
        </div>
      }
      leftPanel={
        <div>
          <div className="flex flex-col items-start mt-8 pl-4">
            <div className="relative flex flex-col items-start">
              <div className="absolute top-1 bottom-5 left-2 w-[2px] bg-gray-300 dark:bg-gray-600 z-0" />
              {topics.map((topic, index) => (
                <button
                  key={index}
                  className={`relative flex items-center gap-3 mb-4 transition-all text-left group ${
                    index === currentIndex
                      ? "bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"
                      : ""
                  }`}
                  onClick={() => scrollToSection(index)}
                >
                  <div
                    className={`z-10 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-300 group-hover:border-blue-400 group-hover:bg-blue-200 ${
                      index === currentIndex
                        ? "border-blue-500 bg-blue-500 animate-ping-slow"
                        : "border-gray-300 bg-white dark:bg-gray-700"
                    }`}
                  />
                  <span
                    className={`text-sm transition-colors group-hover:text-blue-500 ${
                      index === currentIndex
                        ? "text-black dark:text-white font-semibold"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {topic}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      rightPanel={
        <div>
          <Card isFooterBlurred className="border-none" radius="lg">
            <CardHeader className="flex flex-col items-center justify-center gap-2">
              <h2 className="text-lg font-semibold">Выбранные задания:</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start your journey with us today!
              </p>
            </CardHeader>
            <CardFooter className="flex flex-col items-center justify-center gap-2">
              <p>Available soon.</p>
              <Button color="default" radius="lg" size="sm" variant="flat">
                Notify me
              </Button>
            </CardFooter>
          </Card>
        </div>
      }
    />
  );
}
