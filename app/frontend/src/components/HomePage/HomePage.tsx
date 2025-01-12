import Slider from "../Slider/Slider";

import styles from "./styles.module.scss";

export default function HomePage() {
  return (
    <div className={styles.mainContainer}>
      <article className={styles.subMainContainer}>
        <section className={styles.scheduleSliderContainer}>
          <Slider />
        </section>
      </article>
    </div>
  );
}
