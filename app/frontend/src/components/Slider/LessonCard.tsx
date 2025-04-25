import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import photo from "/image/cardBackground/19.jpg";
import { DailyScheduleLessonProps } from "@/lib/types/schedule";
import styles from "./styles.module.scss";
import { Card, CardContent } from "../ui/card";

type LessonCardProps = {
  lessons: DailyScheduleLessonProps[];
  pairNumber: number | null;
};

export default function LessonCard({ lessons, pairNumber }: LessonCardProps) {
  return (
    <Card className={styles.card}>
      <CardContent className={styles.cardContent}>
        <img
          src={photo}
          className={styles.bgCardImage}
          alt="Background photo"
        ></img>
        <div className={styles.cardContentContainer}>
          {lessons.length === 1 ? (
            <SingleLesson lesson={lessons[0]} />
          ) : (
            <MultipleLessons lessons={lessons} />
          )}
          <hr className={styles.line}></hr>
          <LessonTimeAndNumber lessons={lessons} pairNumber={pairNumber} />
        </div>
      </CardContent>
    </Card>
  );
}

const SingleLesson = ({ lesson }: { lesson: DailyScheduleLessonProps }) => (
  <div className={styles.subjectAndTeacherWrapper}>
    <ul className={styles.subjectAndTeacher}>
      <li className={styles.subject}>
        {lesson.subject_type}. {lesson.subject_name}
      </li>
      <li className={styles.teacher}>{lesson.teacher_name}</li>
    </ul>
    <div className={styles.roomWrapper}>
      <div className={styles.room}>{lesson.room_number}</div>
    </div>
  </div>
);

const MultipleLessons = ({
  lessons,
}: {
  lessons: DailyScheduleLessonProps[];
}) => (
  <Accordion type="single" collapsible className={styles.accordion}>
    {lessons.map((lesson, index) => (
      <AccordionItem
        key={index}
        value={`item-${index}`}
        className={styles.accordionItem}
      >
        <AccordionTrigger className={styles.accordionTrigger}>
          {lesson.subject_type}. {lesson.subject_name}
        </AccordionTrigger>
        <AccordionContent className={styles.accordionContent}>
          <ul className={styles.accordionContentList}>
            <li className={styles.teacher}>{lesson.teacher_name}</li>
            <li className={styles.room}>{lesson.room_number}</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

const LessonTimeAndNumber = ({
  lessons,
  pairNumber,
}: {
  lessons: DailyScheduleLessonProps[];
  pairNumber: number | null;
}) => (
  <div className={styles.lessonNumberAndTimeWrapper}>
    <ul className={styles.lessonNumberAndTime}>
      <li className={styles.lessonNumber}>{pairNumber} пара</li>
      <li className={styles.time}>
        {lessons[0].time_start.slice(0, -3)} -{" "}
        {lessons[0].time_end.slice(0, -3)}
      </li>
    </ul>
  </div>
);
