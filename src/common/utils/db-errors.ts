export function isUniqueViolation(e: any): boolean {
  return e?.code === '23505' || e?.cause?.code === '23505';
}