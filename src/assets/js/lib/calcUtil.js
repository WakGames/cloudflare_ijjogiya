export function round(num) {
  const m = Number((Math.abs(num) * 10).toPrecision(15));
  return (Math.round(m) / 10) * Math.sign(num);
}
