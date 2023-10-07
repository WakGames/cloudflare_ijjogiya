/* External Library */
import axios from "https://cdn.jsdelivr.net/npm/axios@1.5.1/+esm";

/* Import Common Libs */
import toast from "./lib/toast.js";
import loading from "./lib/progress.js";
import copyToClipboard from "./lib/copyClipboard.js";

import { round } from "./lib/calcUtil.js";

/* Import Constants */
import { TRACE_URL, TEST_FILES, GIT_TEST_FILES } from "./constants.js";

/* Testing Functions */
async function startCompareTest() {
  try {
    toast("측정을 시작합니다.");

    // 1. TRACE 얻기
    const { data: trace } = await axios.get(TRACE_URL);

    let traceAsObject = {};
    trace.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      traceAsObject[key] = value;
    });

    // 2. 100MB 파일 다운로드 + progress
    let cfSpeed = 0;
    let cfSpeedHistory = [];
    let cfHighestSpeed = 0;

    const cfStartTime = new Date().getTime();

    const download = await axios.get(TEST_FILES["100MB"], {
      onDownloadProgress: (progressEvent) => {
        let percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        if (percentCompleted >= 99) {
          document.querySelector(".description .prepare").textContent =
            "측정 대기 중...";
          document.querySelector(".description .start").textContent =
            "2차 측정 중...";
          document.querySelector(".description .start").style.opacity = 0;
          document.querySelector(".description .prepare").style.opacity = 1;
        }

        cfSpeed = progressEvent.loaded / (new Date().getTime() - cfStartTime);
        cfSpeedHistory.push(cfSpeed);
        cfHighestSpeed = Math.max(cfSpeed, cfHighestSpeed);

        loading(percentCompleted / 2, false);
      },
    });

    // 3. GitHub 100MB 파일 다운로드 + progress
    let gitSpeed = 0;
    let gitSpeedHistory = [];
    let gitHighestSpeed = 0;

    const gitFileCount = Math.floor(Math.random() * 100) + 1;
    const gitStartTime = new Date().getTime();
    document.querySelector(".description .prepare").style.opacity = 0;
    document.querySelector(".description .start").style.opacity = 1;

    const gitDownload = await axios.get(
      GIT_TEST_FILES.replace("{FILE_NO}", gitFileCount),
      {
        onDownloadProgress: (progressEvent) => {
          let percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          gitSpeed =
            progressEvent.loaded / (new Date().getTime() - gitStartTime);
          gitSpeedHistory.push(gitSpeed);
          gitHighestSpeed = Math.max(gitSpeed, gitHighestSpeed);

          loading(50 + percentCompleted / 2, false);
        },
      }
    );

    toast("측정이 완료되었습니다.", "success");
    document.querySelector(".description .start").style.opacity = 0;
    document.querySelector(".description .complete").style.opacity = 1;

    // 4. 결과 출력
    const cfAverageSpeed =
      cfSpeedHistory.reduce((a, b) => a + b, 0) / cfSpeedHistory.length;
    const gitAverageSpeed =
      gitSpeedHistory.reduce((a, b) => a + b, 0) / gitSpeedHistory.length;

    document.querySelector("#result").innerHTML = `
        # 기본 정보
        접속 국가 : ${traceAsObject["loc"].toUpperCase()}

        CDN 평균치 : ${round(cfAverageSpeed / 1000)}mb/s
        CDN 최대치 : ${round(cfHighestSpeed / 1000)}mb/s
        Git 평균치 : ${round(gitAverageSpeed / 1000)}mb/s
        Git 최대치 : ${round(gitHighestSpeed / 1000)}mb/s
        
        # 비교 정보
        평균 속도차 : ${round((cfAverageSpeed - gitAverageSpeed) / 1000)}mb/s
        최대 속도차 : ${round((cfHighestSpeed - gitHighestSpeed) / 1000)}mb/s

        # 특수 정보
        Git No. : ${gitFileCount}
        Cache : ${download.headers["cf-cache-status"].toUpperCase()}
        PoP : ${traceAsObject["colo"].toUpperCase()}
        WARP : ${traceAsObject["warp"].toUpperCase()}
    `;

    document.querySelector("#result").classList.remove("hidden");
  } catch (e) {
    loading(100, true);
    document.querySelector(".description .start").style.opacity = 0;
    document.querySelector(".description .complete").style.opacity = 0;
    document.querySelector(".description .error").style.opacity = 1;

    toast(e.toString(), "error");
    console.error(e);
  }
}

/* Events */
document.querySelector("button").addEventListener("click", () => {
  startCompareTest();
});

document.querySelector("#result").addEventListener("click", () => {
  copyToClipboard(
    document.querySelector("#result").value.replaceAll(`        `, "")
  );
  toast("복사되었습니다.");
});
