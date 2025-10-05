import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
export const resources = {
  en: {
    translation: {
      success: {
        loginSucces: "Login successful!",
        registerEnterpriseSuccess:
          "Hello {{firstName}}, your account for {{enterpriseName}} has been successfully created!",
        emailSent: "A password reset email has been sent",
        passwordChange: "Password changed successfully!",
        registerStudentSuccess:
          "Welcome {{firstName}} 🎉! You have successfully registered for the platform ose 2.0 with the porgramme : {{program}}.",
      },
      menu: {
        hello: "Hello",
        disconnect: "Disconnect",
        dashboard: "Dashboard",
        close: "Close",
        connexion: "Login",
        signup: "Sign up",
        signupTitle: "Create an accounte",
        student: "Student",
        manager: "Manager",
        employer: "Employer",
        cvs: "My cv's",
        post: "Postulation",
        myOffer: "My offer",
        lastActivity: "Last activity",
        offerReceive: "Offer receive",
        myOffer: "My offers",
        activeOffer: "Active offer",
        studentOffer: "Student",
        offerConfirm: "Offer sign",
        confirmations: "Confirmations",
        seeOffer: "My offers",
        createOffer: "Create an offer",
        applicationSend: "Application send",
      },
      errors: {
        email: { invalid: "Invalid email address" },
        firstName: { min: "First name must be at least 4 characters" },
        lastName: { min: "Last name must be at least 2 characters" },
        password: {
          regex:
            "Password must be 8–50 characters with at least one uppercase, one lowercase, one number, and one special character (@$!%*?&)",
          match: "Passwords do not match",
        },
        enterpriseName: { min: "Company name must be at least 2 characters" },
        phone: {
          invalid: "Phone number must contain exactly 10 digits (111-111-1111)",
        },
        fillFields: "Please fill in the required information",
        invalidCredentials: "Invalid email or password",
        genericError: "An error occurred, please try again",
        userNotFound: "Error: User not found",
      },
      offer: {
        title: "Create an Internship Offer",
        description: "Fill in the information to publish a new offer.",
        submit: "Submit Offer",
        success: {
          create: "Offer successfully created!",
          delete: "Offer deleted successfully!",
        },
        error: {
          create: "Error while creating the offer.",
          delete: "Error deleting the offer.",
        },
        form: {
          title: "Title",
          description: "Description",
          program: "Targeted Program",
          email: "Employer Email",
          deadline: "Expiration Date",
          placeholders: {
            title: "Ex: Internship at Health Research Institute",
            description: "Ex: Computer science internship in medical research",
            program: "Ex: Computer Science",
            email: "stage@info.com",
          },
        },
        validation: {
          title_required: "A title is required.",
          description_required: "A description is required.",
          program_required: "A program is required.",
          invalid_email: "Invalid email.",
          expiration_required: "An expiration date is required.",
        },
        table: {
          title: "My Internship Offers",
          offerTitle: "Title",
          program: "Program",
          email: "Email",
          deadline: "Deadline",
          actions: "Actions",
          noOffers: "No offers available yet.",
        },
        actions: {
          create_another: "Add New Offer",
          view: "View",
          delete: "Delete",
        },
      },
      description: "Welcome to React and react-i18next",
      form: {
        employer: {
          title: "Create an employer account",
          description:
            "Join OSE 2.0 and start posting your internship offers to connect your company with talented students.",
          enterprise: "*Enter the name of the company you represent",
        },
        student: {
          title: "Create an student account",
          description:
            "Create your student account to access the OSE 2.0 platform, manage your profile, and find an internship that matches your program.",
          adress: "*Enter you adress",
          programmes: "*Enter you program",
          selectProgram: "Select a program from the following:",
        },
        register: {
          accountNotExist: "Don't have an account yet?",
        },
        login: {
          title: "Login",
          description:
            "Login to the OSE 2.0 platform to manage your internships",
          button: "Login",
          accountExist: "Already have an account?",
          forgetPassword: "Forgot password?",
        },
        passwordRequest: {
          title: "Reset your password",
          description:
            "Enter your email to receive a link to reset your password.",
          button: "Send reset link",
          backToLogin: "Back to login",
        },
        passwordReset: {
          title: "Reset your password",
          description: "Enter your new password to reset your account password",
          button: "Reset password",
          backToLogin: "Back to login",
        },
        fields: {
          email: "*Enter your email",
          firstName: "*Enter your first name",
          lastName: "*Enter your last name",
          password: "*Enter your password",
          passwordConfirm: "*Confirm your password",
          phone: "Phone number",
        },
        createBtn: "Create an account",
      },
      studentDashboard: {
        title: "Dashboard",
        menu: "Menu",
        cvs: "Resumes",
        myCvs: "My Resumes",
        addCv: "Add a Resume",
        description:
          "Here you can manage your resumes: add one, view them, download or delete them.",
        noCvs: "No resumes yet",
        table: {
          fileName: "File Name",
          type: "Type",
          size: "Size",
          date: "Date",
          actions: "Actions",
        },
        actions: {
          download: "Download",
          preview: "Preview",
          delete: "Delete",
          close: "Close",
        },
        loading: "Loading...",
        success: {
          uploadCv: "Resume {{fileName}} uploaded successfully",
          downloadCv: "{{fileName}} downloaded successfully",
          deleteCv: "Resume deleted successfully",
        },
        errors: {
          loadUser: "Unable to load user",
          loadCvs: "Error loading resumes",
          uploadCv: "Error uploading resume",
          downloadCv: "Error downloading resume",
          deleteCv: "Error deleting resume",
          previewCv: "Unable to preview resume",
          unsupportedFormat: "Unsupported format",
        },
      },
    },
  },
  fr: {
    translation: {
      success: {
        loginSucces: "Connexion réussie !",
        registerEnterpriseSuccess:
          "Bonjour {{firstName}}, votre compte pour {{enterpriseName}} a été créé avec succès !",
        emailSent: "Un email de changement de mot de passe a été envoyé",
        passwordChange: "Mot de passe changé avec succès !",
        registerStudentSuccess:
          "Bienvenue {{firstName}} 🎉! Vous êtes inscrit dans la platforme ose 2.0 avec le programme : {{program}}.",
        uploadCv: "CV {{fileName}} ajouté avec succès",
        downloadCv: "Téléchargement de {{fileName}} réussi",
        deleteCv: "CV supprimé avec succès",
      },
      menu: {
        hello: "Salut",
        disconnect: "Déconnexion",
        dashboard: "Dashboard",
        close: "Fermer",
        connexion: "Connexion",
        signup: "Créer un compte",
        signupTitle: "Créer un compte",
        student: "Étudiant",
        manager: "Gestionnaire",
        employer: "Employeur",
        cvs: "Mes cv's",
        lastActivity: "Dernières activités",
        applicationSend: "Condidatures envoyées",
        offerReceive: "Offres reçus",
        confirmations: "Confirmations",
        post: "Postulation",
        seeOffer: "Mes offres",
        createOffer: "Créé un offre",
        myOffer: "Mes offres",
        activeOffer: "Offres actives",
        studentOffer: "Étudiants",
        offerConfirm: "Offres signer",
      },
      errors: {
        email: { invalid: "Email est invalide" },
        firstName: { min: "Prénom minimum 4 caractères" },
        lastName: { min: "Nom de famille minimum 2 caractères" },
        password: {
          regex:
            "Le mot de passe doit contenir entre 8 et 50 caractères, avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)",
          match: "Les mots de passe ne correspondent pas",
        },
        enterpriseName: {
          min: "Le nom de l'entreprise doit contenir au moins 2 caractères",
        },
        phone: {
          invalid:
            "Le numéro doit contenir exactement 10 chiffres (111-111-1111)",
        },
        fillFields: "Veuillez remplir les informations requises",
        invalidCredentials: "Courriel ou mot de passe invalide",
        genericError: "Une erreur est survenue, veuillez réessayer",
        userNotFound: "Erreur : Utilisateur introuvable",
        loadCvs: "Erreur lors du chargement des CVs",
        uploadCv: "Erreur lors de l’ajout du CV",
        downloadCv: "Erreur lors du téléchargement du CV",
        deleteCv: "Erreur lors de la suppression du CV",
        previewCv: "Impossible d’afficher le CV",
        unsupportedFormat: "Format non supporté",
      },

      offer: {
        title: "Créer une offre de stage",
        description:
          "Remplis les informations pour publier une nouvelle offre.",
        submit: "Publier l'offre",
        success: {
          create: "Offre créée avec succès !",
          delete: "Offre supprimée avec succès!",
        },
        error: {
          create: "Erreur lors de la création de l'offre.",
        },
        form: {
          title: "Titre",
          description: "Description",
          program: "Programme visé",
          email: "Courriel de l'employeur",
          deadline: "Date limite",
          placeholders: {
            title: "Ex : Stage à l'institut de recherche en santé",
            description: "Ex : Stage en informatique dans le domaine médical",
            program: "Ex : Informatique",
            email: "stage@info.com",
          },
        },
        validation: {
          title_required: "Un titre est obligatoire.",
          description_required: "Une description est obligatoire.",
          program_required: "Un programme est obligatoire.",
          invalid_email: "Courriel invalide.",
          expiration_required: "Une date limite est obligatoire.",
        },
        table: {
          title: "Mes offres de stage",
          offerTitle: "Titre",
          program: "Programme",
          email: "Courriel",
          deadline: "Date limite",
          actions: "Actions",
          noOffers: "Aucune offre pour le moment.",
        },
        actions: {
          create_another: "Ajouter une nouvelle offre",
          view: "Voir",
          delete: "Supprimer",
        },
      },
      form: {
        employer: {
          title: "Créer un compte d'employeur",
          description:
            "Rejoignez OSE 2.0 et commencez à publier vos offres de stage pour connecter votre entreprise avec des étudiants talentueux.",
          enterprise: "*Entrez le nom de l'entreprise que vous représentez",
        },
        student: {
          title: "Créer un compte étudiant",
          description:
            "Créez votre compte étudiant pour accéder à la plateforme OSE 2.0, gérer votre profil et trouver un stage correspondant à votre programme.",
          adress: "*Entrez votre adresse",
          programmes: "*Entrez votre programme",
          selectProgram: "Sélectionnez un programme parmi les suivants",
        },
        register: {
          accountNotExist: "Vous n'avez pas encore de compte ?",
        },
        login: {
          title: "Se connecter",
          description:
            "Connectez-vous à la plateforme OSE 2.0 pour gérer vos stages",
          button: "Se connecter",
          accountExist: "Vous avez déjà un compte ?",
          forgetPassword: "Mot de passe oublié ?",
        },
        passwordRequest: {
          title: "Réinitialiser votre mot de passe",
          description:
            "Entrez votre email pour recevoir un lien de réinitialisation de mot de passe.",
          button: "Envoyer le lien",
          backToLogin: "Retour à la connexion",
        },
        passwordReset: {
          title: "Réinitialiser votre mot de passe",
          description:
            "Entrez votre nouveau mot de passe pour réinitialiser votre mot de passe",
          button: "Réinitialiser le mot de passe",
          backToLogin: "Retour à la connexion",
        },
        fields: {
          email: "*Entrez votre email",
          firstName: "*Entrez votre prénom",
          lastName: "*Entrez votre nom de famille",
          password: "*Entrez votre mot de passe",
          passwordConfirm: "*Confirmez votre mot de passe",
          phone: "Numéro de téléphone",
        },
        createBtn: "Créer un compte",
      },
      studentDashboard: {
        title: "Tableau de bord",
        menu: "Menu",
        cvs: "CVs",
        myCvs: "Mes CVs",
        addCv: "Ajouter un CV",
        description:
          "Ici tu peux gérer tes CVs : en ajouter un, les visualiser, les télécharger ou les supprimer.",
        noCvs: "Aucun CV pour l’instant",
        table: {
          fileName: "Nom du fichier",
          type: "Type",
          size: "Taille",
          date: "Date",
          actions: "Actions",
        },
        actions: {
          download: "Télécharger",
          preview: "Visualiser",
          delete: "Supprimer",
          close: "Fermer",
        },
        loading: "Chargement...",
        success: {
          uploadCv: "CV {{fileName}} ajouté avec succès",
          downloadCv: "Téléchargement de {{fileName}} réussi",
          deleteCv: "CV supprimé avec succès",
        },
        errors: {
          loadUser: "Impossible de charger l’utilisateur",
          loadCvs: "Erreur lors du chargement des CVs",
          uploadCv: "Erreur lors de l’ajout du CV",
          downloadCv: "Erreur lors du téléchargement du CV",
          deleteCv: "Erreur lors de la suppression du CV",
          previewCv: "Impossible d’afficher le CV",
          unsupportedFormat: "Format non supporté",
        },
      },
    },
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
