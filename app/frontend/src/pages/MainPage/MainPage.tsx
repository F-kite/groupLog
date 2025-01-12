import Header from "@/components/Header/Header";
import HomePage from "@/components/HomePage/HomePage";
import styles from "./styles.module.scss";

export default function MainPage() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.body}>
        <HomePage />
      </main>
    </div>
  );
}
