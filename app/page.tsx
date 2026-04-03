import { LoginForm } from "@/components/login-form";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/login-bg.png)" }}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-[420px]">
        <LoginForm />
      </div>
    </div>
  );
}
