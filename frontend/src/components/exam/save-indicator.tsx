"use client";

import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExamAttemptStore } from "@/stores/exam-attempt";

/**
 * Visual indicator for local save and server sync status.
 */
export function SaveIndicator() {
  const localSaveStatus = useExamAttemptStore((s) => s.localSaveStatus);
  const serverSyncStatus = useExamAttemptStore((s) => s.serverSyncStatus);
  const lastSyncedAt = useExamAttemptStore((s) => s.lastSyncedAt);

  const statusConfig = {
    synced: {
      icon: Check,
      text: "Đã đồng bộ",
      colorClass: "text-green-600",
      iconClass: "",
    },
    syncing: {
      icon: RefreshCw,
      text: "Đang lưu...",
      colorClass: "text-blue-600",
      iconClass: "animate-spin",
    },
    offline: {
      icon: CloudOff,
      text: "Offline",
      colorClass: "text-yellow-600",
      iconClass: "",
    },
    error: {
      icon: AlertCircle,
      text: "Lỗi đồng bộ",
      colorClass: "text-red-600",
      iconClass: "",
    },
    idle: {
      icon: Cloud,
      text: "Chờ lưu",
      colorClass: "text-muted-foreground",
      iconClass: "",
    },
  };

  const config = statusConfig[serverSyncStatus] || statusConfig.idle;
  const Icon = config.icon;

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={cn("h-4 w-4", config.colorClass, config.iconClass)} />
      <span className={cn("hidden sm:inline", config.colorClass)}>
        {config.text}
      </span>
      {serverSyncStatus === "synced" && lastSyncedAt && (
        <span className="text-xs text-muted-foreground hidden md:inline">
          {formatTime(lastSyncedAt)}
        </span>
      )}
      {localSaveStatus === "saving" && serverSyncStatus !== "syncing" && (
        <span className="text-xs text-muted-foreground">Đang lưu local...</span>
      )}
    </div>
  );
}
