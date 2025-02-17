import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginSchema } from "../../../schemas/index";
import FormError from "./FormError";
import userApi from "../../utils/api/users";

type DataUserProps = {
  userLogin: string;
  password: string;
};

async function Login(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    const error = validatedFields.error.issues[0].message;
    return { error: error };
  }
  try {
    const dataUser: DataUserProps = {
      userLogin: values.userLogin,
      password: values.password,
    };

    const response = await userApi.LoginUser(dataUser);
    return response;
  } catch (error) {
    console.error("Необработанная ошибка:", error);
    return { error: "Ошибка при входе!" };
  }
}

export default function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [userLogin, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    Login({ userLogin, password }).then((data) => {
      if ("error" in data) {
        setError(data.error);
      } else if ("success" in data) {
        navigate("/");
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-6 ", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl Tilda-sans-md">Авторизация</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Эл. почта | Логин</Label>
                <Input
                  id="email"
                  type="text"
                  autoComplete="email webauthn"
                  required
                  onChange={(e) => setLogin(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Пароль</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Забыли пароль?
                  </a>
                </div>
                <div className="flex items-center relative">
                  <Input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  {password ? (
                    showPassword ? (
                      <EyeOpenIcon
                        className="h-5 w-5 absolute right-5"
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <EyeClosedIcon
                        className="h-5 w-5 absolute right-5"
                        onClick={() => setShowPassword(true)}
                      />
                    )
                  ) : null}
                </div>
              </div>
              <FormError message={error} />
              <Button type="submit" variant="auth" size="lg" className="w-full">
                Войти
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                Войти с помошью Google аккаунта
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Нет аккаунта?{" "}
              <a href="/registration" className="underline underline-offset-4">
                Зарегистрироваться
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
