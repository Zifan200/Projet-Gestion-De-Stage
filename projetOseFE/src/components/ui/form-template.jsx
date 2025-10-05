export const FormTemplate = ({ children, title, description }) => {
  return (
    <>
      <div className={"flex align-middle mt-auto mb-auto min-h-screen"}>
        <div
          className={
            "flex flex-col p-10 max-w-[600px] min-w-[300px] m-auto w-4/10 mt-auto mb-auto border border-zinc-300 shadow-md rounded-xl bg-white/30 backdrop-blur-md"
          }
        >
          <h1 className={"text-5xl mb-10 text-black text-center "}>{title}</h1>
          <h4 className={"text-lg text-zinc-500 mb-14 text-center"}>
            {description}
          </h4>
          {children}
        </div>
      </div>
    </>
  );
};
