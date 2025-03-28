import { useContext, useEffect, useState } from "react";
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
import scheduleApi from "@/utils/api/schedule";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const currentDay = (new Date().getDay() + 6) % 7;

  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }

  const { weekSchedule, setWeekSchedule } = context;
  const DAYS = weekSchedule.days;

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const scheduleResponse = await scheduleApi.getWeekSchedule(
          "ИСт-221",
          11
        );
        if (scheduleResponse.error) {
          throw new Error(scheduleResponse.error);
        }
        if (isMounted) {
          setWeekSchedule(scheduleResponse);
        }
      } catch (error: any) {
        if (isMounted) {
          setError(error.message);
          console.error(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [setWeekSchedule]);

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  const groupedLessons = groupLessonsByTime(DAYS[currentDay]?.lessons || []);

  if (!DAYS[currentDay]?.lessons) {
    return <p>Нет расписания для текущего дня</p>;
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
