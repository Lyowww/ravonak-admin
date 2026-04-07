"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DropdownOption = {
  value: string;
  label: string;
};

type CustomDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  buttonClassName?: string;
  menuClassName?: string;
};

export function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = "Выберите",
  disabled = false,
  buttonClassName = "",
  menuClassName = "",
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPosition({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        className={`flex w-full items-center justify-between gap-3 text-left outline-none disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={selected ? "" : "text-[#8a8a8a]"}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-[#2b2f33] transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {mounted && open && !disabled
        ? createPortal(
            <div
              ref={menuRef}
              className={`max-h-64 overflow-auto rounded-2xl border border-[#e6e8eb] bg-white shadow-lg ${menuClassName}`}
              style={{
                position: "fixed",
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                zIndex: 2147483647,
              }}
            >
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full px-4 py-2.5 text-left text-[14px] transition hover:bg-[#f3f4f6] ${
                      active ? "bg-[#eef3f7] text-[#0a0a0a]" : "text-[#26282c]"
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
