"use client";

import React, { useState } from "react";
import { TrashIcon, DragHandleIcon } from "../icons";
import {
  Form,
  Input,
  Select,
  SelectItem,
  Textarea,
  Checkbox,
  Button,
  Card,
} from "@heroui/react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

interface SubmittedData {
  questionText: string;
  questionType: string;
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string;
  sampleAnswer?: string;
  termsAccepted: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

function SortableChoice({
  id,
  value,
  onChange,
  onRemove,
  dragHandleProps,
  inputRef,
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  onRemove: () => void;
  dragHandleProps?: any;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-1 py-1 w-full"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      <div
        {...listeners}
        {...attributes}
        {...dragHandleProps}
        aria-label="Drag handle"
        className="flex items-center justify-center cursor-grab p-1 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 select-none"
        style={{ touchAction: "none" }}
        tabIndex={-1}
      >
        <DragHandleIcon />
      </div>

      <Input
        ref={inputRef}
        className="flex-1"
        name="options"
        placeholder="Вариант"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
      />

      <Button
        isIconOnly
        aria-label="Удалить вариант"
        className="transition-none"
        color="danger"
        type="button"
        variant="flat"
        onPress={onRemove}
      >
        <TrashIcon />
      </Button>
    </div>
  );
}

export default function QuestionForm() {
  const [submission, setSubmission] = useState<SubmittedData | null>(null);
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [questionType, setQuestionType] = useState("");
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  const [singleAnswerIndex, setSingleAnswerIndex] = useState<number | null>(
    null,
  );
  const [multipleAnswerIndices, setMultipleAnswerIndices] = useState<number[]>(
    [],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleAddOption = () => {
    setAnswerOptions((prev) => [...prev, ""]);
  };

  const handleRemoveOption = (idx: number) => {
    setAnswerOptions((prev) => prev.filter((_, i) => i !== idx));
    setMultipleAnswerIndices((prev) =>
      prev.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)),
    );
    if (singleAnswerIndex === idx) setSingleAnswerIndex(null);
    else if (singleAnswerIndex !== null && singleAnswerIndex > idx)
      setSingleAnswerIndex(singleAnswerIndex - 1);
  };

  const handleUpdateOption = (idx: number, val: string) => {
    setAnswerOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = answerOptions.findIndex(
        (_, i) => `opt-${i}` === active.id,
      );
      const newIndex = answerOptions.findIndex(
        (_, i) => `opt-${i}` === over.id,
      );

      setAnswerOptions(arrayMove(answerOptions, oldIndex, newIndex));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const filledOptions = formData
      .getAll("options")
      .map(String)
      .filter((str) => str.trim() !== "");
    const data = {
      questionText: formData.get("questionText") as string,
      questionType: formData.get("questionType") as string,
      options: filledOptions,
      correctAnswer: formData.get("correctAnswer") as string | undefined,
      correctAnswers: formData.get("correctAnswers") as string | undefined,
      sampleAnswer: formData.get("sampleAnswer") as string | undefined,
      termsAccepted: formData.get("termsAccepted") as string,
    };

    const newErrors: FormErrors = {};

    if (!data.questionText?.trim())
      newErrors.question = "Введите текст вопроса";
    if (!data.questionType) newErrors.type = "Выберите тип вопроса";

    if (
      ["single-choice", "multiple-choice", "ordering"].includes(
        data.questionType,
      )
    ) {
      if (data.questionType === "single-choice") {
        if ((data.options || []).length < 2) {
          newErrors.correctAnswer = "Укажите хотя бы два варианта ответа";
        } else if (singleAnswerIndex === null) {
          newErrors.correctAnswer = "Выберите правильный вариант";
        }
      }

      if (data.questionType === "multiple-choice") {
        if ((data.options || []).length < 2) {
          newErrors.correctAnswers = "Укажите хотя бы два варианта ответа";
        } else if (multipleAnswerIndices.length === 0) {
          newErrors.correctAnswers = "Выберите правильные варианты";
        }
      }

      if (data.questionType === "ordering" && (data.options || []).length < 2) {
        newErrors.correctAnswer = "Укажите хотя бы два варианта ответа";
      }
    }

    if (data.questionType === "open-ended" && !data.sampleAnswer?.trim()) {
      newErrors.sampleAnswer = "Укажите пример правильного ответа";
    }

    if (data.termsAccepted !== "true")
      newErrors.terms = "Вы должны подтвердить корректность вопроса";

    if (Object.keys(newErrors).length) {
      setValidationErrors(newErrors);

      return;
    }

    setValidationErrors({});
    setSubmission({
      ...data,
      correctAnswer:
        data.questionType === "single-choice"
          ? answerOptions[singleAnswerIndex ?? -1]
          : data.questionType === "ordering"
            ? answerOptions.join(",")
            : undefined,
      correctAnswers:
        data.questionType === "multiple-choice"
          ? multipleAnswerIndices.map((i) => answerOptions[i]).join(",")
          : undefined,
    });
  };

  const handleTypeChange = (
    selection: { currentKey?: string } | { [key: string]: any }[],
  ) => {
    const key = Array.isArray(selection) ? selection[0] : selection?.currentKey;

    if (key) {
      if (typeof key === "string") {
        setQuestionType(key);
      }
      setValidationErrors({});
      if (key === "open-ended") {
        setAnswerOptions([]);
      } else {
        setAnswerOptions(["", ""]);
      }
      setSingleAnswerIndex(null);
      setMultipleAnswerIndices([]);
    }
  };

  const handleReset = () => {
    setSubmission(null);
    setQuestionType("");
    setAnswerOptions([]);
    setValidationErrors({});
    setSingleAnswerIndex(null);
    setMultipleAnswerIndices([]);
  };

  return (
    <div>
      <Card className="mb-4 p-4 w-full mx-auto" shadow="sm">
        <Form
          className="w-full flex flex-col gap-4"
          validationErrors={Object.fromEntries(
            Object.entries(validationErrors).filter(([_, v]) => v) as [
              string,
              string,
            ][],
          )}
          onReset={handleReset}
          onSubmit={handleSubmit}
        >
          <Textarea
            isRequired
            errorMessage={validationErrors.question}
            label="Формулировка вопроса"
            labelPlacement="outside"
            name="questionText"
            placeholder="Введите текст вопроса"
            minRows={5}
          />

          <Select
            isRequired
            label="Тип вопроса"
            name="questionType"
            placeholder="Выберите тип вопроса"
            value={questionType}
            onSelectionChange={handleTypeChange}
          >
            <SelectItem key="single-choice">С выбором одного ответа</SelectItem>
            <SelectItem key="multiple-choice">
              С множественным выбором
            </SelectItem>
            <SelectItem key="ordering">С упорядочиванием ответов</SelectItem>
            <SelectItem key="open-ended">С развернутым ответом</SelectItem>
          </Select>

          {/* Списки вариантов */}
          {["single-choice", "multiple-choice"].includes(questionType) && (
            <div className="flex flex-col gap-3 items-center justify-center w-full">
              <p className="font-medium text-center w-full">Варианты ответа</p>
              <div className="flex flex-col gap-2 items-center w-full">
                {answerOptions.map((o, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 w-full justify-center"
                  >
                    {questionType === "single-choice" && (
                      <Checkbox
                        aria-label="Выбрать правильный вариант"
                        isDisabled={
                          singleAnswerIndex !== null && singleAnswerIndex !== i
                        }
                        isSelected={singleAnswerIndex === i}
                        onValueChange={(checked) =>
                          setSingleAnswerIndex(checked ? i : null)
                        }
                      />
                    )}
                    {questionType === "multiple-choice" && (
                      <Checkbox
                        aria-label="Отметить правильный вариант"
                        isSelected={multipleAnswerIndices.includes(i)}
                        onValueChange={(checked) => {
                          setMultipleAnswerIndices((prev) =>
                            checked
                              ? [...prev, i]
                              : prev.filter((idx) => idx !== i),
                          );
                        }}
                      />
                    )}
                    <Input
                      className="flex-1 max-w-md"
                      name="options"
                      placeholder={`Вариант ${i + 1}`}
                      value={o}
                      onChange={(e) => handleUpdateOption(i, e.target.value)}
                    />
                    <Button
                      isIconOnly
                      aria-label="Удалить вариант"
                      className="transition-none"
                      color="danger"
                      type="button"
                      variant="flat"
                      onPress={() => handleRemoveOption(i)}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                className="self-center"
                type="button"
                onPress={handleAddOption}
              >
                Добавить вариант ответа
              </Button>
            </div>
          )}

          {/* DND для упорядочивания */}
          {questionType === "ordering" && (
            <div className="flex flex-col gap-3 items-center justify-center w-full">
              <p className="font-medium text-center w-full">
                Упорядочите ответы
              </p>
              <div className="flex flex-col gap-2 items-center w-full">
                <DndContext
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  sensors={sensors}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={answerOptions.map((_, i) => `opt-${i}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2 items-center w-full">
                      {answerOptions.map((o, i) => (
                        <div
                          key={`opt-${i}`}
                          className="flex items-center gap-1 w-full max-w-md justify-center"
                        >
                          <SortableChoice
                            dragHandleProps={{ tabIndex: 0 }}
                            id={`opt-${i}`}
                            inputRef={undefined}
                            value={o}
                            onChange={(val) => handleUpdateOption(i, val)}
                            onRemove={() => handleRemoveOption(i)}
                          />
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
              <Button
                className="self-center"
                type="button"
                onPress={handleAddOption}
              >
                Добавить вариант ответа
              </Button>
              {validationErrors.options && (
                <span className="text-danger text-small">
                  {validationErrors.options}
                </span>
              )}
            </div>
          )}

          {/* Additional fields for SINGLE, MULTIPLE, ORDERING */}
          {questionType === "single-choice" && (
            <Input
              isRequired
              readOnly
              errorMessage={validationErrors.correctAnswer}
              label="Правильный вариант"
              labelPlacement="outside"
              name="correctAnswer"
              placeholder="Выберите правильный вариант"
              value={
                singleAnswerIndex !== null
                  ? answerOptions[singleAnswerIndex]
                  : ""
              }
            />
          )}
          {questionType === "multiple-choice" && (
            <Input
              isRequired
              readOnly
              errorMessage={validationErrors.correctAnswers}
              label="Правильные варианты"
              labelPlacement="outside"
              name="correctAnswers"
              placeholder="Укажите правильные варианты"
              value={multipleAnswerIndices
                .map((i) => answerOptions[i])
                .join(", ")}
            />
          )}
          {questionType === "ordering" && (
            <Input
              isRequired
              readOnly
              errorMessage={validationErrors.correctAnswer}
              label="Правильный порядок"
              labelPlacement="outside"
              name="correctOrder"
              placeholder="Укажите правильный порядок"
              value={answerOptions.join(", ")}
            />
          )}

          {/* Field for OPEN-ENDED */}
          {questionType === "open-ended" && (
            <Textarea
              isRequired
              errorMessage={validationErrors.sampleAnswer}
              label="Пример ответа"
              labelPlacement="outside"
              name="sampleAnswer"
              placeholder="Введите пример правильного ответа"
            />
          )}

          <Checkbox
            isRequired
            isInvalid={!!validationErrors.terms}
            name="termsAccepted"
            validationBehavior="aria"
            value="true"
            onValueChange={() =>
              setValidationErrors((prev) => ({ ...prev, terms: undefined }))
            }
          >
            Я подтверждаю, что вопрос корректный и не нарушает правила
          </Checkbox>
          {validationErrors.terms && (
            <span className="text-danger text-small">
              {validationErrors.terms}
            </span>
          )}

          <div className="flex gap-4">
            <Button className="flex-1" color="primary" type="submit">
              Предложить
            </Button>
            <Button className="flex-1" type="reset" variant="bordered">
              Сбросить
            </Button>
          </div>
        </Form>

        {submission && (
          <pre className="mt-6 bg-gray-100 p-3 rounded">
            {JSON.stringify(submission, null, 2)}
          </pre>
        )}
      </Card>
    </div>
  );
}
