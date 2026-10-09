export function extractBearer(req: any): string | null {
  const header: string | undefined = req.headers?.authorization;
  if (!header) return null;
  const [type, token] = header.split(' ');
  return type === 'Bearer' && token ? token : null;
}