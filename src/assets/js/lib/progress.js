export default function loading(value = 0, error = false, callback = () => {}) {
  const $progressBar = document.querySelector(".progress .progress-bar");
  const MAX = 100;

  if (value > MAX) {
    throw new ReferenceError(
      "Loading value cannot be greater than Max value (100)."
    );
  }

  if (value === 0) $progressBar.classList.remove("transition");
  else $progressBar.classList.add("transition");

  if (error) {
    $progressBar.style.backgroundColor = "#FF3860";
  } else {
    if (value >= MAX - 2) $progressBar.style.backgroundColor = "#00D2B1";
    else $progressBar.style.backgroundColor = "";
  }

  if (value === MAX) callback();

  $progressBar.style.transform = `scaleX(${value / MAX})`;
}
