import { useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import administrationApi from "@/lib/api/administration";
import { MyContext } from "@/lib/hooks/MyContextProvider";
import styles from "./styles.module.scss";
import { Combobox } from "../ui/custom/combobox";

type UsersInfoProps = {
  user_id: number;
  name: string;
  email: string;
  created_at: string;
  role: string;
  group: string | null;
};

const columnsValue = {
  user_id: "ID",
  name: "Имя пользователя",
  email: "Почта",
  created_at: "Создан ",
  role: "Роль",
  group: "Группа",
};

const valueRolesOnRus = {
  administrator: "Администратор",
  student: "Студент",
  teacher: "Преподаватель",
};

const elements = [
  {
    value: "ИСт-221",
    label: "ИСт-221",
  },
  {
    value: "ИСт-222",
    label: "ИСт-222",
  },
  {
    value: "ИБт-221",
    label: "ИБт-221",
  },
];

export default function AdminPanel() {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }
  //   const { userInfo, currentInfo } = context;
  const [usersInfo, setUsersInfo] = useState<UsersInfoProps[]>([]);
  const [editableRowId, setEditableRowId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAllUsersInfo = async () => {
      try {
        const response = await administrationApi.FetchAllUsers();
        const data: UsersInfoProps[] = [];
        console.log(response);
        if (Array.isArray(response)) {
          response.map((el) => {
            data.push({
              user_id: el.user_id,
              role: el.user_role.name,
              group: el.group?.name,
              name: el.name,
              email: el.email,
              created_at: new Date(el.created_at).toISOString().split("T")[0],
            });
          });
          setUsersInfo(data);
        } else {
          console.error("Response is not an array:", response);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsersInfo();
  }, [setUsersInfo]);

  function DropDownList(currentEl: { currentEl: string }) {
    return (
      <Select>
        <SelectTrigger className="w-[160px] bg-auth text-auth-foreground shadow hover:bg-auth/90">
          <SelectValue placeholder={`${currentEl.currentEl}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="administrator">Администратор</SelectItem>
            <SelectItem value="teacher">Преподаватель</SelectItem>
            <SelectItem value="student">Студент</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  if (usersInfo.length > 0)
    return (
      <div className={styles.container}>
        <Table className={styles.table}>
          <TableHeader>
            <TableRow className={styles.tableRow}>
              {Object.entries(usersInfo[0]).map(([key]) => {
                const columnKey = key as keyof typeof columnsValue;
                return (
                  <TableHead className={styles.headerCell}>
                    {columnsValue[columnKey]}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersInfo.map((info) => (
              <TableRow key={info.user_id} className={styles.tableRow}>
                {Object.entries(info).map(([key, value]) => {
                  type RoleKeys = keyof typeof valueRolesOnRus;
                  return (
                    <TableCell key={key} className={styles.tableCell}>
                      {editableRowId === info.user_id ? (
                        key == "group" ? (
                          <Combobox
                            elements={elements}
                            currentEl={info[key]}
                          ></Combobox>
                        ) : key == "role" ? (
                          <DropDownList
                            currentEl={valueRolesOnRus[info[key] as RoleKeys]}
                          />
                        ) : (
                          value
                        )
                      ) : value != null ? (
                        value in valueRolesOnRus ? (
                          valueRolesOnRus[value as RoleKeys]
                        ) : (
                          value
                        )
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  );
                })}
                <TableCell className={styles.cellButtons}>
                  <Button
                    variant={"auth"}
                    className={styles.button}
                    onClick={() => {
                      if (editableRowId === info.user_id)
                        setEditableRowId(null);
                      else setEditableRowId(info.user_id);
                    }}
                  >
                    update
                  </Button>
                  {editableRowId === info.user_id ? (
                    <Button variant={"auth"} className={styles.button}>
                      save
                    </Button>
                  ) : (
                    <Button variant={"auth"} className={styles.button}>
                      delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
}
