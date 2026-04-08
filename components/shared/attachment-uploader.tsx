"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AttachmentUploader({
  projectId,
  taskId
}: {
  projectId?: string;
  taskId?: string;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!file) {
          return;
        }

        const body = new FormData();
        body.append("file", file);
        if (projectId) {
          body.append("project_id", projectId);
        }
        if (taskId) {
          body.append("task_id", taskId);
        }

        startTransition(async () => {
          await fetch("/api/upload", { method: "POST", body });
          setFile(null);
          router.refresh();
        });
      }}
    >
      <Input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      <Button type="submit" disabled={!file || isPending}>
        {isPending ? "Uploading..." : "Upload attachment"}
      </Button>
    </form>
  );
}
