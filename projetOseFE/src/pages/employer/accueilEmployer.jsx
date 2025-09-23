import {useNavigate} from "react-router";

export default function AccueilEmployer() {

    const navigate = useNavigate();

    const naviguerCreationOffres = () => {
        navigate("/employer/ajout_stages");
    };
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh"
        }}>
            <h1 className="text-3xl font-bold">Que souhaitez-vous faire aujourd'hui ?</h1>

            <button className="cursor-pointer p-4 bg-black rounded-xl  text-white text-l hover:text-xl ease-out
                    mt-10 hover:font-semibold duration-500 transition-all" onClick={naviguerCreationOffres}>
                Téléverser une nouvelle offre de stage
            </button>
        </div>
    );
}