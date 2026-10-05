"use client";

import {
  type FormEvent,
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { shrinkImageForUpload } from "@/lib/client-image";
import type { GenerationQuotaSnapshot } from "@/lib/generation-quota";
import { getStylePreset, stylePresets } from "@/lib/style-presets";
import {
  MAX_SOURCE_IMAGE_LABEL,
  isStudioGenerateError,
  rejectSourceImage,
  type StudioGeneration,
  type StudioPreset,
} from "@/lib/studio";
import type { GenerationHistorySummaryItem, StudioWorkbenchProps } from "@/lib/types";
import { DEFAULT_WORKERS_AI_IMAGE_MODEL } from "@/lib/workers-ai-models";

export type StudioWorkbenchContextValue = {
  error: string | null;
  file: File | null;
  history: GenerationHistorySummaryItem[];
  inputId: string;
  isGenerateDisabled: boolean;
  isLoading: boolean;
  quota: GenerationQuotaSnapshot;
  result: StudioGeneration | null;
  resultPreview: string | null;
  selectedPreset: StudioPreset;
  selectedStyle: string;
  sourcePreview: string | null;
  viewedHistoryItem: GenerationHistorySummaryItem | null;
  closeHistoryPreview: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  openHistoryPreview: (item: GenerationHistorySummaryItem) => void;
  removeHistoryItem: (id: string) => Promise<void>;
  replaceFile: (nextFile: File | null) => void;
  selectStyle: (styleSlug: string) => void;
};

const StudioWorkbenchContext = createContext<StudioWorkbenchContextValue | null>(null);

const uploadInputId = "studio-image-upload";

/** Maps a finished render to the history row shape the UI renders. */
function toHistoryItem(generation: StudioGeneration): GenerationHistorySummaryItem {
  return {
    id: generation.id,
    clerkUserId: "",
    originalFileName: null,
    sourceImageUrl: "",
    resultImageUrl: generation.imageUrl,
    styleSlug: generation.presetId,
    styleLabel: generation.presetLabel,
    model: DEFAULT_WORKERS_AI_IMAGE_MODEL,
    promptUsed: "",
    createdAt: generation.createdAt,
  };
}

export function StudioWorkbenchProvider({
  children,
  clerkUserId,
  initialHistory,
  initialQuota,
}: PropsWithChildren<StudioWorkbenchProps>) {
  const value = useStudioWorkbenchValue({ clerkUserId, initialHistory, initialQuota });

  return (
    <StudioWorkbenchContext.Provider value={value}>{children}</StudioWorkbenchContext.Provider>
  );
}

export function useStudioWorkbench() {
  const value = useContext(StudioWorkbenchContext);

  if (!value) {
    throw new Error("useStudioWorkbench must be used within StudioWorkbenchProvider.");
  }

  return value;
}

function useStudioWorkbenchValue({
  initialHistory,
  initialQuota,
}: StudioWorkbenchProps): StudioWorkbenchContextValue {
  const [selectedStyle, setSelectedStyle] = useState<string>(stylePresets[0]?.id ?? "");
  const [source, setSource] = useState<{ file: File; previewUrl: string } | null>(null);
  const [result, setResult] = useState<StudioGeneration | null>(null);
  const [history, setHistory] = useState<GenerationHistorySummaryItem[]>(initialHistory);
  const [viewedHistoryItem, setViewedHistoryItem] = useState<GenerationHistorySummaryItem | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quota, setQuota] = useState<GenerationQuotaSnapshot>(initialQuota);

  // The blob URL lives in a ref so we can revoke the previous one when the photo
  // changes and release the last one when the workspace unmounts. Deriving the
  // file/preview from state keeps object URLs out of effects entirely.
  const objectUrlRef = useRef<string | null>(null);

  const releaseSourceUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => releaseSourceUrl, [releaseSourceUrl]);

  const file = source?.file ?? null;
  const sourcePreview = source?.previewUrl ?? null;

  const replaceFile = useCallback(
    (nextFile: File | null) => {
      setError(null);
      if (!nextFile) {
        releaseSourceUrl();
        setSource(null);
        return;
      }

      const rejection = rejectSourceImage(nextFile);
      if (rejection === "type") {
        setError("That file type is not supported. Use a JPEG, PNG or WebP image.");
        return;
      }
      if (rejection === "size") {
        setError(`That image is larger than ${MAX_SOURCE_IMAGE_LABEL}.`);
        return;
      }

      const previewUrl = URL.createObjectURL(nextFile);
      releaseSourceUrl();
      objectUrlRef.current = previewUrl;
      setSource({ file: nextFile, previewUrl });
    },
    [releaseSourceUrl],
  );

  const selectStyle = useCallback((styleSlug: string) => setSelectedStyle(styleSlug), []);

  const openHistoryPreview = useCallback((item: GenerationHistorySummaryItem) => {
    setViewedHistoryItem(item);
    setError(null);
  }, []);

  const closeHistoryPreview = useCallback(() => setViewedHistoryItem(null), []);

  const removeHistoryItem = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/generations/${id}`, { method: "DELETE" });

      if (!response.ok && response.status !== 404) {
        setError("Couldn't delete that render. Please try again.");
        return;
      }

      setHistory((current) => current.filter((item) => item.id !== id));
      setViewedHistoryItem((current) => (current?.id === id ? null : current));
    } catch {
      setError("Couldn't reach the studio. Check your connection and try again.");
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!file || !selectedStyle) {
        setError("Upload a photo and choose a style first.");
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        // Shrink only what we upload; the on-screen preview keeps the original.
        const payloadFile = await shrinkImageForUpload(file);

        const body = new FormData();
        body.append("photo", payloadFile);
        body.append("presetId", selectedStyle);

        const response = await fetch("/api/generate", { method: "POST", body });

        let json: unknown = null;
        try {
          json = await response.json();
        } catch {
          json = null;
        }

        if (!response.ok) {
          const nextQuota = (json as { quota?: GenerationQuotaSnapshot } | null)?.quota;
          if (nextQuota) setQuota(nextQuota);

          setError(
            isStudioGenerateError(json)
              ? json.error.message
              : response.status === 401
                ? "Please sign in again to keep using the studio."
                : "Something went wrong while rendering. Please try again.",
          );
          return;
        }

        const generation = json as StudioGeneration;
        setResult(generation);
        setHistory((current) => [
          toHistoryItem(generation),
          ...current.filter((item) => item.id !== generation.id),
        ]);
        if (generation.quota) setQuota(generation.quota);
      } catch {
        setError("Couldn't reach the studio. Check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [file, selectedStyle],
  );

  const selectedPreset = useMemo(
    () => getStylePreset(selectedStyle) ?? stylePresets[0],
    [selectedStyle],
  );

  const isGenerateDisabled = !file || !selectedStyle || isLoading || quota.remaining <= 0;
  const resultPreview = result?.imageUrl ?? null;

  return useMemo(
    () => ({
      closeHistoryPreview,
      error,
      file,
      handleSubmit,
      history,
      inputId: uploadInputId,
      isGenerateDisabled,
      isLoading,
      openHistoryPreview,
      quota,
      removeHistoryItem,
      replaceFile,
      result,
      resultPreview,
      selectedPreset,
      selectedStyle,
      selectStyle,
      sourcePreview,
      viewedHistoryItem,
    }),
    [
      closeHistoryPreview,
      error,
      file,
      handleSubmit,
      history,
      isGenerateDisabled,
      isLoading,
      openHistoryPreview,
      quota,
      removeHistoryItem,
      replaceFile,
      result,
      resultPreview,
      selectedPreset,
      selectedStyle,
      selectStyle,
      sourcePreview,
      viewedHistoryItem,
    ],
  );
}
