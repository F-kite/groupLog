import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function ErrorPageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle className="text-5xl font-bold text-gray-700 pb-5">
            404
          </CardTitle>
          <CardDescription className="text-xl font-bold text-gray-600">
            Страница не найдена
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-3 text-l text-center ">
            Страница, которую вы ищете, не существует или была перемещена.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            type="submit"
            variant="auth"
            className="w-full h-11 rounded-md px-8"
            onClick={() => navigate("/")}
          >
            <HomeIcon />
            <p className="text-l">Вернуться на главную страницу</p>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
