const formatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number): string {
  return `Rp ${formatter.format(Math.max(0, Math.round(amount)))}`;
}

export function formatNumber(value: number): string {
  return formatter.format(value);
}
