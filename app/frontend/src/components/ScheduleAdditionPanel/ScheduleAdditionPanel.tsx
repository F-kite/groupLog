import React, { useState } from "react";
import { Combobox } from "@/components/ui/custom/combobox"; // Импортируем ваш Combobox
import { Button } from "@/components/ui/button";

import styles from "./styles.module.scss";
import scheduleApi from "@/lib/api/schedule";

type GroupListProps = {
  value: string;
  label: string;
};

type ScheduleHeaderProps = {
  groupsList: GroupListProps[];
  userInfoGroup: string;
};

export default function ScheduleAdditionPanel({
  groupsList,
  userInfoGroup,
}: ScheduleHeaderProps) {
  const [selectedGroup, setSelectedGroup] = useState(userInfoGroup);
  const [weekNumber, setWeekNumber] = useState<number | "">("");

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
  };

  const handleWeekNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedValue = value === "" ? "" : parseInt(value, 10);
    if (parsedValue === "" || (parsedValue >= 1 && parsedValue <= 25)) {
      setWeekNumber(parsedValue);
    }
  };

  const handleAddClick = async () => {
    if (!selectedGroup || weekNumber === "") {
      alert("Пожалуйста, выберите группу и укажите номер недели.");
      return;
    }
    try {
      const scheduleAddResponse = await scheduleApi.createSchedule(
        selectedGroup,
        weekNumber
      );
      if ("error" in scheduleAddResponse) {
        throw new Error(scheduleAddResponse.error);
      } else if ("success" in scheduleAddResponse) {
        console.log(scheduleAddResponse.success);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.additionPanel}>
      <span>
        Расписание для группы{" "}
        <Combobox
          elements={groupsList}
          currentEl={selectedGroup}
          onChange={handleGroupChange}
        />{" "}
        на
        <input
          type="number"
          min={1}
          max={25}
          value={weekNumber}
          onChange={handleWeekNumberChange}
          aria-label="Номер недели"
          className={styles.input}
        />
        неделю
      </span>

      <Button variant={"auth"} onClick={handleAddClick}>
        Добавить
      </Button>
    </div>
  );
}
