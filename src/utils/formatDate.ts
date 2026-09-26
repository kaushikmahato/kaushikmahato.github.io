const defaultOptions: Intl.DateTimeFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = defaultOptions,
  locale = "en-US",
): string {
  return date.toLocaleDateString(locale, options);
}
