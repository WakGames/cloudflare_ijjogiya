let progressData = 0

/**
 * @function loading
 * @param {number} value
 * @description Function for filing progress bar
 */
const loading = value => {
  const $progressBar = document.querySelector('.progress .progress-bar')
  const MAX = 100

  if (value > MAX) throw new ReferenceError('Loading value cannot be greater than Max value (100).')

  if (value === 0) {
    $progressBar.classList.remove('transition')
  } else {
    $progressBar.classList.add('transition')
  }

  if (value >= MAX - 2) {
    $progressBar.style.backgroundColor = `#00D2B1`
  }

  if (value === MAX) {
    loaded = true
  }

  $progressBar.style.transform = `scaleX(${value / MAX})`
}