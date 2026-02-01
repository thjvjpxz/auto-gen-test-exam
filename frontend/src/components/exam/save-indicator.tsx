"use client";

import {
  Cloud,
  CloudOff,
  RefreshCw,
  Check,
  AlertCircle,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useExamAttemptStore } from "@/stores/exam-attempt";

interface StatusConfig {
  icon: typeof Cloud;
  text: string;
  colorClass: string;
  bgClass: string;
  iconClass: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  synced: {
    icon: Check,
    text: "Đã đồng bộ",
    colorClass: "text-green-600",
    bgClass: "bg-green-100",
    iconClass: "",
  },
  syncing: {
    icon: RefreshCw,
    text: "Đang lưu...",
    colorClass: "text-blue-600",
    bgClass: "bg-blue-100",
    iconClass: "animate-spin",
  },
  offline: {
    icon: CloudOff,
    text: "Offline",
    colorClass: "text-yellow-600",
    bgClass: "bg-yellow-100",
    iconClass: "",
  },
  error: {
    icon: AlertCircle,
    text: "Lỗi đồng bộ",
    colorClass: "text-red-600",
    bgClass: "bg-red-100",
    iconClass: "",
  },
  idle: {
    icon: Cloud,
    text: "Chờ lưu",
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted",
    iconClass: "",
  },
};

/**
 * Visual indicator for local save and server sync status.
 */
export function SaveIndicator() {
  const localSaveStatus = useExamAttemptStore((s) => s.localSaveStatus);
  const serverSyncStatus = useExamAttemptStore((s) => s.serverSyncStatus);
  const lastSyncedAt = useExamAttemptStore((s) => s.lastSyncedAt);

  const config = STATUS_CONFIG[serverSyncStatus] || STATUS_CONFIG.idle;
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
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all duration-300",
        config.bgClass,
      )}
    >
      {/* Icon with container */}
      <div
        className={cn(
          "flex size-5 items-center justify-center rounded-full",
          serverSyncStatus === "synced" && "bg-green-200",
          serverSyncStatus === "syncing" && "bg-blue-200",
          serverSyncStatus === "error" && "bg-red-200",
        )}
      >
        <Icon className={cn("size-3", config.colorClass, config.iconClass)} />
      </div>

      {/* Status text */}
      <span className={cn("hidden font-medium sm:inline", config.colorClass)}>
        {config.text}
      </span>

      {/* Last synced time */}
      {serverSyncStatus === "synced" && lastSyncedAt && (
        <span className="hidden text-xs text-muted-foreground md:inline">
          {formatTime(lastSyncedAt)}
        </span>
      )}

      {/* Local saving indicator */}
      {localSaveStatus === "saving" && serverSyncStatus !== "syncing" && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Wifi className="size-3 animate-pulse" />
          <span className="hidden lg:inline">Local...</span>
        </div>
      )}
    </div>
  );
}
