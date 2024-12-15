export default function formatDate(inputDate) {
  const months = {
    января: "01",
    февраля: "02",
    марта: "03",
    апреля: "04",
    мая: "05",
    июня: "06",
    июля: "07",
    августа: "08",
    сентября: "09",
    октября: "10",
    ноября: "11",
    декабря: "12",
  };

  function formatSingleDate(day, month, year) {
    const formattedDay = day.padStart(2, "0");
    const formattedMonth = months[month.toLowerCase()];
    return `${formattedDay}.${formattedMonth}.${year}`;
  }

  function getFormattedDate(date, baseYear) {
    const [day, month] = date.split(" ");
    return formatSingleDate(day, month, baseYear);
  }

  const currentYearFull = new Date().getFullYear();
  const currentYear = currentYearFull.toString();
  const nextYear = (currentYearFull + 1).toString().slice(-2);

  if (inputDate.includes("-")) {
    const [startDate, endDate] = inputDate
      .split("-")
      .map((date) => date.trim());
    const [startDay, startMonth] = startDate.split(" ");
    const [endDay, endMonth] = endDate.split(" ");

    const startFormatted = getFormattedDate(startDate, currentYear);
    const endFormatted = getFormattedDate(
      endDate,
      months[startMonth.toLowerCase()] > months[endMonth.toLowerCase()]
        ? nextYear
        : currentYear
    );

    return `${startFormatted}-${endFormatted}`;
  } else {
    return getFormattedDate(inputDate, currentYear);
  }
}
