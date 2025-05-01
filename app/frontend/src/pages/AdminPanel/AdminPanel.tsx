import { useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import administrationApi from "@/lib/api/administration";
import groupApi from "@/lib/api/groups";
import { MyContext } from "@/lib/hooks/MyContextProvider";

import { Combobox } from "@/components/ui/custom/combobox";
import ScheduleAdditionPanel from "@/components/ScheduleAdditionPanel/ScheduleAdditionPanel";
import DropDownList from "@/components/DropDownList/DropDownList";

import styles from "./styles.module.scss";
import { Save, Trash, Pencil } from "lucide-react";
import { SentDataOnChangedUserInfoProps } from "@/lib/types/user";

type UsersInfoProps = {
  user_id: number;
  name: string;
  email: string;
  created_at: string;
  role: string;
  group: string | null;
};

type GroupListProps = {
  value: string;
  label: string;
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
  undefined: "Не выбрано",
};

export default function AdminPanel() {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error("MyContext must be used within a MyProvider");
  }
  const { userInfo } = context;

  const [usersInfo, setUsersInfo] = useState<UsersInfoProps[]>([]);
  const [editableRowId, setEditableRowId] = useState<number | null>(null);
  const [groupsList, setGroupsList] = useState<GroupListProps[]>([]);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const fetchAllUsersInfo = async () => {
      try {
        const response = await administrationApi.fetchAllUsers();
        const data: UsersInfoProps[] = [];
        console.log(response);
        if (Array.isArray(response)) {
          response.map((el) => {
            data.push({
              user_id: el.user_id,
              role: el.user_role?.name,
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

  useEffect(() => {
    const fetchAllGroups = async () => {
      try {
        const response = await groupApi.getAllGroups();
        // console.log(response);
        const data: GroupListProps[] = [{ value: "", label: "Без группы" }];
        if (Array.isArray(response)) {
          response.map((el) => {
            data.push({
              value: el.name,
              label: el.name,
            });
          });
          setGroupsList(data);
        } else {
          console.error("Response is not an array:", response);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllGroups();
  }, [setGroupsList]);

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
  };

  const handleSaveChanged = async () => {
    try {
      const userIndex = usersInfo.findIndex(
        (el) => el.user_id == editableRowId
      );
      const currentUserInfo = usersInfo[userIndex];
      const sentData: SentDataOnChangedUserInfoProps = {
        user_id: editableRowId as number,
      };
      if (selectedRole || selectedRole != currentUserInfo.role) {
        sentData.role = selectedRole;
      }

      if (selectedGroup != currentUserInfo.group) {
        sentData.group = selectedGroup;
      }

      if (!sentData.role && !sentData.group) {
        throw new Error("Нет данных для отправки");
      } else {
        const response = await administrationApi.changedGroupOrRoleUser(
          sentData
        );
        console.log(response);
      }
    } catch (error) {
      alert(error);
    }
  };

  const handleDeleteUser = async (editableRowId: any) => {
    try {
      const response = await administrationApi.removeUser(
        editableRowId as number
      );
      if (response.error) {
        throw new Error(response.error);
      }
      console.log("Пользователь удален");
    } catch (error) {
      console.error(error);
    }
  };

  if (usersInfo.length > 0)
    return (
      <div className={styles.container}>
        <ScheduleAdditionPanel
          groupsList={groupsList.slice(1)}
          userInfoGroup={userInfo.group}
        />
        <div className={styles.tableContainer}>
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
                              elements={groupsList ? groupsList : []}
                              currentEl={info[key]}
                              onChange={handleGroupChange}
                            />
                          ) : key == "role" ? (
                            <DropDownList
                              currentEl={valueRolesOnRus[info[key] as RoleKeys]}
                              onChange={handleRoleChange}
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
                      <Pencil />
                    </Button>
                    {editableRowId === info.user_id ? (
                      <Button
                        variant={"auth"}
                        className={styles.button}
                        onClick={async () => await handleSaveChanged()}
                      >
                        <Save />
                      </Button>
                    ) : (
                      <Button
                        variant={"auth"}
                        className={styles.button}
                        onClick={() => {
                          if (editableRowId !== info.user_id)
                            handleDeleteUser(info.user_id);
                        }}
                      >
                        <Trash />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
}
