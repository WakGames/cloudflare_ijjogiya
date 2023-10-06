let toastCount = 0,
  removeToast = null;

export default function toast(text, style, duration) {
  const topHeight = toastCount * 60 + 30;

  const toast = document.createElement("div");
  toast.id = "t" + new Date().getTime();
  toast.style.bottom = topHeight + "px";

  toastCount++;

  toast.classList.add("toast");
  document.body.appendChild(toast);

  removeToast = setTimeout(() => {
    if (document.querySelectorAll(".toast").length - 1 == 0) toastCount = 0;
    toast.classList.remove("reveal");

    setTimeout(() => {
      toast.remove();
    }, 250);
  }, duration || 2500);

  if (style == "success") toast.style.background = "rgba(25, 135, 84, .6)";
  else if (style == "error") toast.style.background = "rgba(220, 53, 69, .6)";
  else toast.style.background = "rgba(0, 0, 0, .6)";

  setTimeout(() => {
    toast.classList.add("reveal");
    toast.innerText = text;
  }, 10);
}
