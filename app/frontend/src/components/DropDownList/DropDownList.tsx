import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";

type DropDownListProps = {
  currentEl: string;
  onChange: (value: string) => void; // Функция для обработки изменений
};

export default function DropDownList({
  currentEl,
  onChange,
}: DropDownListProps) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-[160px] bg-auth text-auth-foreground shadow hover:bg-auth/90">
        <SelectValue placeholder={`${currentEl}`} />
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
