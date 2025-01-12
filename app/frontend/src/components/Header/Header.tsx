import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import styles from "./styles.module.scss";

export default function Header() {
  return (
    <header>
      <div className={styles.headerContainer}>
        <nav className={styles.subHeaderContainer}>
          <div className={styles.avatarContainer}>
            <Avatar className={styles.avatar}>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>V</AvatarFallback>
            </Avatar>
            <span className={styles.avatarText}>by Vill</span>
          </div>

          <nav className={styles.menuContainer}>
            <ul className={styles.menu}>
              <li>
                <a href="/" className={`${styles.menuItem} Tilda-sans-rg`}>
                  Главная
                </a>
              </li>
              <li>
                <a href="#" className={`${styles.menuItem} Tilda-sans-rg`}>
                  Посещаемость
                </a>
              </li>
              <li>
                <a href="#" className={`${styles.menuItem} Tilda-sans-rg`}>
                  Группа
                </a>
              </li>
              <li>
                <a href="#" className={`${styles.menuItem} Tilda-sans-rg`}>
                  Расписание
                </a>
              </li>
            </ul>
          </nav>

          <div className={styles.buttonContainer}>
            <Button variant="auth" size="lg" className={styles.menuItem}>
              Выйти
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
