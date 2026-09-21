"use client";

import {
  ChevronDown,
  ChevronUp,
  FileCode2,
  Grid2X2,
  ImagePlus,
  List,
  ListFilter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { SellerTemplate } from "@/sanity/lib/template.service";

type TemplateStatus = "Draft" | "In review" | "Published" | "Rejected";

type Template = {
  id: string;
  name: string;
  price: string;
  stack: string;
  status: TemplateStatus;
  categoryId?: string;
  description?: string;
  previewUrl?: string;
  repository?: string;
  stackIds?: string[];
  imageUrl?: string;
};
type TemplateLayout = "grid" | "list";
type TemplateStatusFilter = "all" | TemplateStatus;
type TemplateForm = Omit<Template, "id" | "status" | "stack"> & {
  category: string;
  description: string;
  previewLink: string;
  repository: string;
  stack: string[];
};

const emptyForm: TemplateForm = {
  name: "",
  category: "",
  description: "",
  previewLink: "",
  repository: "",
  price: "",
  stack: [],
};

const STATUS_LABELS: Record<string, TemplateStatus> = {
  draft: "Draft",
  in_review: "In review",
  published: "Published",
  rejected: "Rejected",
};

function toTemplate(template: SellerTemplate): Template {
  return {
    id: template._id,
    name: template.name || "Untitled template",
    price: template.price === undefined ? "" : String(template.price),
    stack: (template.stack || []).join(", "),
    status: STATUS_LABELS[template.status || "draft"] || "Draft",
    categoryId: template.categoryId,
    description: template.description,
    previewUrl: template.previewUrl,
    repository: template.githubRepository,
    stackIds: template.stackIds,
    imageUrl: template.imageUrl,
  };
}

export function TemplatesDashboard({
  categories,
  stacks,
  templates: sellerTemplates,
}: {
  categories: { _id: string; title: string }[];
  stacks: { _id: string; name: string; iconUrl?: string }[];
  templates: SellerTemplate[];
}) {
  const router = useRouter();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [templates, setTemplates] = useState<Template[]>(() =>
    sellerTemplates.map(toTemplate),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [sheetContentElement, setSheetContentElement] =
    useState<HTMLDivElement | null>(null);
  const [draftState, setDraftState] = useState<"saved" | "saving">("saved");
  const draftIdRef = useRef<string | null>(null);
  const creatingDraft = useRef(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [layout, setLayout] = useState<TemplateLayout>("grid");
  const [statusFilter, setStatusFilter] = useState<TemplateStatusFilter>("all");
  const visibleTemplates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = normalized
      ? templates.filter((template) =>
          `${template.name} ${template.stack} ${template.status}`
            .toLowerCase()
            .includes(normalized),
        )
      : templates;
    return statusFilter === "all"
      ? filtered
      : filtered.filter((template) => template.status === statusFilter);
  }, [query, statusFilter, templates]);

  /**
   * Creates the Sanity document the first time there is something worth
   * storing. Opening the composer used to create one immediately, which left
   * an empty template behind every time it was closed without saving.
   */
  const ensureDraftId = useCallback(async (): Promise<string | null> => {
    if (draftIdRef.current) return draftIdRef.current;
    if (creatingDraft.current) return null;
    creatingDraft.current = true;
    try {
      const response = await fetch("/api/templates/drafts", { method: "POST" });
      if (!response.ok) throw new Error();
      const { id } = (await response.json()) as { id: string };
      draftIdRef.current = id;
      return id;
    } catch {
      return null;
    } finally {
      creatingDraft.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isComposerOpen || editingId) return;
    setDraftState("saving");
    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(
        "multivrs-template-draft",
        JSON.stringify(form),
      );
      // Nothing reaches Sanity until the listing has a name, so an abandoned
      // composer leaves nothing behind.
      if (!form.name.trim()) {
        setDraftState("saved");
        return;
      }
      void ensureDraftId()
        .then((id) =>
          id
            ? fetch(`/api/templates/${id}`, {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(form),
              })
            : null,
        )
        .then(() => setDraftState("saved"));
    }, 700);
    return () => window.clearTimeout(timeoutId);
  }, [editingId, ensureDraftId, form, isComposerOpen]);

  async function openComposer() {
    setEditingId(null);
    const storedDraft = window.localStorage.getItem("multivrs-template-draft");
    if (storedDraft) {
      try {
        setForm({ ...emptyForm, ...JSON.parse(storedDraft) });
      } catch {
        setForm(emptyForm);
      }
    } else {
      setForm(emptyForm);
    }
    setCoverFile(null);
    setGalleryFiles([]);
    draftIdRef.current = null;
    setDraftState("saved");
    setIsComposerOpen(true);
  }

  /** Reopen the composer against an existing listing. */
  function openEditor(template: Template) {
    setEditingId(template.id);
    draftIdRef.current = template.id;
    setForm({
      name: template.name,
      category: template.categoryId || "",
      description: template.description || "",
      previewLink: template.previewUrl || "",
      repository: template.repository || "",
      price: template.price,
      stack: template.stackIds || [],
    });
    setCoverFile(null);
    setGalleryFiles([]);
    setDraftState("saved");
    setIsComposerOpen(true);
  }

  async function deleteTemplate(template: Template) {
    const previous = templates;
    setTemplates((current) =>
      current.filter((item) => item.id !== template.id),
    );
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      toast.success(`${template.name} deleted`);
      router.refresh();
    } catch {
      setTemplates(previous);
      toast.error("That template could not be deleted.");
    }
  }

  function updateForm(field: keyof TemplateForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !form.name.trim() ||
      !form.category ||
      !form.stack.length ||
      !form.price
    )
      return;
    const targetId = editingId ?? (await ensureDraftId());
    if (!targetId) {
      toast.error("That template could not be saved.");
      return;
    }
    const upload = new FormData();
    // Status is omitted when editing so the server keeps the listing's
    // current review state; only new submissions enter review.
    upload.set(
      "template",
      JSON.stringify(editingId ? form : { ...form, status: "in_review" }),
    );
    if (coverFile) upload.set("cover", coverFile);
    for (const file of galleryFiles) upload.append("gallery", file);
    const response = await fetch(`/api/templates/${targetId}`, {
      method: "PATCH",
      body: upload,
    });
    if (!response.ok) {
      toast.error("That template could not be saved.");
      return;
    }
    const stackNames = form.stack
      .map((stackId) => stacks.find((stack) => stack._id === stackId)?.name)
      .filter(Boolean)
      .join(", ");
    setTemplates((current) =>
      editingId
        ? current.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  name: form.name.trim(),
                  price: form.price,
                  stack: stackNames,
                  categoryId: form.category,
                  description: form.description,
                  previewUrl: form.previewLink,
                  repository: form.repository,
                  stackIds: form.stack,
                }
              : item,
          )
        : [
            {
              id: targetId,
              name: form.name.trim(),
              price: form.price,
              stack: stackNames,
              status: "In review",
              categoryId: form.category,
              description: form.description,
              previewUrl: form.previewLink,
              repository: form.repository,
              stackIds: form.stack,
            },
            ...current,
          ],
    );
    if (!editingId) window.localStorage.removeItem("multivrs-template-draft");
    toast.success(editingId ? "Template updated" : "Template submitted");
    setEditingId(null);
    setIsComposerOpen(false);
    router.refresh();
  }

  function toggleStack(stack: string) {
    setForm((current) => ({
      ...current,
      stack: current.stack.includes(stack)
        ? current.stack.filter((item) => item !== stack)
        : [...current.stack, stack],
    }));
  }

  function adjustPrice(change: number) {
    setForm((current) => ({
      ...current,
      price: String(Math.max(0, Number(current.price || 0) + change)),
    }));
  }

  return (
    <div className="relative isolate flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="relative z-10 flex w-full flex-1 flex-col gap-5 px-5 py-8 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-sm font-semibold">Templates</h1>
          <Button onClick={openComposer} size="lg" type="button">
            <Plus className="size-4" /> Add New
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search templates"
              value={query}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Filter templates"
                className={cn(
                  "relative border-(--hairline) bg-black/5 dark:bg-black/20",
                  statusFilter !== "all" &&
                    "border-foreground/30 text-foreground",
                )}
                size="icon-lg"
                type="button"
                variant="outline"
              >
                <ListFilter className="size-4" />
                {statusFilter !== "all" ? (
                  <span className="absolute right-1 top-1 size-1.5 rounded-full bg-foreground" />
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["all", "Draft", "In review", "Published"] as const).map(
                (status) => (
                  <DropdownMenuCheckboxItem
                    checked={statusFilter === status}
                    key={status}
                    onCheckedChange={() => setStatusFilter(status)}
                  >
                    {status === "all" ? "All templates" : status}
                  </DropdownMenuCheckboxItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex rounded-lg border border-(--hairline) bg-black/5 p-1 dark:bg-black/20">
            <button
              aria-label="Grid view"
              aria-pressed={layout === "grid"}
              className={
                layout === "grid"
                  ? "flex size-7 items-center justify-center rounded-md bg-black/10 dark:bg-white/10"
                  : "flex size-7 items-center justify-center text-muted-foreground"
              }
              onClick={() => setLayout("grid")}
              type="button"
            >
              <Grid2X2 className="size-4" />
            </button>
            <button
              aria-label="List view"
              aria-pressed={layout === "list"}
              className={
                layout === "list"
                  ? "flex size-7 items-center justify-center rounded-md bg-black/10 dark:bg-white/10"
                  : "flex size-7 items-center justify-center text-muted-foreground"
              }
              onClick={() => setLayout("list")}
              type="button"
            >
              <List className="size-4" />
            </button>
          </div>
          <p className="px-2 text-xs text-muted-foreground">
            {templates.length}{" "}
            {templates.length === 1 ? "template" : "templates"}
          </p>
        </div>
        {templates.length === 0 ? (
          <EmptyTemplates onCreate={openComposer} />
        ) : visibleTemplates.length === 0 ? (
          <NoMatchingTemplates />
        ) : (
          <TemplateList
            layout={layout}
            onDelete={deleteTemplate}
            onEdit={openEditor}
            templates={visibleTemplates}
          />
        )}
      </div>

      <Sheet onOpenChange={setIsComposerOpen} open={isComposerOpen}>
        <SheetContent
          className="h-dvh max-h-dvh w-screen max-w-none overflow-y-auto border-[var(--hairline)] bg-background p-0 sm:max-w-none"
          ref={setSheetContentElement}
          side="bottom"
        >
          <SheetHeader className="sticky top-0 z-10 border-b border-[var(--hairline)] bg-background px-5 py-5 lg:px-8">
            <SheetTitle className="text-lg font-semibold">
              New template
            </SheetTitle>
            <SheetDescription>
              Complete the listing details, then submit it for review.
            </SheetDescription>
          </SheetHeader>
          <form
            className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-8"
            onSubmit={saveTemplate}
          >
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              <Field label="Template name" required>
                <Input
                  onChange={(event) => updateForm("name", event.target.value)}
                  placeholder="e.g. Orbit — SaaS landing page"
                  required
                  value={form.name}
                />
              </Field>
              <Field label="Preview link" required>
                <Input
                  onChange={(event) =>
                    updateForm("previewLink", event.target.value)
                  }
                  placeholder="https://your-template-demo.com"
                  required
                  type="url"
                  value={form.previewLink}
                />
              </Field>
              <Field
                className="md:col-span-2"
                label="Short description"
                required
              >
                <Textarea
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Tell buyers what they can build with this template."
                  required
                  rows={4}
                  value={form.description}
                />
              </Field>
              <Field label="Category" required>
                <Select
                  onValueChange={(value) => updateForm("category", value)}
                  value={form.category}
                >
                  <SelectTrigger className="h-10 w-full rounded-md border-input bg-transparent">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent
                    className="rounded-md"
                    portalContainer={sheetContentElement}
                  >
                    {categories.map((category) => (
                      <SelectItem
                        className="cursor-pointer rounded-sm"
                        key={category._id}
                        value={category._id}
                      >
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Stacks" required>
                <StackPicker
                  onToggle={toggleStack}
                  portalContainer={sheetContentElement}
                  selected={form.stack}
                  stacks={stacks}
                />
              </Field>
              <Field
                label="Private GitHub repository"
                hint="Only private repositories can be submitted."
                required
              >
                <Input
                  onChange={(event) =>
                    updateForm("repository", event.target.value)
                  }
                  placeholder="https://github.com/you/private-repo"
                  required
                  type="url"
                  value={form.repository}
                />
              </Field>
              <Field
                label="Buyer price (USD)"
                hint="5% up to $49.99 and 10% above. Payments are processed by Stripe."
                required
              >
                <div className="flex overflow-hidden rounded-md border border-input focus-within:ring-2 focus-within:ring-ring/50">
                  <Input
                    className="border-0 text-center shadow-none focus-visible:ring-0"
                    inputMode="numeric"
                    onChange={(event) =>
                      updateForm("price", event.target.value)
                    }
                    placeholder="49"
                    required
                    type="text"
                    value={form.price}
                  />
                  <div className="flex w-10 shrink-0 flex-col border-l border-input">
                    <button
                      aria-label="Increase price by one dollar"
                      className="flex flex-1 items-center justify-center border-b border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      onClick={() => adjustPrice(1)}
                      type="button"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      aria-label="Decrease price by one dollar"
                      className="flex flex-1 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      onClick={() => adjustPrice(-1)}
                      type="button"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                  </div>
                </div>
              </Field>
              <Field label="Template cover image" required>
                <FileField
                  description="This is the first image buyers see in the marketplace."
                  icon={<ImagePlus className="size-4" />}
                  label="Choose image"
                  files={coverFile ? [coverFile] : []}
                  onFilesChange={(files) => setCoverFile(files[0] || null)}
                  onRemove={() => setCoverFile(null)}
                />
              </Field>
              <Field label="Gallery">
                <FileField
                  description="Add product screens, responsive views, or key flows."
                  icon={<Upload className="size-4" />}
                  label="Choose images"
                  files={galleryFiles}
                  multiple
                  onFilesChange={(files) =>
                    setGalleryFiles((current) => [...current, ...files])
                  }
                  onRemove={(index) =>
                    setGalleryFiles((files) =>
                      files.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                />
              </Field>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--hairline)] pt-6">
              <p
                className="mr-auto text-xs text-muted-foreground"
                aria-live="polite"
              >
                {draftState === "saving"
                  ? "Saving draft…"
                  : "Draft saved automatically"}
              </p>
              <Button
                onClick={() => setIsComposerOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button name="intent" type="submit" value="review">
                Submit for review
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Edit and delete for one listing. */
function TemplateActions({
  onDelete,
  onEdit,
  template,
}: {
  onDelete: (template: Template) => void;
  onEdit: (template: Template) => void;
  template: Template;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Actions for ${template.name}`}
          size="icon-sm"
          variant="ghost"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={() => onEdit(template)}>
          <Pencil className="size-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => onDelete(template)}
          variant="destructive"
        >
          <Trash2 className="size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Drafts often have no price yet, so show a dash instead of "$NaN". */
function formatPrice(price: string): string {
  const value = Number(price);
  return price === "" || Number.isNaN(value) ? "—" : `$${value.toFixed(2)}`;
}

function TemplateList({
  layout,
  onDelete,
  onEdit,
  templates,
}: {
  layout: TemplateLayout;
  onDelete: (template: Template) => void;
  onEdit: (template: Template) => void;
  templates: Template[];
}) {
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <article
            className="group overflow-hidden rounded-2xl border border-[var(--hairline-strong)] bg-white/[0.015]"
            key={template.id}
          >
            <div className="aspect-[16/9] border-b border-[var(--hairline)] bg-white/[0.02] p-4">
              {template.imageUrl ? (
                <div className="relative h-full w-full overflow-hidden rounded-lg border border-[var(--hairline)]">
                  <Image
                    alt={template.name}
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    src={template.imageUrl}
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[var(--hairline)] bg-black/10">
                  <FileCode2 className="size-6 text-muted-foreground transition-transform duration-200 group-hover:scale-110" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-medium">
                    {template.name}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {template.stack}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {formatPrice(template.price)}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="inline-flex rounded-full border border-[var(--hairline)] px-2 py-1 font-geist-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
                  {template.status}
                </span>
                <TemplateActions
                  onDelete={onDelete}
                  onEdit={onEdit}
                  template={template}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--hairline-strong)] bg-white/[0.015]">
      {templates.map((template) => (
        <div
          className="flex items-center gap-4 border-b border-[var(--hairline)] p-4 last:border-b-0"
          key={template.id}
        >
          {template.imageUrl ? (
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[var(--hairline)]">
              <Image
                alt={template.name}
                className="object-cover"
                fill
                sizes="48px"
                src={template.imageUrl}
              />
            </div>
          ) : (
            <div className="grid size-12 shrink-0 place-items-center rounded-lg border border-[var(--hairline)] bg-white/[0.03]">
              <FileCode2 className="size-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{template.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {template.stack}
            </p>
          </div>
          <span className="hidden text-sm text-muted-foreground sm:block">
            {formatPrice(template.price)}
          </span>
          <span className="rounded-full border border-[var(--hairline)] px-2 py-1 font-geist-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
            {template.status}
          </span>
          <TemplateActions
            onDelete={onDelete}
            onEdit={onEdit}
            template={template}
          />
        </div>
      ))}
    </div>
  );
}

function EmptyTemplates({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[420px] flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--hairline-strong)] bg-white/[0.015] px-6 text-center">
      <span className="mb-5 flex size-14 items-center justify-center rounded-full border border-[var(--hairline)]">
        <Plus className="size-6 text-muted-foreground" />
      </span>
      <h2 className="text-lg font-medium">No templates yet</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Create a new template and list it in the marketplace.
      </p>
      <Button className="mt-7" onClick={onCreate} type="button">
        <Plus className="size-4" /> Create template
      </Button>
    </div>
  );
}

function NoMatchingTemplates() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-[var(--hairline-strong)] text-center">
      <Search className="size-5 text-muted-foreground" />
      <h2 className="mt-3 text-base font-medium">No matching templates</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Try a different search.
      </p>
    </div>
  );
}

function Field({
  children,
  className,
  hint,
  label,
  required,
}: {
  children: React.ReactNode;
  className?: string;
  hint?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className={className}>
      <Label className="text-sm text-foreground">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </Label>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function StackPicker({
  onToggle,
  portalContainer,
  selected,
  stacks,
}: {
  onToggle: (stack: string) => void;
  portalContainer: HTMLElement | null;
  selected: string[];
  stacks: { _id: string; name: string; iconUrl?: string }[];
}) {
  const selectedNames = stacks
    .filter((stack) => selected.includes(stack._id))
    .map((stack) => stack.name);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-10 w-full justify-between border-input bg-transparent px-3 font-normal text-foreground hover:bg-accent"
          type="button"
          variant="outline"
        >
          <span
            className={selected.length ? "truncate" : "text-muted-foreground"}
          >
            {selectedNames.length
              ? selectedNames.join(", ")
              : "Select one or more stacks"}
          </span>
          <span className="flex items-center gap-2 font-geist-mono text-[10px] text-muted-foreground">
            {selected.length || ""}
            <ChevronDown className="size-4" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl"
        portalContainer={portalContainer}
      >
        <DropdownMenuLabel>Choose stacks</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {stacks.map((stack) => (
          <DropdownMenuCheckboxItem
            checked={selected.includes(stack._id)}
            key={stack._id}
            onCheckedChange={() => onToggle(stack._id)}
          >
            {stack.iconUrl ? (
              <Image
                alt=""
                className="size-4 rounded-sm object-contain"
                height={16}
                src={stack.iconUrl}
                unoptimized
                width={16}
              />
            ) : null}
            {stack.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FileField({
  description,
  files,
  icon,
  label,
  multiple = false,
  onFilesChange,
  onRemove,
}: {
  description: string;
  files: File[];
  icon: React.ReactNode;
  label: string;
  multiple?: boolean;
  onFilesChange?: (files: File[]) => void;
  onRemove?: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const openFilePicker = () => inputRef.current?.click();
  return (
    <div className="relative flex h-24 items-center justify-center overflow-hidden border border-dashed border-[var(--hairline-strong)] px-4 py-3 transition-colors hover:border-foreground/35 hover:bg-white/[0.02]">
      {files.length ? (
        <span
          className={
            multiple
              ? "flex max-w-full items-center gap-2 overflow-x-auto py-1"
              : "flex items-center justify-center"
          }
        >
          {files.map((file, index) => (
            <ImageThumbnail
              file={file}
              key={`${file.name}-${file.lastModified}-${file.size}`}
              onRemove={() => onRemove?.(index)}
            />
          ))}
        </span>
      ) : (
        <button
          className="flex items-center gap-3 text-left"
          onClick={openFilePicker}
          type="button"
        >
          <span className="grid size-8 place-items-center border border-[var(--hairline)] text-muted-foreground">
            {icon}
          </span>
          <span>
            <span className="block text-sm text-foreground">{label}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {description}
            </span>
          </span>
        </button>
      )}
      <input
        accept="image/*"
        className="sr-only"
        multiple={multiple}
        ref={inputRef}
        onChange={(event) =>
          onFilesChange?.(Array.from(event.target.files || []))
        }
        type="file"
      />
      {files.length ? (
        <button
          aria-label={multiple ? "Add images" : "Replace image"}
          className="absolute right-3 grid size-7 place-items-center rounded-md border border-[var(--hairline)] bg-background/90 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={openFilePicker}
          type="button"
        >
          <ImagePlus className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

function ImageThumbnail({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!src) return null;
  return (
    <span className="group relative block size-16 shrink-0 overflow-hidden rounded-md border border-[var(--hairline-strong)] bg-muted">
      {/* A browser object URL, so the optimizer is bypassed. */}
      <Image
        alt={file.name}
        className="object-cover"
        fill
        sizes="64px"
        src={src}
        unoptimized
      />
      <button
        aria-label={`Remove ${file.name}`}
        className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-black/75 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRemove();
        }}
        type="button"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
