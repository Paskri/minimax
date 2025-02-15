export class CountdownTimer {
  constructor(onEnd) { //
    this.duration = 180;
    this.timer = 0;
    this.interval = null;
    this.onEnd = onEnd;
  }

  start() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.timer = this.duration
    this.interval = setInterval(() => {
      let minutes = Math.floor(this.timer / 60);
      let seconds = this.timer % 60;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;

      const countDown = document.getElementById('countDown');
      if (countDown) {
        countDown.textContent = minutes + ':' + seconds;
        if (this.timer <= 30) {
          countDown.classList.add('red');
        } else if (countDown.classList.contains('red')) {
          countDown.classList.remove('red')
        }
      }

      if (--this.timer < 0) {
        clearInterval(this.interval);
        this.interval = null;
        if (this.onEnd) this.onEnd();
      }
    }, 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  adjustTimer() {
    if (this.timer > 30) {
      this.timer = 30;
    }
  }
}