const axios = require('axios');
const iconv = require('iconv-lite');
const { JSDOM } = require('jsdom');

async function parseSchedule(weekNumber, url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        const htmlContent = iconv.decode(response.data, 'win1251'); // Замените 'win1251' на кодировку вашей страницы

        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;

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

        const titleSchedule = Array.from(titleScheduleElements, el => el.textContent.split("\n")[1]);


        // Если заголовок недели не найден, вернём ошибку
        if (!titleSchedule || titleSchedule.length === 0) {
            throw new Error("Заголовок недели не найден.");
        }

        let weekSchedule = [titleSchedule];

        // Обрабатываем дни недели
        for (let i = 3; i < 9; i++) {
            const daySchedule = Array.from(
                document.querySelectorAll(
                    `body > table:nth-child(${numDaySchedule}) > tbody > tr:nth-child(${i}) > td > p > font`
                ),
                el => el.textContent.trim()
            );

            // Замена символов новой строки на ;
            daySchedule[0] = daySchedule[0].replace(",", " ");

            const processedDaySchedule = daySchedule.map(item =>
                item === '' ? 'noles' : item.replace(/\n/g, ';')
            );

            processedDaySchedule.pop();  // Удаляем последний пустой элемент

            // Добавляем обработанные данные в расписание
            weekSchedule.push(processedDaySchedule);
        }

        return weekSchedule;
    } catch (error) {
        console.error('Ошибка парсинга:', error.message);
        return null;
    }
}

// Пример использования
(async () => {
    const weekNumber = "2";
    const url = 'https://kuzstu.ru/web-content/sitecontent/studentu/raspisanie/%D0%98%D0%A1%D1%82-221.html';
    const schedule = await parseSchedule(weekNumber, url);
    console.log('Расписание:', schedule);
})();
