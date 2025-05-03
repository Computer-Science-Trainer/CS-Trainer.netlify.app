import React from "react";

export default function ProblemsLayout({
  leftPanel,
  rightPanel,
  centralPanel,
}: {
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  centralPanel?: React.ReactNode;
}) {
  return (
    <section className="max-w-7xl mx-auto p-4 flex gap-4 flex-col lg:flex-row lg:gap-4 items-start justify-center">
      {leftPanel && (
        <aside className="hidden lg:block w-[185px] flex-shrink-0 sticky top-32 h-fit self-start">
          <div>{leftPanel}</div>
        </aside>
      )}
      {/* Центральная панель */}
      {centralPanel && (
        <aside className="flex flex-col items-center justify-center w-full">
          <div className="w-full">{centralPanel}</div>
        </aside>
      )}
      {/* Правая панель */}
      {rightPanel && (
        <aside className="hidden lg:block w-[200px] flex-shrink-0 sticky top-32 h-fit self-start">
          <div>{rightPanel}</div>
        </aside>
      )}
    </section>
  );
}
