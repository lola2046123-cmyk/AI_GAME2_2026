import { AnimatePresence, motion } from "motion/react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "确认",
  cancelLabel = "取消",
  variant = "default",
  onConfirm,
  onCancel
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="关闭"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            className="surface-card relative z-10 w-full max-w-md p-6 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.88)]"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            <h2
              id="confirm-title"
              className="font-headline text-lg font-bold text-on-background"
            >
              {title}
            </h2>
            <p
              id="confirm-desc"
              className="font-body mt-3 text-sm leading-[1.21] text-primary/50"
            >
              {message}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary-outline px-4 py-2.5 text-sm font-label font-medium"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2.5 text-sm font-label font-semibold transition-opacity hover:opacity-95 ${
                  variant === "danger"
                    ? "rounded-full bg-red-500/90 text-white shadow-[0_8px_28px_-8px_rgba(239,68,68,0.6)]"
                    : "btn-primary"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
