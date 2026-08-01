// Campos de medidas do Ateliê sob medida infantil — compartilhados entre o formulário
// do site e a ficha exibida no painel para a costureira.
export type MeasurementField = {
  key: string;
  label: string;
  hint: string;
  required?: boolean;
};

export const MEASUREMENT_FIELDS: MeasurementField[] = [
  { key: "idade", label: "Idade", hint: "Em anos (ex.: 5)", required: true },
  { key: "altura", label: "Altura (cm)", hint: "Descalço(a), da cabeça aos pés", required: true },
  { key: "peso", label: "Peso (kg)", hint: "Aproximado" },
  { key: "torax", label: "Tórax (cm)", hint: "Contorno do peito, por baixo dos braços", required: true },
  { key: "cintura", label: "Cintura (cm)", hint: "Contorno na altura do umbigo", required: true },
  { key: "quadril", label: "Quadril (cm)", hint: "Contorno na parte mais cheia do quadril" },
  { key: "braco", label: "Braço (cm)", hint: "Do ombro ao punho, braço relaxado" },
  { key: "comprimento", label: "Comprimento da peça (cm)", hint: "Do ombro (ou cintura) até onde a peça deve terminar" },
];

export function parseMeasurements(json: string): Record<string, string> {
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}
