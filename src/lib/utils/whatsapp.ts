export function waLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const number = digits.startsWith("91") ? digits : `91${digits}`;
  return `https://wa.me/${number}`;
}
