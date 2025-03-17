import styles from "./503.module.scss";

export default function ErrorServerUnavailable() {
  return (
    <div className={styles.body}>
      <div className={styles.text}>
        <p>503</p>
      </div>
      <div className={styles.information}>
        <p>
          Сервер испытывает трудности.
          <br />
          Приносим извинения.
        </p>
      </div>
      <div className={styles.container}>
        {/* <!-- caveman left --> */}
        <div className={styles.caveman}>
          <div className={styles.leg}>
            <div className={styles.foot}>
              <div className={styles.fingers}></div>
            </div>
          </div>
          <div className={styles.leg}>
            <div className={styles.foot}>
              <div className={styles.fingers}></div>
            </div>
          </div>
          <div className={styles.shape}>
            <div className={styles.circle}></div>
            <div className={styles.circle}></div>
          </div>
          <div className={styles.head}>
            <div className={styles.eye}>
              <div className={styles.nose}></div>
            </div>
            <div className={styles.mouth}></div>
          </div>
          <div className={styles.armRight}>
            <div className={styles.club}></div>
          </div>
        </div>
        {/* <!-- caveman right --> */}
        <div className={styles.caveman}>
          <div className={styles.leg}>
            <div className={styles.foot}>
              <div className={styles.fingers}></div>
            </div>
          </div>
          <div className={styles.leg}>
            <div className={styles.foot}>
              <div className={styles.fingers}></div>
            </div>
          </div>
          <div className={styles.shape}>
            <div className={styles.circle}></div>
            <div className={styles.circle}></div>
          </div>
          <div className={styles.head}>
            <div className={styles.eye}>
              <div className={styles.nose}></div>
            </div>
            <div className={styles.mouth}></div>
          </div>
          <div className={styles.armRight}>
            <div className={styles.club}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
