"use client";

import { Tabs, Tab, CardBody, Card } from '@heroui/react';
import { useTranslations } from "next-intl";

export default function ProblemsPage() {
  const t = useTranslations();

  // Обновлённый массив вкладок с содержимым в виде JSX
  const tabs = [
    {
      id: "FI",
      label: "Фундаментальная информатика",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="p-4 border rounded-lg hover:border-blue-400 transition"
            >
              <h3 className="font-medium mb-2">Тема {item}</h3>
              <p className="text-sm text-gray-600">
                Описание темы и сложности
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                  10 заданий
                </span>
                <button className="text-blue-600 text-sm">Добавить →</button>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "AADC",
      label: "Алгоритмы и структуры данных",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="p-4 border rounded-lg hover:border-blue-400 transition"
            >
              <h3 className="font-medium mb-2">Алгоритм {item}</h3>
              <p className="text-sm text-gray-600">
                Примеры реализации и задачи
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                  8 заданий
                </span>
                <button className="text-blue-600 text-sm">Добавить →</button>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const recommendedTests = [
    {
      title: "Базовые алгоритмы",
      description: "Основные алгоритмы для начинающих программистов",
      variants: 10,
    },
    {
      title: "Олимпиадные задачи",
      description: "Сложные задачи для подготовки к соревнованиям",
      variants: 5,
    },
    {
      title: "Структуры данных",
      description: "Изучение основных структур данных и их реализаций",
      variants: 8,
    },
    {
      title: "Динамическое программирование",
      description: "Классические задачи на ДП с разбором решений",
      variants: 7,
    },
    {
      title: "Графы",
      description: "Алгоритмы обхода и работы с графами",
      variants: 6,
    },
    ];

  return (
    <div className="min-h-screen">
      <main className="container mx-auto flex flex-col md:flex-row gap-6 p-4">
        {/* Левая панель */}
        <Card className="md:w-1/4 w-full p-6">
          {/* Содержимое левой панели без изменений */}
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">Рекомендуемые Вам тесты</h2>
            <div className="space-y-3">
              {recommendedTests.map((test, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:border-blue-400 transition cursor-pointer group"
                >
                  <p className="text-sm font-medium mb-1">{test.title}</p>
                  <p className="text-xs text-default-400 mb-2">
                    {test.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {test.variants} вариантов
                    </span>
                    <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                      Подробнее →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Card>

        {/* Центральная панель */}
        <Card className="flex-1 p-6">
          <div className="mb-8">
            <Tabs aria-label="Dynamic tabs" items={tabs}>
              {(item) => (
                <Tab key={item.id} title={item.label}>
                  <Card>
                    <CardBody>{item.content}</CardBody>
                  </Card>
                </Tab>
              )}
            </Tabs>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-2">Выбранные темы (3)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Проверьте выбранные элементы перед генерацией
                </p>
              </div>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                Сгенерировать вариант
              </button>
            </div>
          </div>
        </Card>

        {/* Правая панель */}
        <Card className="md:w-1/4 w-full p-6">
          <h2 className="text-lg font-bold mb-4">Рейтинг и прогресс</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <p className="text-sm font-medium">Текущий рейтинг</p>
              <p className="text-2xl font-bold text-blue-600">84.5</p>
            </div>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
            <div>
              <p className="text-sm font-medium mb-2">Прогресс выполнения</p>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center justify-between">
                    <span className="text-sm">Этап {item}</span>
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                      <span className="text-blue-600 text-xs">✔</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}