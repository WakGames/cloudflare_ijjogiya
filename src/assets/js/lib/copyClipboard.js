export default function copyToClipboard(val) {
  let t = document.createElement("textarea");
  document.body.appendChild(t);

  t.value = val;
  t.select();

  document.execCommand("copy");
  document.body.removeChild(t);
}
