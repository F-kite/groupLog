import { useContext } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { DailyScheduleLessonProps, DailyScheduleProps } from "@/types/schedule";
import { lessonsTimeNumber } from "@/store/data";
import { MyContext } from "@/hooks/MyContextProvider";
import styles from "./styles.module.scss";
import LessonCard from "./LessonCard";

type Lesson = DailyScheduleProps["lessons"][0];
type GroupedLessons = { [time: string]: DailyScheduleLessonProps[] };

const groupLessonsByTime = (lessons: Lesson[]): GroupedLessons => {
  return lessons.reduce((acc: GroupedLessons, lesson) => {
    const key = `${lesson.time_start}-${lesson.time_end}`;
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
  const dayNumber = (new Date().getDay() + 6) % 7;

  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }

  const { weekSchedule } = context;
  const CURRENT_DAY = weekSchedule.days;

  const groupedLessons = groupLessonsByTime(CURRENT_DAY[dayNumber]?.lessons || []);

  if (!CURRENT_DAY[dayNumber]?.lessons) {
    return <p>Нет расписания для текущего дня</p>;
  } else if (CURRENT_DAY[dayNumber].is_holiday) {
    return <p>Выходной день </p>;
  }

  return (
    <div className={styles.sliderWrapper}>
      <Carousel className={styles.carousel}>
        <CarouselContent className={styles.carouselContent}>
          {Object.entries(groupedLessons).map(([time, lessons], index) => (
            <CarouselItem key={index} className={styles.carouselItem}>
              <LessonCard
                lessons={lessons}
                pairNumber={getPairNumberByTime(lessons[0].time_start)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
