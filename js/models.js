/* Claude Code model catalog */

export const MODELS = [
  {
    id: "claude-sonnet-5",
    name: "Sonnet 5",
    family: "Sonnet",
    tag: "Default",
    desc: "Everyday coding — best default",
    icon: "◈",
  },
  {
    id: "claude-opus-5",
    name: "Opus 5",
    family: "Opus",
    tag: "Max",
    desc: "Deep agentic coding & reasoning",
    icon: "◆",
  },
  {
    id: "claude-haiku-4-5",
    name: "Haiku 4.5",
    family: "Haiku",
    tag: "Fast",
    desc: "Low latency, cheap, high volume",
    icon: "◇",
  },
  {
    id: "claude-fable-5",
    name: "Fable 5",
    family: "Fable",
    tag: "Frontier",
    desc: "Highest-capability frontier model",
    icon: "★",
  },
  {
    id: "claude-sonnet-4-6",
    name: "Sonnet 4.6",
    family: "Sonnet",
    tag: "",
    desc: "Previous Sonnet generation",
    icon: "◈",
  },
  {
    id: "claude-opus-4-6",
    name: "Opus 4.6",
    family: "Opus",
    tag: "",
    desc: "Previous Opus generation",
    icon: "◆",
  },
  {
    id: "claude-opus-4-8",
    name: "Opus 4.8",
    family: "Opus",
    tag: "",
    desc: "Opus 4.8",
    icon: "◆",
  },
  {
    id: "claude-opus-4-7",
    name: "Opus 4.7",
    family: "Opus",
    tag: "",
    desc: "Opus 4.7",
    icon: "◆",
  },
  {
    id: "claude-sonnet-4-5",
    name: "Sonnet 4.5",
    family: "Sonnet",
    tag: "",
    desc: "claude-sonnet-4-5-20250929",
    icon: "◈",
  },
  {
    id: "claude-opus-4-5",
    name: "Opus 4.5",
    family: "Opus",
    tag: "",
    desc: "claude-opus-4-5-20251101",
    icon: "◆",
  },
  {
    id: "claude-haiku-4-5-20251001",
    name: "Haiku 4.5 pinned",
    family: "Haiku",
    tag: "",
    desc: "Dated snapshot 2025-10-01",
    icon: "◇",
  },
  {
    id: "claude-sonnet-4-0",
    name: "Sonnet 4",
    family: "Sonnet",
    tag: "",
    desc: "claude-sonnet-4-20250514",
    icon: "◈",
  },
];

export const DEFAULT_MODEL = "claude-sonnet-5";

export function findModel(id) {
  return MODELS.find((m) => m.id === id) || {
    id,
    name: id,
    family: "Custom",
    tag: "",
    desc: id,
    icon: "○",
  };
}

export function shortName(id) {
  return findModel(id).name;
}

export default MODELS;
