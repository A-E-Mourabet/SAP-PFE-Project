sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/Device", "./model/models"], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("project1.Component", {
		metadata: {
			manifest: "json",
			interfaces: ["sap.ui.core.IAsyncContentCreation"]
		},
		init: function () {
            // Appel du constructeur parent
            UIComponent.prototype.init.apply(this, arguments);

            this.getRouter().initialize();

            // Initialisation du modèle de device
            this.setModel(models.createDeviceModel(), "device");

            // // Gestion de la navigation selon l’intent
            // const oStartupParameters = this.getComponentData()?.startupParameters;
            // const action = oStartupParameters?.action?.[0]; // ex: "etatbacs", "receptions", etc.

            // const oRouter = this.getRouter();

            // if (action) {
            //     switch (action) {
            //         case "etatbacs":
            //             oRouter.navTo("etatbacs");
            //             break;
            //         case "receptions":
            //             oRouter.navTo("receptions");
            //             break;
            //         case "sorties":
            //             oRouter.navTo("sorties");
            //             break;
            //         case "transferts":
            //             oRouter.navTo("transferts");
            //             break;
            //         case "jaugeage":
            //             oRouter.navTo("jaugeage");
            //             break;
            //         case "rapportbac":
            //             oRouter.navTo("rapportbac");
            //             break;
            //         case "rapportgl":
            //             oRouter.navTo("rapportgl");
            //             break;
            //         case "rapportclients":
            //             oRouter.navTo("rapportclients");
            //             break;
            //         default:
            //             oRouter.navTo("notFound"); // ou une vue par défaut
            //             break;
            //     }
            // }
        },
		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @returns {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function () {
			if (this.contentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
					this.contentDensityClass = "";
				} else if (!Device.support.touch) {
					// apply "compact" mode if touch is not supported
					this.contentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this.contentDensityClass = "sapUiSizeCozy";
				}
			}
			return this.contentDensityClass;
		}
	});
});
