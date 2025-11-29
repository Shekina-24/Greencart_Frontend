'use client';

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;
    const selectors = [
      'a[href]','button','textarea','input[type="text"]','input[type="radio"]','input[type="checkbox"]','select'
    ];
    const focusables = Array.from(panel.querySelectorAll<HTMLElement>(selectors.join(','))).filter(
      (element) => !element.hasAttribute("disabled")
    );
    const initial = closeBtnRef.current || focusables[0];
    initial?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || focusables.length === 0) {
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener("keydown", onKey);
    return () => panel.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (container) return;

    let root = document.getElementById("greencart-modal-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "greencart-modal-root";
      document.body.appendChild(root);
    }

    const el = document.createElement("div");
    root.appendChild(el);
    setContainer(el);

    // Keep the node mounted to avoid React trying to detach an already-removed portal target.
  }, [container]);

  if (!isOpen || !container) {
    return null;
  }

  const content = (
    <div
      className="modal is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div className="modal__panel" ref={panelRef} onClick={(event) => event.stopPropagation()}>
        <header className="modal__header">
          <h3 id={titleId}>{title}</h3>
          <button
            className="modal__close"
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenetre"
            ref={closeBtnRef}
          >
            X
          </button>
        </header>
        <div>{children}</div>
        {actions ? <div className="modal__actions">{actions}</div> : null}
      </div>
    </div>
  );

  return createPortal(content, container);
}
