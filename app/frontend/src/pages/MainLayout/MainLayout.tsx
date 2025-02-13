import Header from "@/components/Header/Header";
import styles from "./styles.module.scss";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <header>
        <Header />
      </header>
      <main>{children}</main>
      <footer>Footer</footer>
    </div>
  );
}
