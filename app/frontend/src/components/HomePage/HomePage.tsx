import Calendar from "../Calendar/Calendar";
import Slider from "../Slider/Slider";
import VisitorChart from "../Chart/Chart";

import styles from "./styles.module.scss";

export default function HomePage() {
  const showWeekNumbers = true;
  const size: "sm" | "md" | "lg" = "md";
  const width = "90%";
  const height = "90%";
  return (
    <div className={styles.mainContainer}>
      <article className={styles.infoGridContainer}>
        <section className={`${styles.slider} ${styles.gridElement}`}>
          <Slider />
        </section>
        <section className={`${styles.chart} ${styles.gridElement}`}>
          <VisitorChart />
        </section>
        <section className={`${styles.calendar} ${styles.gridElement}`}>
          <Calendar
            showWeekNumbers={showWeekNumbers}
            size={size}
            width={width}
            height={height}
            weekStartsOn={1}
          />
        </section>
      </article>
    </div>
  );
}
