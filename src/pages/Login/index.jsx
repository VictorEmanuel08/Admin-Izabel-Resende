import { LoginForm } from "../../components/LoginForm";
import logo from "../../assets/LOGO_IR-removebg.png";
export function Login() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-granito-pitaia space-y-4">
      <img className="w-44 rounded-xl" src={logo} alt="Logo" />
      <LoginForm />
    </div>
  );
}
