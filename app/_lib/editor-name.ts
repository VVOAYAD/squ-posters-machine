// The editor's name is self-declared and kept in this browser only — it labels
// every revision so edits are traceable back to a person.
const KEY = "squ-editor-name";

export function getEditorName(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY)?.trim() ?? "";
}

export function rememberEditorName(name: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, name.trim());
}
