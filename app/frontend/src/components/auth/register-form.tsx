import { useEffect, useState } from "react";
import * as z from "zod";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterSchema } from "../../../schemas/index";
import FormError from "./FormError";
import FormSuccess from "./FormSuccess";
import userApi from "../../utils/api/users";
import { checkServer } from "../../utils/api/index";

async function Registration(values: z.infer<typeof RegisterSchema>) {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    const error = validatedFields.error.issues[0].message;
    return { error: error };
  }
  if (validatedFields.data.password != validatedFields.data.confirmPassword)
    return { error: "Пароли не совпадают" };
  const dataUser = {
    name: values.name,
    email: values.email,
    password: values.password,
  };
  try {
    const response = await userApi.RegistrationUser(dataUser);
    return response;
  } catch (error) {
    console.error("Необработанная ошибка:", error);
    return { error: "Ошибка при регистрации!" };
  }
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    Registration({ name, email, password, confirmPassword }).then((data) => {
      if ("error" in data) {
        setError(data.error);
      } else if ("success" in data) {
        setSuccess(data.success);
      }
    });
  }

  useEffect(() => {
    checkServer().then((res) => console.log(res));
  }, []);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Регистрация</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Логин</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Эл. почта</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@kuzstu.ru"
                  autoComplete="email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Пароль</Label>
                </div>
                <div className="flex items-center relative">
                  <Input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    required
                    onChange={(e) => setPassword(e.target.value)}
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
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Повторите пароль</Label>
                </div>
                <div className="flex items-center relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {password || confirmPassword ? (
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
              <FormSuccess message={success} />
              <Button type="submit" variant="auth" size="lg" className="w-full">
                Зарегистрироваться
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                Войти с помошью Google аккаунта
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Есть аккаунт?{" "}
              <a href="/login" className="underline underline-offset-4">
                Войти
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
