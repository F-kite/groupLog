import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { dailySchedule } from "../../lib/data";
import styles from "./styles.module.scss";

export default function Slider(): JSX.Element {
  return (
    <div className={styles.carouselContainer}>
      <Carousel
        opts={{
          align: "center",
          container: "Slider.tsx",
          skipSnaps: true,
        }}
        className={styles.carousel}
      >
        <CarouselContent className={styles.carouselContent}>
          {dailySchedule.lessons.map((lesson, index) => (
            <CarouselItem key={index} className={styles.carouselItem}>
              <div className={styles.carouselItemContainer}>
                <Card>
                  <CardContent className={styles.cardContent}>
                    <span className="text-3xl font-semibold">
                      {lesson.roomNumber}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
