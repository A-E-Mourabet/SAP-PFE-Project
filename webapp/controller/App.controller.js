sap.ui.define([
    "./BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("project1.controller.App", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            const hash = window.location.hash.toLowerCase(); // plus sûr

            // Extraction de l'intent depuis le hash
            if (hash.includes("project1-")) {
                const intent = hash.split("project1-")[1].split("?")[0]; // ex: "product", "copy", etc.

                switch (intent) {
                    case "product":
                        oRouter.navTo("product");
                        break;
                    case "copy":
                        oRouter.navTo("copy");
                        break;
                    case "etatbacs":
                        oRouter.navTo("etatbacs");
                        break;
                    case "receptions":
                        oRouter.navTo("receptions");
                        break;
                    case "sorties":
                        oRouter.navTo("sorties");
                        break;
                    case "transferts":
                        oRouter.navTo("transferts");
                        break;
                    case "jaugeage":
                        oRouter.navTo("jaugeage");
                        break;
                    case "rapportbac":
                        oRouter.navTo("rapportbac");
                        break;
                    case "rapportgl":
                        oRouter.navTo("rapportgl");
                        break;
                    case "rapportclients":
                        oRouter.navTo("rapportclients");
                        break;
                    default:
                        console.warn("Intent non reconnu :", intent);
                        oRouter.navTo("notFound"); // ou une page par défaut
                }
            }
        }
    });
});

