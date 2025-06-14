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

      const sStartDate = formatDateLocal(oStartDate).split("T")[0]; // yyyy-MM-dd
      const sEndDate = formatDateLocal(oEndDate).split("T")[0];

      // Navigation vers la vue rapport avec paramètres
      this.getOwnerComponent().getRouter().navTo("rapportbac", {
        startDate: sStartDate,
        endDate: sEndDate
      });
    }
  });

  function formatDateLocal(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // mois de 0 à 11
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
  }

});
