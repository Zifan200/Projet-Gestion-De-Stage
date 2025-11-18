export const FormTemplate = ({ children, title, description }) => {
    return (
        <div
            className="
        flex justify-center items-start min-h-screen
        mt-12               /* PC : espace en haut */
        phone:min-h-0 phone:h-auto phone:mt-0 phone:mb-0 phone:w-full phone:p-0 phone:justify-start phone:items-start
      "
        >
            <div
                className="
          flex flex-col p-10 min-w-[300px]
          border border-zinc-300 shadow-md rounded-xl
          bg-white/30 backdrop-blur-md
          phone:m-0 phone:p-0 phone:min-w-full phone:rounded-none phone:shadow-none phone:border-0
        "
            >
                <h1 className="text-5xl mb-10 text-black text-center phone:text-3xl phone:mb-0">
                    {title}
                </h1>
                <h4 className="text-lg text-zinc-500 mb-14 text-center phone:text-base phone:mb-0">
                    {description}
                </h4>
                {children}
            </div>
        </div>
    );
};
