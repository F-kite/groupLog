import puppeteer from "puppeteer";

export default async function parseSchedule(weekNumber, group) {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const url = `https://kuzstu.ru/web-content/sitecontent/studentu/raspisanie/${group}.html`;

    await page.goto(url);
    // страница загружается полностью
    await page.waitForSelector("body");

    const schedule = await page.evaluate((weekNumber) => {
      function replSpecialSymbol(str) {
        return str.split(/\n/).join(";");
      }

      const numberOfWeek = new Map([
        ["1", [2, 3]],
        ["2", [5, 6]],
        ["3", [8, 9]],
        ["4", [11, 12]],
        ["5", [14, 15]],
        ["6", [17, 18]],
        ["7", [20, 21]],
        ["8", [23, 24]],
        ["9", [26, 27]],
        ["10", [29, 30]],
        ["11", [32, 33]],
        ["12", [35, 36]],
        ["13", [38, 39]],
        ["14", [41, 42]],
        ["15", [44, 45]],
        ["16", [47, 48]],
        ["17", [50, 51]],
        ["18", [53, 54]],
        ["19", [56, 57]],
        ["20", [59, 60]],
        ["21", [62, 63]],
        ["22", [65, 66]],
        ["23", [68, 69]],
        ["24", [71, 72]],
        ["25", [74, 75]],
        ["26", [77, 78]],
      ]);

      const [numTitleSchedule, numDaySchedule] = numberOfWeek.get(weekNumber);

      const titleScheduleElements = document.querySelectorAll(
        `body > p:nth-child(${numTitleSchedule}) > font:nth-child(2)`
      );

      const titleSchedule = Array.from(
        titleScheduleElements,
        (el) => el.innerText.split("\n")[1]
      );

      let weekSchedule = [titleSchedule];

      for (let i = 3; i < 9; i++) {
        let daySchedule = Array.from(
          document.querySelectorAll(
            `body > table:nth-child(${numDaySchedule}) > tbody > tr:nth-child(${i}) > td > p > font`
          ),
          (el) => el.innerText
        );

        daySchedule[0] = daySchedule[0].replace(",", " ");
        daySchedule.pop();

        for (let k = 0; k < daySchedule.length; k++) {
          if (daySchedule.includes("")) {
            daySchedule[daySchedule.indexOf("")] = "noles";
          }

          daySchedule[k] = replSpecialSymbol(daySchedule[k]);
        }

        weekSchedule.push(daySchedule);
      }

      return weekSchedule;
    }, weekNumber);

    return schedule;
  } catch (error) {
    console.error("Failed to parse schedule:", error.message);
    throw error;
  } finally {
    await browser.close();
  }
}
