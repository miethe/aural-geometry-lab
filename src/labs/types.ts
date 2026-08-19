export type LabStatus = "working" | "preview" | "research" | "planned";

export interface LabMetadata {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly category: string;
  readonly summary: string;
  readonly status: LabStatus;
  readonly statusLabel: string;
  readonly researchCharters: readonly string[];
  readonly milestone: string;
}

export interface LabModule extends LabMetadata {
  mount(container: HTMLElement): () => void;
}
