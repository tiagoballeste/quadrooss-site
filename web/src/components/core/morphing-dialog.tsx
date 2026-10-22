"use client";

import {
  AnimatePresence,
  motion,
  type HTMLMotionProps,
  type Transition,
  type Variants,
} from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";

type MorphingDialogContextValue = {
  contentRef: React.RefObject<HTMLDivElement | null>;
  descriptionId: string;
  layoutId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  titleId: string;
  transition: Transition;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const MorphingDialogContext = createContext<MorphingDialogContextValue | null>(
  null,
);

function useMorphingDialog() {
  const context = useContext(MorphingDialogContext);

  if (!context) {
    throw new Error("Morphing dialog components must be used inside MorphingDialog.");
  }

  return context;
}

export function MorphingDialog({
  children,
  layoutId,
  transition = { type: "spring", bounce: 0.05, duration: 0.32 },
}: {
  children: ReactNode;
  layoutId: string;
  transition?: Transition;
}) {
  const [open, setOpen] = useState(false);
  const reactId = useId().replaceAll(":", "");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleId = `morphing-dialog-title-${reactId}`;
  const descriptionId = `morphing-dialog-description-${reactId}`;

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    contentRef.current
      ?.querySelector<HTMLElement>("[data-morphing-dialog-close]")
      ?.focus();
    const backgroundElements = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        !element.classList.contains("morphing-dialog__overlay"),
    );
    const backgroundState = backgroundElements.map((element) => ({
      ariaHidden: element.getAttribute("aria-hidden"),
      element,
      inert: element.inert,
    }));

    backgroundElements.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    html.classList.add("is-project-dialog-open");
    window.dispatchEvent(new CustomEvent("quad:modal-open"));

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        contentRef.current?.querySelectorAll<HTMLElement>(
          'button, a[href], iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusable.length === 0) {
        event.preventDefault();
        contentRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      html.classList.remove("is-project-dialog-open");
      window.dispatchEvent(new CustomEvent("quad:modal-close"));

      backgroundState.forEach(({ ariaHidden, element, inert }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });

      window.requestAnimationFrame(() => {
        if (triggerRef.current?.isConnected) triggerRef.current.focus();
        else if (previousFocus?.isConnected) previousFocus.focus();
      });
    };
  }, [open]);

  return (
    <MorphingDialogContext.Provider
      value={{
        contentRef,
        descriptionId,
        layoutId,
        open,
        setOpen,
        titleId,
        transition,
        triggerRef,
      }}
    >
      {children}
    </MorphingDialogContext.Provider>
  );
}

export function MorphingDialogTrigger({
  children,
  onClick,
  type = "button",
  ...props
}: HTMLMotionProps<"button">) {
  const { layoutId, open, setOpen, transition, triggerRef } =
    useMorphingDialog();

  return (
    <motion.button
      {...props}
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(true);
      }}
      ref={triggerRef}
      type={type}
    >
      <motion.span
        className="morphing-dialog__trigger-surface"
        layoutId={`${layoutId}-surface`}
        transition={transition}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}

export function MorphingDialogContainer({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { open, setOpen } = useMorphingDialog();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="morphing-dialog__overlay"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export function MorphingDialogContent({
  children,
  ...props
}: HTMLMotionProps<"div">) {
  const {
    contentRef,
    descriptionId,
    layoutId,
    titleId,
    transition,
  } = useMorphingDialog();

  return (
    <motion.div
      {...props}
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      aria-modal="true"
      layoutId={`${layoutId}-surface`}
      ref={contentRef}
      role="dialog"
      tabIndex={-1}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

export function MorphingDialogImage(props: HTMLMotionProps<"img">) {
  const { layoutId, transition } = useMorphingDialog();

  return (
    <motion.img
      {...props}
      layoutId={`${layoutId}-image`}
      transition={transition}
    />
  );
}

export function MorphingDialogTitle({
  children,
  ...props
}: HTMLMotionProps<"strong">) {
  const { layoutId, titleId, transition } = useMorphingDialog();

  return (
    <motion.strong
      {...props}
      id={titleId}
      layoutId={`${layoutId}-title`}
      transition={transition}
    >
      {children}
    </motion.strong>
  );
}

export function MorphingDialogSubtitle({
  children,
  ...props
}: HTMLMotionProps<"small">) {
  const { layoutId, transition } = useMorphingDialog();

  return (
    <motion.small
      {...props}
      layoutId={`${layoutId}-subtitle`}
      transition={transition}
    >
      {children}
    </motion.small>
  );
}

export function MorphingDialogDescription({
  children,
  disableLayoutAnimation: _disableLayoutAnimation,
  variants,
  ...props
}: HTMLMotionProps<"div"> & {
  disableLayoutAnimation?: boolean;
  variants?: Variants;
}) {
  const { descriptionId } = useMorphingDialog();

  return (
    <motion.div
      {...props}
      animate="animate"
      exit="exit"
      id={descriptionId}
      initial="initial"
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export function MorphingDialogClose({
  children,
  onClick,
  ...props
}: HTMLMotionProps<"button">) {
  const { setOpen } = useMorphingDialog();

  return (
    <motion.button
      {...props}
      aria-label="Fechar projeto"
      data-morphing-dialog-close
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
      type="button"
    >
      {children ?? (
        <span className="morphing-dialog__close-icon" aria-hidden="true" />
      )}
    </motion.button>
  );
}
