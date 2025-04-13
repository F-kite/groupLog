import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import styles from "./styles.module.scss";

import { useResize } from "@/hooks/useResize";

import userApi from "@/utils/api/users";
import { MyContext } from "@/hooks/MyContextProvider";

const navItems = [
  { name: "Главная", href: "/" },
  { name: "Посещаемость", href: "/attendance" },
  { name: "Группа", href: "/group" },
  { name: "Расписание", href: "/schedule" },
];

export default function Header() {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }
  const { userInfo } = context;

  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const width = useResize();
  const navigate = useNavigate();

  const userName = userInfo.name;
  const userEmail = userInfo.email;

  const handleLogout = async () => {
    try {
      const response = await userApi.LogOutUser();
      console.log("response", response);
      console.log({ ...response });
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
    console.log("Выход из системы");
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.flexContainer}>
          <div className={styles.logo}>
            <span>groupLog</span>
          </div>
          <div className={styles.desktopMenu}>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${styles.menuItem} ${
                  location.pathname === item.href ? styles.active : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className={styles.userMenu}>
            <button
              className={styles.userButton}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <User className="h-5 w-5 mr-2" />
              <span className={`${styles.userName}`}>{userName}</span>
            </button>
            {isUserMenuOpen && width > 960 && (
              <div className={styles.userDropdown}>
                <span className={styles.userEmail}>{userEmail}</span>
                <button className={styles.logoutButton} onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Выйти</span>
                </button>
              </div>
            )}
          </div>
          <button
            className={styles.mobileMenuButton}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="sr-only">Открыть главное меню</span>
            {isOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`${styles.mobileMenu} ${
          isOpen && width < 960 ? styles.open : ""
        }`}
      >
        <div>
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`${styles.mobileMenuItem} ${
                location.pathname === item.href ? styles.active : ""
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <hr className={styles.dividingLine} />
        <div>
          <span className={styles.userEmail}>{userEmail}</span>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
