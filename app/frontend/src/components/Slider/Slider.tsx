import { useContext, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { lessonsTimeNumber } from "@/lib/store/data";
import { groupLessonsByTime } from "@/lib/hooks/groupLessonsByTime";
import { MyContext } from "@/lib/hooks/MyContextProvider";
import LessonCard from "./LessonCard";
import styles from "./styles.module.scss";

const getPairNumberByTime = (timeStart: string): number | null => {
  const currentPair = lessonsTimeNumber.find(
    (pair) => pair.timeStart === timeStart
  );
  return currentPair ? currentPair.pairNumber : null;
};

export default function Slider(): JSX.Element {
  const context = useContext(MyContext);
  const [isScheduleLoading, setIsScheduleLoading] = useState(true);

  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }

  const { weekSchedule } = context;
  const { currentInfo } = context;

  const dayNumber = (new Date(currentInfo.currentDate).getDay() + 6) % 7;
  const CURRENT_DAY = weekSchedule.days;

  const groupedLessons = groupLessonsByTime(
    CURRENT_DAY[dayNumber]?.lessons || []
  );

  // Имитация загрузки данных
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScheduleLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isScheduleLoading && !CURRENT_DAY[dayNumber]?.lessons) {
    return <p>Загрузка расписания...</p>;
  }

  if (!CURRENT_DAY[dayNumber]?.lessons) {
    return <p>Нет расписания для текущего дня</p>;
  }

  if (CURRENT_DAY[dayNumber].is_holiday) {
    return <p>Выходной день</p>;
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
