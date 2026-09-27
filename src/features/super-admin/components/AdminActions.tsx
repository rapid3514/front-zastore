import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Ban,
  Eye,
  MoreHorizontal,
  Pencil,
  ShieldMinus,
  ShieldCheck,
} from "lucide-react";
import { normalizeApiError } from "@/shared/api/api-error";
import { useToastStore } from "@/shared/ui/toast-store";
import { useBlockAdminMutation } from "../hooks/use-block-admin";
import { useDemoteAdminMutation } from "../hooks/use-demote-admin";
import { useUnblockAdminMutation } from "../hooks/use-unblock-admin";
import type { AdminUser } from "../types/super-admin.types";
import { ConfirmDialog } from "./ConfirmDialog";

type ActionType = "block" | "unblock" | "demote" | null;

interface AdminActionsProps {
  admin: AdminUser;
  showView?: boolean;
  mode?: "menu" | "demote-button";
  onEdit?: () => void;
  onDemoted?: () => void;
}

export function AdminActions({
  admin,
  showView = true,
  mode = "menu",
  onEdit,
  onDemoted,
}: AdminActionsProps) {
  const [confirmation, setConfirmation] = useState<ActionType>(null);
  const block = useBlockAdminMutation(admin.id);
  const unblock = useUnblockAdminMutation(admin.id);
  const demote = useDemoteAdminMutation(admin.id);
  const showToast = useToastStore((state) => state.show);
  const isPending = block.isPending || unblock.isPending || demote.isPending;

  async function runConfirmedAction() {
    if (!confirmation) return;
    try {
      if (confirmation === "block") {
        await block.mutateAsync();
        showToast("Admin bloklandi");
      }
      if (confirmation === "unblock") {
        await unblock.mutateAsync();
        showToast("Admin blokdan chiqarildi");
      }
      if (confirmation === "demote") {
        await demote.mutateAsync();
        showToast(
          "Adminlik huquqi bekor qilindi. Foydalanuvchi oddiy mijozga o‘tkazildi",
        );
        onDemoted?.();
      }
      setConfirmation(null);
    } catch (cause) {
      showToast(normalizeApiError(cause).message, "error");
      setConfirmation(null);
    }
  }

  const isDemote = confirmation === "demote";
  const isBlock = confirmation === "block";

  return (
    <>
      {mode === "demote-button" ? (
        <button
          type="button"
          onClick={() => setConfirmation("demote")}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 text-sm font-extrabold text-red-600 transition hover:bg-red-100"
        >
          <ShieldMinus className="size-4" />
          Adminlik huquqini bekor qilish
        </button>
      ) : (
        <details className="sa-actions relative">
          <summary
            className="sa-icon-button cursor-pointer list-none"
            aria-label={`${admin.firstName} uchun amallar`}
          >
            <MoreHorizontal className="size-5" />
          </summary>
          <div className="absolute right-0 top-12 z-20 w-64 rounded-2xl border border-white/70 bg-white/95 p-2 shadow-2xl backdrop-blur-xl">
            {showView ? (
              <Link
                to={`/super-admin/admins/${admin.id}`}
                className="sa-action-item"
              >
                <Eye className="size-4" />
                Ko‘rish
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => onEdit?.()}
              className="sa-action-item"
            >
              <Pencil className="size-4" />
              Tahrirlash
            </button>
            <button
              type="button"
              onClick={() =>
                setConfirmation(admin.isBlocked ? "unblock" : "block")
              }
              className="sa-action-item"
            >
              {admin.isBlocked ? (
                <ShieldCheck className="size-4" />
              ) : (
                <Ban className="size-4" />
              )}
              {admin.isBlocked ? "Blokdan chiqarish" : "Bloklash"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmation("demote")}
              className="sa-action-item text-red-600 hover:bg-red-50"
            >
              <ShieldMinus className="size-4" />
              Adminlik huquqini bekor qilish
            </button>
          </div>
        </details>
      )}

      <ConfirmDialog
        open={confirmation !== null}
        title={
          isDemote
            ? "Adminlik huquqini bekor qilasizmi?"
            : isBlock
              ? "Adminni bloklamoqchimisiz?"
              : "Adminni blokdan chiqarmoqchimisiz?"
        }
        description={
          isDemote
            ? "Foydalanuvchi o‘chirilmaydi: uning roli oddiy mijozga o‘zgaradi va u bot hamda do‘kondan foydalanishda davom etadi."
            : isBlock
              ? "Bloklangan foydalanuvchi botga ham, boshqaruv paneliga ham kira olmaydi."
              : "Foydalanuvchi bot va boshqaruv paneliga yana kira oladi."
        }
        confirmLabel={
          isDemote
            ? "Adminlikni bekor qilish"
            : isBlock
              ? "Bloklash"
              : "Blokdan chiqarish"
        }
        danger={isDemote || isBlock}
        pending={isPending}
        onConfirm={runConfirmedAction}
        onOpenChange={(open) => !open && setConfirmation(null)}
      />
    </>
  );
}
