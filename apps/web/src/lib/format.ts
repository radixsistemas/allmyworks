export function formatMoeda(valor: number | string): string {
  const num = typeof valor === "string" ? Number(valor) : valor;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatData(data: string | Date): string {
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function toDateInputValue(data: string | Date): string {
  const d = new Date(data);
  return d.toISOString().slice(0, 10);
}
