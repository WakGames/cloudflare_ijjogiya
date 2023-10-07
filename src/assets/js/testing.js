/* External Library */
import axios from "https://cdn.jsdelivr.net/npm/axios@1.5.1/+esm";

/* Import Common Libs */
import toast from "./lib/toast.js";
import loading from "./lib/progress.js";
import copyToClipboard from "./lib/copyClipboard.js";

import { round } from "./lib/calcUtil.js";

/* Import Constants */
import { TRACE_URL, TEST_FILES, REPORT_URL } from "./constants.js";

/* Testing Functions */
async function startTest(size) {
  if (!["100", "1000"].includes(size)) {
    throw ReferenceError("Test size must be 100 or 1000.");
  }

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

    // 2. 파일 다운로드 + progress
    let speed = 0;
    let speedHistory = [];
    let highestSpeed = 0;

    const download = await axios.get(TEST_FILES[`${size}MB`], {
      onDownloadProgress: (progressEvent) => {
        let percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        speed = progressEvent.loaded / (new Date() - startTime);
        speedHistory.push(speed);
        highestSpeed = Math.max(speed, highestSpeed);

        loading(percentCompleted * 0.95, false);
      },
    });

    // 3. 결과 리포트 전송
    const averageSpeed =
      speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length;

    await axios.post(
      REPORT_URL,
      {
        type: "CDN",
        sizeInMb: size,
        colo: traceAsObject["colo"].toUpperCase(),
        country: traceAsObject["loc"].toUpperCase(),
        warp: traceAsObject["warp"].toUpperCase(),
        avgSpeed: round(averageSpeed / 1000),
        maxSpeed: round(highestSpeed / 1000),
      },
      {
        onUploadProgress: (progressEvent) => {
          let percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          loading(95 + percentCompleted * 0.05, false);
        },
      }
    );

    const endTime = new Date();

    toast("측정이 완료되었습니다.", "success");
    document.querySelector(".description .start").style.opacity = 0;
    document.querySelector(".description .complete").style.opacity = 1;

    // 4. 결과 출력
    document.querySelector("#result").innerHTML = `
        # 기본 정보
        접속 국가 : ${traceAsObject["loc"].toUpperCase()}
        평균치 : ${round(averageSpeed / 1000)}mb/s
        최대치 : ${round(highestSpeed / 1000)}mb/s
        소요시간: ${round((endTime - startTime) / 1000)}초
        
        # 특수 정보
        Cache : ${
          download.headers["cf-cache-status"]?.toUpperCase() || "Unknown"
        }
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
  startTest(location.pathname.split("/")[3].replace("mb.html", ""));
});

document.querySelector("#result").addEventListener("click", () => {
  copyToClipboard(
    document.querySelector("#result").value.replaceAll(`              `, "")
  );
  toast("복사되었습니다.");
});
