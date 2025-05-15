sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("project1.controller.ReceptionCreate", {

        onInit: function () {
                    var oModel = this.getOwnerComponent().getModel();

            if (!oModel) {
                console.error("OData model not found on the component.");
                return;
            }

            // Set the model explicitly on the view, in case it’s missing
            this.getView().setModel(oModel);
            console.log('modelo :' , oModel);
            // Create draft context for new reception
            var oContext = oModel.createEntry("/YRECEPTIONS_CDS");
            this.getView().setBindingContext(oContext);
            console.log('contexto :' , oContext);

        },

        onSaveReception: function () {
            var oModel = this.getView().getModel();

            oModel.submitChanges({
                success: function () {
                    sap.m.MessageToast.show("Réception enregistrée avec succès !");
                },
                error: function () {
                    sap.m.MessageToast.show("Erreur lors de l'enregistrement.");
                }
            });
        }
    });
});
