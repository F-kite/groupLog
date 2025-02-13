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
import {
  dailySchedule,
  DailyScheduleLessonProps,
  DailyScheduleProps,
} from "../../lib/data";

import photo from "@/assets/image/18.jpg";
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

export default function Slider(): JSX.Element {
  const groupedLessons = groupLessonsByTime(dailySchedule.lessons);
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
          {Object.entries(groupedLessons).map(([time, lessons], index) => (
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
                              {lessons[0].subjectType}. {lessons[0].subjectName}
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
                          <AccordionTrigger className={styles.accordionTrigger}>
                            {lessons[0].subjectType}. {lessons[0].subjectName}
                          </AccordionTrigger>
                          <AccordionContent className={styles.accordionContent}>
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
                          <AccordionTrigger className={styles.accordionTrigger}>
                            {lessons[1].subjectType}. {lessons[1].subjectName}
                          </AccordionTrigger>
                          <AccordionContent className={styles.accordionContent}>
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
                          {index + 1} пара
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
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
