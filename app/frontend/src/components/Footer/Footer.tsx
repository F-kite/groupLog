import { Link } from "react-router";
import styles from "./styles.module.scss";

import { communicationWithDeveloper } from "@/store/data";

const linkItems = communicationWithDeveloper;

export default function Footer() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.flexContainer}>
          <div className={styles.title}>
            <span>Связаться с разработчиком</span>
          </div>
          <div className={styles.links}>
            {linkItems.map((item) => (
              <Link
                key={item.connection}
                to={item.href}
                className={`${styles.linksItem} ${
                  location.pathname === item.href ? styles.active : ""
                }`}
              >
                <img src={item.icon} alt="" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
