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
  isDisabled,
  isInvalid,
  removeDisabled,
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  onRemove: () => void;
  dragHandleProps?: any;
  inputRef?: React.Ref<HTMLInputElement>;
  isDisabled?: boolean;
  isInvalid?: boolean;
  removeDisabled?: boolean;
}) {
  // Hook to make this component draggable/sortable
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
      {/* Drag handle users grab to reorder options */}
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

      {/* Text input for the option label */}
      <Input
        ref={inputRef}
        className="flex-1 max-w-md"
        name="options"
        placeholder="Вариант ответа"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
      />

      {/* Button to remove this option */}
      <Button
        isIconOnly
        aria-label="Удалить вариант"
        className="transition-none"
        color="danger"
        type="button"
        variant="flat"
        onPress={onRemove}
        isDisabled={removeDisabled}
      >
        <TrashIcon />
      </Button>
    </div>
  );
}

export default function QuestionForm() {
  // State for storing submitted form data
  const [submission, setSubmission] = useState<SubmittedData | null>(null);
  // State for tracking validation errors
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  // State for the selected question type
  const [questionType, setQuestionType] = useState("");
  // Dynamic list of answer options
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  // Index of selected answer in single-choice mode
  const [singleAnswerIndex, setSingleAnswerIndex] = useState<number | null>(
    null,
  );
  // Indices of selected answers in multiple-choice mode
  const [multipleAnswerIndices, setMultipleAnswerIndices] = useState<number[]>(
    [],
  );
  // Configure pointer sensor with a small drag activation distance
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Add a blank option and clear option-related validation if enough exist
  const handleAddOption = () => {
    const newOptions = [...answerOptions, ""];
    setAnswerOptions(newOptions);
    if (
      validationErrors.options &&
      newOptions.filter((o) => o.trim() !== "").length >= 2
    ) {
      setValidationErrors((prev) => ({ ...prev, options: undefined }));
    }
  };

  // Remove an option and adjust selected indices accordingly
  const handleRemoveOption = (idx: number) => {
    const newOptions = answerOptions.filter((_, i) => i !== idx);
    setAnswerOptions(newOptions);
    setMultipleAnswerIndices((prev) =>
      prev.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)),
    );
    if (singleAnswerIndex === idx) setSingleAnswerIndex(null);
    else if (singleAnswerIndex !== null && singleAnswerIndex > idx)
      setSingleAnswerIndex(singleAnswerIndex - 1);
    if (
      validationErrors.options &&
      newOptions.filter((o) => o.trim() !== "").length >= 2
    ) {
      setValidationErrors((prev) => ({ ...prev, options: undefined }));
    }
  };

  // Update the text of an option and clear validation for options
  const handleUpdateOption = (idx: number, val: string) => {
    const newOptions = answerOptions.map((o, i) => (i === idx ? val : o));
    setAnswerOptions(newOptions);
    if (
      validationErrors.options &&
      newOptions.filter((o) => o.trim() !== "").length >= 2
    ) {
      setValidationErrors((prev) => ({ ...prev, options: undefined }));
    }
  };

  // Reorder options array after drag-and-drop ends
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

  // Validate form inputs and set submission data
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
      if (filledOptions.length < 2) {
        newErrors.options = "Укажите минимум два варианта ответа";
      } else if (answerOptions.some((o) => o.trim() === "")) {
        newErrors.options = "Заполните все поля вариантов ответа";
      } else {
        if (
          data.questionType === "single-choice" &&
          singleAnswerIndex === null
        ) {
          newErrors.correctAnswer = "Выберите правильный вариант";
        }
        if (
          data.questionType === "multiple-choice" &&
          multipleAnswerIndices.length === 0
        ) {
          newErrors.correctAnswers = "Выберите правильные варианты";
        }
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

  // Reset related states when question type changes
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

  // Reset entire form to its initial state
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
      {/* Card container wrapping the entire question form */}
      <Card className="mb-4 p-4 w-full mx-auto" shadow="sm">
        {/* Form component handling validation and events */}
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
          {/* Text area for entering the question prompt */}
          <Textarea
            isRequired
            errorMessage={validationErrors.question}
            label="Формулировка вопроса"
            labelPlacement="outside"
            name="questionText"
            placeholder="Введите текст вопроса"
            minRows={5}
          />

          {/* Dropdown selector for question type */}
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

          {/* Render answer choices for single/multiple choice questions */}
          {["single-choice", "multiple-choice"].includes(questionType) && (
            <div className="flex flex-col gap-3 items-center w-full">
              <p className="font-medium text-center w-full">Варианты ответа</p>
              <div className="flex flex-col gap-2 items-center w-full">
                {answerOptions.map((o, i) => (
                  <React.Fragment key={i}>
                    <div className="flex items-center gap-1 w-full justify-center">
                      {questionType === "single-choice" && (
                        <Checkbox
                          aria-label="Выбрать правильный вариант"
                          isDisabled={
                            singleAnswerIndex !== null && singleAnswerIndex !== i
                          }
                          isSelected={singleAnswerIndex === i}
                          onValueChange={(checked) => {
                            setSingleAnswerIndex(checked ? i : null);
                            if (validationErrors.correctAnswer) {
                              setValidationErrors((prev) => ({
                                ...prev,
                                correctAnswer: undefined,
                              }));
                            }
                          }}
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
                            if (validationErrors.correctAnswers) {
                              setValidationErrors((prev) => ({
                                ...prev,
                                correctAnswers: undefined,
                              }));
                            }
                          }}
                        />
                      )}
                      <Input
                        className="flex-1 max-w-md"
                        name="options"
                        placeholder={`Вариант ${i + 1}`}
                        value={o}
                        onChange={(e) => handleUpdateOption(i, e.target.value)}
                        isInvalid={
                          !!validationErrors.options &&
                          (answerOptions.filter((x) => x.trim()).length < 2 ||
                            !o.trim())
                        }
                      />
                      <Button
                        isIconOnly
                        aria-label="Удалить вариант"
                        className="transition-none"
                        color="danger"
                        type="button"
                        variant="flat"
                        onPress={() => handleRemoveOption(i)}
                        isDisabled={i < 2}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  </React.Fragment>
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

          {/* Drag-and-drop interface for ordering questions */}
          {questionType === "ordering" && (
            <div className="flex flex-col gap-2 items-center w-full">
              <p className="font-medium text-center w-full">
                Упорядочите ответы
              </p>
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
                  <div className="flex flex-col items-center w-full">
                    {answerOptions.map((o, i) => (
                      <React.Fragment key={`opt-${i}`}>
                        <div className="flex items-center w-full justify-center max-w-lg">
                          <SortableChoice
                            dragHandleProps={{ tabIndex: 0 }}
                            id={`opt-${i}`}
                            inputRef={undefined}
                            value={o}
                            onChange={(val) => handleUpdateOption(i, val)}
                            onRemove={() => handleRemoveOption(i)}
                            removeDisabled={i < 2}
                            isInvalid={
                              !!validationErrors.options &&
                              (answerOptions.filter((x) => x.trim()).length <
                                2 || !o.trim())
                            }
                          />
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <Button
                className="self-center"
                type="button"
                onPress={handleAddOption}
              >
                Добавить вариант ответа
              </Button>
            </div>
          )}

          {/* Input for sample answer in open-ended questions */}
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

          {/* Read-only display of correct answer(s) */}
          {questionType && questionType !== "open-ended" && (
            <Textarea
              minRows={1}
              name="displayCorrect"
              label="Правильные варианты ответов"
              labelPlacement="outside"
              placeholder="Здесь появятся правильные варианты ответов"
              value={
                questionType === "single-choice"
                  ? answerOptions[singleAnswerIndex ?? -1] ?? ""
                  : questionType === "multiple-choice"
                  ? multipleAnswerIndices
                      .map((i) => answerOptions[i])
                      .join(", ")
                  : questionType === "ordering"
                  ? answerOptions.every((o) => !o.trim())
                    ? ""
                    : answerOptions.join(", ")
                  : ""
              }
              isDisabled
              isInvalid={
                !!(
                  validationErrors.options ||
                  validationErrors.correctAnswer ||
                  validationErrors.correctAnswers
                )
              }
              errorMessage={
                validationErrors.options ||
                validationErrors.correctAnswer ||
                validationErrors.correctAnswers
              }
            />
          )}

          {/* Checkbox to confirm question validity */}
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

          {/* Buttons for submitting or resetting the form */}
          <div className="flex gap-4">
            <Button className="flex-1" color="primary" type="submit">
              Предложить
            </Button>
            <Button className="flex-1" type="reset" variant="bordered">
              Сбросить
            </Button>
          </div>
        </Form>

        {/* Show submission result as pretty-printed JSON */}
        {submission && (
          <pre className="mt-6 bg-gray-100 p-3 rounded">
            {JSON.stringify(submission, null, 2)}
          </pre>
        )}
      </Card>
    </div>
  );
}
