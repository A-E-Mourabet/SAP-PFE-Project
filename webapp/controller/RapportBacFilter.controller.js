sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("project1.controller.RapportBacFilter", {
    onAfficherRapport: function () {
      const oView = this.getView();
      const oStartDate = oView.byId("idDateStart").getDateValue();
      const oEndDate = oView.byId("idDateEnd").getDateValue();

      if (!oStartDate || !oEndDate) {
        MessageToast.show("Veuillez saisir les deux dates !");
        return;
      }

      const sStartDate = oStartDate.toISOString().split("T")[0]; // yyyy-MM-dd
      const sEndDate = oEndDate.toISOString().split("T")[0];

      // Navigation vers la vue rapport avec paramètres
      this.getOwnerComponent().getRouter().navTo("rapportbac", {
        startDate: sStartDate,
        endDate: sEndDate
      });
    }
  });
});
