import { useState, useEffect } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "../ui/popover.jsx";
import usersToml from "./users.toml";
import useAuthStore from "../../stores/authStore.js";
import { useTranslation, Trans } from "react-i18next";
import { Toaster, toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const DevMode = ({ children }) => {
  const [isDevMode, setIsDevMode] = useState(false);
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const users = usersToml.users;

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.warn("DEV MODE");
      setIsDevMode(true);
    }
  }, []);

  if (!isDevMode) return <>{children}</>;

  const handleQuickLogin = async (data) => {
    try {
      const user = await login(data);
      toast.success(t("success.loginSucces"), { duration: 3000 });
      setTimeout(() => {
        if (user.role === "STUDENT") navigate("/dashboard/student");
        if (user.role === "EMPLOYER") navigate("/dashboard/employer");
        if (user.role === "GESTIONNAIRE") navigate("/dashboard/gs/");
      }, 1500);
    } catch (e) {
      if (e.response?.status === 500 || e.response?.status === 401) {
        console.error(e);
        toast.error(t("errors.invalidCredentials"));
      } else {
        toast.error("Erreur inconnue");
      }
    }
  };

  return (
    <>
      {children}

      <Popover>
        {({ open, setOpen, triggerRef, contentRef }) => (
          <>
            <div className="fixed bottom-5 left-2 ">
              <PopoverTrigger
                open={open}
                setOpen={setOpen}
                triggerRef={triggerRef}
              >
                <div className="w-[45px] h-[45px] bg-zinc-800 border border-zinc-600 shadow-lg hover:bg-zinc-700 transition rounded-full flex items-center justify-center cursor-pointer">
                  <div className="w-2/3 h-2/3 bg-[url('/assets/img/react.png')] bg-cover bg-center"></div>
                </div>
              </PopoverTrigger>

              <PopoverContent
                open={open}
                contentRef={contentRef}
                bottomPercent={"1%"}
                leftPercent={"50px"}
              >
                <div className="flex flex-col gap-3 text-sm">
                  <h3 className="font-semibold text-gray-800 mb-1">Dev Mode</h3>

                  <div className="mt-2">
                    <h4 className="text-gray-700 text-xs mb-1">Quick Login:</h4>
                    {users && users.length > 0 ? (
                      users.map((user) => (
                        <button
                          key={user.email}
                          onClick={() => handleQuickLogin(user)}
                          className="flex justify-between text-left hover:bg-gray-100 rounded px-2 py-1 w-full"
                        >
                          <span>{user.email}</span>
                          <span className="text-xs text-gray-500 italic border-zinc-300 bg-white rounded-full shadow-lg pl-1 pr-1 border ml-2">
                            {user.role}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500 text-xs">
                        No users found in users.toml
                      </p>
                    )}{" "}
                  </div>

                  <PopoverClose setOpen={setOpen}>Close</PopoverClose>
                </div>
              </PopoverContent>
            </div>
          </>
        )}
      </Popover>
    </>
  );
};
