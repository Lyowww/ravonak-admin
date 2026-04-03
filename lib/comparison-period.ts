/** Previous window of the same duration, ending immediately before `dateFrom`. */
export function previousPeriodRange(dateFrom: string, dateTo: string): {
  from: string;
  to: string;
} {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  const duration = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - duration);
  return { from: prevFrom.toISOString(), to: prevTo.toISOString() };
}
