/* External Library */
import axios from "https://cdn.jsdelivr.net/npm/axios@1.5.1/+esm";

/* Import Common Libs */
import toast from "./lib/toast.js";
import loading from "./lib/progress.js";
import copyToClipboard from "./lib/copyClipboard.js";

import { round } from "./lib/calcUtil.js";

/* Import Constants */
import { TRACE_URL, TEST_FILES } from "./constants.js";

/* Testing Functions */
async function startTest() {
  document.querySelector("#prepare").classList.add("hidden");
  document.querySelector("#doing").classList.remove("hidden");

  document.querySelector(".description .start").style.opacity = 1;
  document.querySelector(".description .complete").style.opacity = 0;
  document.querySelector(".description .error").style.opacity = 0;

  try {
    toast("측정을 시작합니다.");

    const startTime = new Date();

    // 1. TRACE 얻기
    const { data: trace } = await axios.get(TRACE_URL);

    let traceAsObject = {};
    trace.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      traceAsObject[key] = value;
    });

    // 2. 50MB 파일 10번 다운로드 + progress
    let speed = 0;
    let speedHistory = [];
    let highestSpeed = 0;

    let cacheStatus = null;

    for (let i = 0; i < 10; i++) {
      const download = await axios.get(
        TEST_FILES['50MB'] + "?v=" + new Date().getTime(),
        {
          onDownloadProgress: (progressEvent) => {
            let percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            if (percentCompleted >= 99) {
              if (i != 9) {
                document.querySelector(".description .loading").textContent =
                  "측정 대기 중...";
                document.querySelector(".description .start").textContent =
                  i + 2 + "차 측정 중...";
                document.querySelector(".description .start").style.opacity = 0;
                document.querySelector(".description .loading").style.opacity = 1;
              }
            } else {
              document.querySelector(".description .loading").style.opacity = 0;
              document.querySelector(".description .start").style.opacity = 1;
            }

            speed = progressEvent.loaded / (new Date() - startTime);
            speedHistory.push(speed);
            highestSpeed = Math.max(speed, highestSpeed);

            loading(i * 10 + percentCompleted / 10, false);
          },
        }
      );

      cacheStatus = download.headers["cf-cache-status"] || 'Unknown';
    }

    const averageSpeed =
      speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length;
    
    const endTime = new Date();

    toast("측정이 완료되었습니다.", "success");
    document.querySelector(".description .start").style.opacity = 0;
    document.querySelector(".description .complete").style.opacity = 1;

    // 3. 결과 출력
    document.querySelector("#result").innerHTML = `
        # 기본 정보
        접속 국가 : ${traceAsObject["loc"].toUpperCase()}
        평균치 : ${round(averageSpeed / 1000)}mb/s
        최대치 : ${round(highestSpeed / 1000)}mb/s
        소요시간: ${round((endTime - startTime) / 1000)}초
        
        # 특수 정보
        Cache : ${cacheStatus.toUpperCase()}
        PoP : ${traceAsObject["colo"].toUpperCase()}
        WARP : ${traceAsObject["warp"].toUpperCase()}
    `;

    document.querySelector("#result").classList.remove("hidden");
    document.querySelector("#showHowto").classList.remove("hidden");
  } catch (e) {
    loading(100, true);
    document.querySelector(".description .start").style.opacity = 0;
    document.querySelector(".description .complete").style.opacity = 0;
    document.querySelector(".description .error").style.opacity = 1;

    document.querySelector("#showHowto").classList.remove("hidden");

    toast(e.toString(), "error");
    console.error(e);
  }
}

/* Events */
document.querySelector("button").addEventListener("click", () => {
  document.querySelector('#before_start').showModal();
});

document.querySelector("#showHowto button").addEventListener("click", () => {
  document.querySelector('#how_to_export_har').showModal();
});

document.querySelector("button#startTest").addEventListener("click", () => {
  startTest();
});

document.querySelector("#result").addEventListener("click", () => {
  copyToClipboard(
    document.querySelector("#result").value.replaceAll(`              `, "")
  );
  toast("복사되었습니다.");
});
