export const menuConfig = [
    {
        id: "connexion",
        label: "Connexion",
        sections: [
            {
                title: "Choisir votre rôle",
                links: [
                    { label: "Utilisateurs", href: "/login" },
                    { label: "Gestionnaire", href: "/login/gs" },
                ],
            },
        ],
    },
    {
        id: "signup",
        label: "Créer un compte",
        sections: [
            {
                title: "Créer un compte",
                links: [
                    { label: "Étudiant", href: "/signup/etudiant" },
                    { label: "Gestionnaire", href: "/signup/gs" },
                    { label: "Employeur", href: "/signup/employer" },
                ],
            },
        ],
    },
];