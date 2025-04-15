import { DailyScheduleLessonProps, DailyScheduleProps } from "@/types/schedule";
import { lessonsTimeNumber } from "@/store/data";

type Lesson = DailyScheduleProps["lessons"][0];
export type GroupedLessons = { [pairNum: string]: DailyScheduleLessonProps[] };

export const groupLessonsByTime = (lessons: Lesson[]): GroupedLessons => {
  return lessons.reduce((acc: GroupedLessons, lesson) => {
    const pairNum = lessonsTimeNumber.find(
      (el) => el.timeStart === lesson.time_start
    )?.pairNumber;

    if (pairNum) {
      if (!acc[pairNum]) {
        acc[pairNum] = [];
      }
      acc[pairNum].push(lesson);
    }
    return acc;
  }, {});
};
