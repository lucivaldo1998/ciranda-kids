export const FABRIC_LABELS: Record<string, string> = {
  algodao: "Algodão",
  linho: "Linho",
  malha: "Malha",
};

export const FABRICS = Object.entries(FABRIC_LABELS).map(([key, label]) => ({ key, label }));

export function fabricLabel(key: string) {
  return FABRIC_LABELS[key] ?? key;
}
