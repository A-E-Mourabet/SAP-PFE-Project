sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("project1.controller.RapportBacFilter", {
    onAfficherRapport: function () {
      const oView = this.getView();
      const sStartDate = oView.byId("idDateStart").getValue();
      const sEndDate = oView.byId("idDateEnd").getValue();

      if (!sStartDate || !sEndDate) {
        MessageToast.show("Veuillez saisir les deux dates !");
        return;
      }

      // Navigation vers la vue rapport avec les paramètres dates
      this.getOwnerComponent().getRouter().navTo("rapportbac", {
        startDate: sStartDate,
        endDate: sEndDate
      });
    }
  });
});
