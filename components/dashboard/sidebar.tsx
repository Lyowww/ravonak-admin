"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconMarket({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="31"
      height="28"
      viewBox="0 0 31 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M1.97037 0.757679C1.83641 0.221887 1.29347 -0.103861 0.757679 0.0300997C0.221887 0.164061 -0.103861 0.707003 0.0300997 1.24279L1.43256 6.85209L2.73764 12.2974C3.29256 14.6128 3.72936 16.4354 4.24769 17.8512C4.77937 19.3036 5.43138 20.4311 6.47748 21.2957C6.56776 21.3703 6.65973 21.4428 6.75333 21.5132C7.83794 22.329 9.08636 22.7003 10.6226 22.8788C12.1202 23.0529 13.9943 23.0529 16.3753 23.0529H17.1667C19.2267 23.0529 20.8484 23.0529 22.1548 22.9208C23.4929 22.7855 24.5939 22.5046 25.5848 21.8843C26.0547 21.59 26.4914 21.2456 26.8871 20.8572C27.6683 20.0903 28.1831 19.159 28.6096 18.0002H22.3337C21.7814 18.0002 21.3337 17.5525 21.3337 17.0002C21.3337 16.448 21.7814 16.0002 22.3337 16.0002H29.2268C29.3898 15.3942 29.5548 14.7293 29.7313 14.0002L18.3337 14.0002C17.7814 14.0002 17.3337 13.5525 17.3337 13.0002C17.3337 12.448 17.7814 12.0002 18.3337 12.0002L30.2102 12.0002C30.4082 11.1558 30.5635 10.4315 30.6337 9.81695C30.7294 8.9799 30.6904 8.18288 30.2725 7.45516C30.0938 7.14392 29.8704 6.86059 29.6094 6.61426C28.9991 6.03832 28.2331 5.81459 27.3968 5.71254C26.591 5.61422 25.5673 5.61424 24.3251 5.61427L3.18464 5.61427L1.97037 0.757679Z"
        fill="white"
      />
      <path
        d="M12.2284 27.6669C13.0036 27.6669 13.6319 27.0385 13.6319 26.2634C13.6319 25.4883 13.0036 24.8599 12.2284 24.8599C11.4533 24.8599 10.8249 25.4883 10.8249 26.2634C10.8249 27.0385 11.4533 27.6669 12.2284 27.6669Z"
        fill="white"
      />
      <path
        d="M20.6495 27.6669C21.4246 27.6669 22.053 27.0385 22.053 26.2634C22.053 25.4883 21.4246 24.8599 20.6495 24.8599C19.8744 24.8599 19.246 25.4883 19.246 26.2634C19.246 27.0385 19.8744 27.6669 20.6495 27.6669Z"
        fill="white"
      />
    </svg>
  );
}

function IconMoneyDelivery({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M11.7298 6.32457C11.8186 6.27332 11.9088 6.22725 12.0001 6.18625L12.0001 11.56C9.83069 10.602 9.62747 7.53834 11.7298 6.32457Z"
        fill="white"
      />
      <path
        d="M14.0001 19.8138L14.0001 14.44C16.1696 15.3979 16.3728 18.4617 14.2705 19.6754C14.1817 19.7267 14.0915 19.7728 14.0001 19.8138Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.9397 1.76449e-07H13.0603C15.509 -1.07113e-05 17.4285 -1.93715e-05 18.9514 0.164971C20.5054 0.333342 21.7646 0.683099 22.8397 1.4642C23.4905 1.93708 24.0629 2.50945 24.5358 3.16031C25.3169 4.23541 25.6667 5.49459 25.835 7.04864C26 8.57146 26 10.4909 26 12.9395V13.0604C26 15.509 26 17.4285 25.835 18.9514C25.6667 20.5054 25.3169 21.7646 24.5358 22.8397C24.0629 23.4905 23.4905 24.0629 22.8397 24.5358C21.7646 25.3169 20.5054 25.6667 18.9514 25.835C17.4285 26 15.5091 26 13.0605 26H12.9396C10.491 26 8.57146 26 7.04864 25.835C5.49459 25.6667 4.23541 25.3169 3.16031 24.5358C2.50945 24.0629 1.93708 23.4905 1.4642 22.8397C0.683099 21.7646 0.333342 20.5054 0.164971 18.9514C-1.93715e-05 17.4285 -1.07113e-05 15.509 1.76449e-07 13.0603V12.9397C-1.07113e-05 10.491 -1.93715e-05 8.57148 0.164971 7.04864C0.333342 5.49459 0.683099 4.23541 1.4642 3.16031C1.93708 2.50945 2.50945 1.93708 3.16031 1.4642C4.23541 0.683099 5.49459 0.333342 7.04864 0.164971C8.57148 -1.93715e-05 10.491 -1.07113e-05 12.9397 1.76449e-07ZM14.0001 3.66667C14.0001 3.11438 13.5524 2.66667 13.0001 2.66667C12.4478 2.66667 12.0001 3.11438 12.0001 3.66667V4.07743C11.5644 4.18673 11.1368 4.3575 10.7298 4.59252C7.10063 6.68781 7.5619 12.0652 11.4949 13.5118L12.0001 13.6977L12.0001 19.9593C11.2869 19.7581 10.6497 19.2893 10.2507 18.5983L9.74998 17.731C9.47383 17.2527 8.86225 17.0888 8.38395 17.365C7.90566 17.6411 7.74178 18.2527 8.01793 18.731L8.51868 19.5983C9.28997 20.9343 10.5903 21.7728 12.0001 22.0046L12.0001 22.3333C12.0001 22.8856 12.4478 23.3333 13.0001 23.3333C13.5524 23.3333 14.0001 22.8856 14.0001 22.3333L14.0001 21.9226C14.4358 21.8133 14.8634 21.6425 15.2705 21.4075C18.8996 19.3122 18.4384 13.9348 14.5054 12.4882L14.0001 12.3023L14.0001 6.0407C14.7133 6.24183 15.3506 6.71063 15.7495 7.40166L16.2503 8.269C16.5264 8.74729 17.138 8.91116 17.6163 8.63502C18.0946 8.35888 18.2585 7.74729 17.9824 7.26899L17.4816 6.40166C16.7103 5.06571 15.4099 4.22711 14.0001 3.99533V3.66667Z"
        fill="white"
      />
    </svg>
  );
}

function IconSimCard({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="29"
      height="29"
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M15.6534 2C16.8012 2 17.3092 2.00101 17.7282 2.03852C22.3859 2.45553 26.0773 6.14689 26.4943 10.8046C26.5318 11.2236 26.5328 11.7316 26.5328 12.8794V14.1993C26.5328 14.7516 26.9805 15.1993 27.5328 15.1993C28.0851 15.1993 28.5328 14.7516 28.5328 14.1993V12.8121C28.5328 11.7496 28.5328 11.1458 28.4863 10.6263C27.983 5.00487 23.5279 0.549782 17.9065 0.0464839C17.387 -3.08255e-05 16.7832 -1.93566e-05 15.7205 8.2978e-07H14.3335C13.7812 8.2978e-07 13.3335 0.447718 13.3335 1C13.3335 1.55229 13.7812 2 14.3335 2L15.6534 2Z"
        fill="#FAFAFA"
      />
      <path
        d="M7.81578 3.7004C6.41299 2.41142 4.25679 2.41142 2.854 3.7004C2.79656 3.75318 2.73523 3.81452 2.6556 3.89417L1.45893 5.09085C0.254774 6.295 -0.250718 8.03089 0.118699 9.69326C2.21466 19.1251 9.58071 26.4911 19.0125 28.5871C20.6749 28.9565 22.4108 28.451 23.6149 27.2469L24.8115 26.0503C24.8912 25.9706 24.9526 25.9093 25.0054 25.8518C26.2944 24.449 26.2944 22.2928 25.0054 20.89C24.9526 20.8325 24.8912 20.7712 24.8115 20.6915L22.8525 18.7325C21.4923 17.3723 19.4383 16.9833 17.675 17.7519C16.6655 18.192 15.4896 17.9693 14.7109 17.1906L11.5152 13.9948C10.7365 13.2162 10.5138 12.0402 10.9538 11.0308C11.7225 9.26749 11.3335 7.21345 9.97332 5.85332L8.01421 3.8942C7.93456 3.81454 7.87323 3.75319 7.81578 3.7004Z"
        fill="#FAFAFA"
      />
      <path
        d="M15.2761 4.71405C14.7239 4.71405 14.2761 5.16176 14.2761 5.71405C14.2761 6.26633 14.7239 6.71405 15.2761 6.71405H16.0304C16.1467 6.71405 16.1943 6.71407 16.2331 6.71463C19.2992 6.75854 21.7741 9.23346 21.818 12.2996C21.8186 12.3383 21.8186 12.386 21.8186 12.5023V13.2565C21.8186 13.8088 22.2663 14.2565 22.8186 14.2565C23.3709 14.2565 23.8186 13.8088 23.8186 13.2565V12.4926C23.8186 12.389 23.8186 12.3259 23.8178 12.2709C23.7584 8.12267 20.41 4.77424 16.2617 4.71483C16.2067 4.71405 16.1437 4.71405 16.04 4.71405H15.2761Z"
        fill="#FAFAFA"
      />
    </svg>
  );
}

/** «Данные» — тот же набор path, что и у SIM (по макету). */
function IconData({ className }: { className?: string }) {
  return <IconSimCard className={className} />;
}

function IconNavArrow({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="12"
      viewBox="0 0 18 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M13.278 0.217309C12.9838 -0.0742744 12.5089 -0.0721557 12.2173 0.222041C11.9257 0.516238 11.9278 0.991107 12.222 1.28269L13.985 3.03C14.7005 3.73914 15.1913 4.22718 15.5234 4.64071C15.6313 4.77509 15.7155 4.8934 15.7809 5L0.75 5C0.335786 5 0 5.33579 0 5.75C0 6.16422 0.335786 6.5 0.75 6.5L15.7809 6.5C15.7155 6.6066 15.6313 6.72491 15.5234 6.85929C15.1913 7.27282 14.7005 7.76086 13.985 8.47L12.222 10.2173C11.9278 10.5089 11.9257 10.9838 12.2173 11.278C12.5089 11.5722 12.9838 11.5743 13.278 11.2827L15.0727 9.5039C15.7487 8.83395 16.3011 8.28641 16.6929 7.79854C17.1004 7.29121 17.3953 6.77628 17.4741 6.15816C17.4914 6.02265 17.5 5.88632 17.5 5.75C17.5 5.61368 17.4914 5.47735 17.4741 5.34184C17.3953 4.72372 17.1004 4.20878 16.6929 3.70146C16.3011 3.21358 15.7487 2.66604 15.0727 1.99609L13.278 0.217309Z"
        fill="white"
      />
    </svg>
  );
}

function NavSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-7 first:mt-0">
      <div className="flex items-center gap-3 px-0.5">
        <span className="flex h-[30px] w-8 shrink-0 items-center justify-center [&>svg]:max-h-[28px] [&>svg]:max-w-[31px]">
          {icon}
        </span>
        <span className="text-[15px] font-semibold leading-tight tracking-tight text-white">
          {title}
        </span>
      </div>
      <div className="mt-2.5 space-y-0.5 pl-1">{children}</div>
    </div>
  );
}

function NavItem({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-xl py-2.5 pl-1 pr-2 text-[14px] leading-snug transition-colors ${
        active
          ? "font-semibold text-white"
          : "text-[#b4b4bc] hover:text-white/95"
      }`}
    >
      <span
        className={`flex h-3 w-[18px] shrink-0 items-center justify-center ${
          active ? "" : "opacity-0"
        }`}
        aria-hidden
      >
        {active ? <IconNavArrow className="h-3 w-[18px]" /> : null}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </Link>
  );
}

type SidebarProps = {
  onLogout: () => void;
};

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const marketStatsActive = pathname === "/dashboard";
  const marketOrdersActive = pathname.startsWith("/dashboard/market/orders");
  const marketProductsActive = pathname.startsWith("/dashboard/market/products");
  const marketBannersActive = pathname.startsWith("/dashboard/market/banners");
  const marketUsersActive = pathname.startsWith("/dashboard/market/users");
  const moneyTransferStatsActive = pathname === "/dashboard/money-transfer";
  const moneyTransferOrdersActive = pathname === "/dashboard/money-transfer/orders";
  const moneyTransferOrdersHistoryActive = pathname.startsWith(
    "/dashboard/money-transfer/orders/history"
  );
  const moneyTransferUsersActive = pathname.startsWith(
    "/dashboard/money-transfer/users"
  );
  const simCardStatsActive = pathname === "/dashboard/sim-card";
  const simCardUsersActive = pathname.startsWith("/dashboard/sim-card/users");
  const dataDebitCreditActive = pathname.startsWith("/dashboard/data/debit-credit");
  const dataSamarkandActive = pathname.startsWith("/dashboard/data/samarkand-reserve");
  const dataCommissionActive = pathname.startsWith("/dashboard/data/commission");
  const dataReportsActive = pathname.startsWith("/dashboard/data/reports");

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-r-[28px] bg-[#292B31] px-7 pb-8 pt-10 text-[14px] leading-tight text-white">
      <div className="px-0.5">
        <h1 className="text-[18px] font-bold leading-tight tracking-tight text-white">
          Admin Ravonak
        </h1>
      </div>

      <nav className="mt-10 flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto pb-2">
        <NavSection title="Маркет" icon={<IconMarket />}>
          <NavItem href="/dashboard" active={marketStatsActive}>
            Статистика
          </NavItem>
          <NavItem href="/dashboard/market/orders" active={marketOrdersActive}>
            Заказы
          </NavItem>
          <NavItem href="/dashboard/market/products" active={marketProductsActive}>
            Товары и Категории
          </NavItem>
          <NavItem href="/dashboard/market/banners" active={marketBannersActive}>
            Баннеры и акции
          </NavItem>
          <NavItem href="/dashboard/market/users" active={marketUsersActive}>
            Пользователи
          </NavItem>
        </NavSection>

        <NavSection title="Доставка денег" icon={<IconMoneyDelivery />}>
          <NavItem href="/dashboard/money-transfer" active={moneyTransferStatsActive}>
            Статистика
          </NavItem>
          <NavItem
            href="/dashboard/money-transfer/orders"
            active={moneyTransferOrdersActive}
          >
            Заказы
          </NavItem>
          <NavItem
            href="/dashboard/money-transfer/orders/history"
            active={moneyTransferOrdersHistoryActive}
          >
            История заказов
          </NavItem>
          <NavItem
            href="/dashboard/money-transfer/users"
            active={moneyTransferUsersActive}
          >
            Пользователи
          </NavItem>
        </NavSection>

        <NavSection title="SIM-карта" icon={<IconSimCard />}>
          <NavItem href="/dashboard/sim-card" active={simCardStatsActive}>
            Статистика
          </NavItem>
          <NavItem href="/dashboard/sim-card/users" active={simCardUsersActive}>
            Пользователи
          </NavItem>
        </NavSection>

        <NavSection title="Данные" icon={<IconData />}>
          <NavItem
            href="/dashboard/data/debit-credit"
            active={dataDebitCreditActive}
          >
            Дебит-Кредит
          </NavItem>
          <NavItem href="/dashboard/data/reports" active={dataReportsActive}>
            Отчеты
          </NavItem>
          <NavItem
            href="/dashboard/data/samarkand-reserve"
            active={dataSamarkandActive}
          >
            Резерв Самарканда
          </NavItem>
          <NavItem
            href="/dashboard/data/commission"
            active={dataCommissionActive}
          >
            Изменить комиссию
          </NavItem>
        </NavSection>
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-auto shrink-0 rounded-xl border border-white/12 px-4 py-3 text-[14px] font-medium text-[#c4c4cc] transition hover:border-white/20 hover:text-white"
      >
        Выйти
      </button>
    </aside>
  );
}
