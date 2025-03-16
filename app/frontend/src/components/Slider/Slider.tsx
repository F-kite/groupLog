import { useContext, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { dailySchedule } from "@/store/data";

import { DailyScheduleLessonProps, DailyScheduleProps } from "@/types/schedule";
import { lessonsTimeNumber } from "@/store/data";
import { MyContext } from "@/hooks/MyContextProvider";
import scheduleApi from "@/utils/api/schedule";
import photo from "/image/cardBackground/19.jpg";
import styles from "./styles.module.scss";

type Lesson = DailyScheduleProps["lessons"][0];
type GroupedLessons = { [time: string]: DailyScheduleLessonProps[] };

const groupLessonsByTime = (lessons: Lesson[]): GroupedLessons => {
  return lessons.reduce((acc: GroupedLessons, lesson) => {
    const key = `${lesson.timeStart}-${lesson.timeEnd}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(lesson);
    return acc;
  }, {});
};

const getPairNumberByTime = (timeStart: string): number | null => {
  const currentPair = lessonsTimeNumber.find(
    (pair) => pair.timeStart === timeStart
  );
  return currentPair ? currentPair.pairNumber : null;
};

export default function Slider(): JSX.Element {
  const context = useContext(MyContext);
  const currentDay = (new Date().getDay() + 6) % 7;

  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }

  const { weekSchedule, setWeekSchedule } = context;
  const DAYS = weekSchedule.days;

  // console.log("dailySchedule:", dailySchedule.lessons);
  // console.log("DAYS:", DAYS[0]?.lessons);

  let groupedLessons: GroupedLessons = {};
  if (DAYS && DAYS.length > 0 && DAYS[0].lessons) {
    groupedLessons = groupLessonsByTime(DAYS[0].lessons);
  }
  // else if (!DAYS || DAYS.length === 0 || currentDay >= DAYS.length) {
  //   console.debug("Сегодня воскресенье или нет данных о расписании");
  //   return <p>Сегодня выходной день. Расписание недоступно.</p>;
  // }
  else {
    console.log("Нет данных о расписании для текущего дня.");
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем расписание
        const scheduleResponse = await scheduleApi.getWeekSchedule(
          "ИСт-221",
          10
        );
        if (scheduleResponse.error) {
          throw new Error(scheduleResponse.error);
        }
        setWeekSchedule(scheduleResponse);
      } catch (error: any) {
        console.error(error.message);
      }
    };

    fetchData();
  }, [setWeekSchedule]);

  return (
    <div className={styles.sliderWrapper}>
      <Carousel
        opts={{
          align: "start",
          containScroll: "trimSnaps",
          skipSnaps: true,
        }}
        className={styles.carousel}
      >
        <CarouselContent className={styles.carouselContent}>
          {Object.entries(groupedLessons).map(([time, lessons], index) => {
            const timeStart = lessons[0].timeStart; // Время начала пары
            const pairNumber = getPairNumberByTime(timeStart); // Определение номера пары
            return (
              <CarouselItem key={index} className={styles.carouselItem}>
                <Card className={styles.card}>
                  <CardContent className={styles.cardContent}>
                    <img
                      src={photo}
                      className={styles.bgCardImage}
                      alt="Background photo"
                    ></img>
                    <div className={styles.cardContentContainer}>
                      {lessons.length === 1 ? (
                        <>
                          <div className={styles.subjectAndTeacherWrapper}>
                            <ul className={styles.subjectAndTeacher}>
                              <li className={styles.subject}>
                                {lessons[0].subjectType}.{" "}
                                {lessons[0].subjectName}
                              </li>
                              <li className={styles.teacher}>
                                {lessons[0].teacherName}
                              </li>
                            </ul>
                            <div className={styles.roomWrapper}>
                              <div className={styles.room}>
                                {lessons[0].roomNumber}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <Accordion
                          type="single"
                          collapsible
                          className={styles.accordion}
                        >
                          <AccordionItem
                            value="item-1"
                            className={styles.accordionItem}
                          >
                            <AccordionTrigger
                              className={styles.accordionTrigger}
                            >
                              {lessons[0].subjectType}. {lessons[0].subjectName}
                            </AccordionTrigger>
                            <AccordionContent
                              className={styles.accordionContent}
                            >
                              <ul className={styles.accordionContentList}>
                                <li className={styles.teacher}>
                                  {lessons[0].teacherName}
                                </li>
                                <li className={styles.room}>
                                  {lessons[0].roomNumber}
                                </li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem
                            value="item-2"
                            className={styles.accordionItem}
                          >
                            <AccordionTrigger
                              className={styles.accordionTrigger}
                            >
                              {lessons[1].subjectType}. {lessons[1].subjectName}
                            </AccordionTrigger>
                            <AccordionContent
                              className={styles.accordionContent}
                            >
                              <ul className={styles.accordionContentList}>
                                <li className={styles.teacher}>
                                  {lessons[1].teacherName}
                                </li>
                                <li className={styles.room}>
                                  {lessons[1].roomNumber}
                                </li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                      <hr className={styles.line}></hr>
                      <div className={styles.lessonNumberAndTimeWrapper}>
                        <ul className={styles.lessonNumberAndTime}>
                          <li className={styles.lessonNumber}>
                            {pairNumber} пара
                          </li>
                          <li className={styles.time}>
                            {lessons[0].timeStart.slice(0, -3)} -{" "}
                            {lessons[0].timeEnd.slice(0, -3)}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
