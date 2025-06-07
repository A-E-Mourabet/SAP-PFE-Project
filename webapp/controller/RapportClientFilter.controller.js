sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("project1.controller.RapportClientFilter", {
    onAfficherRapport: function () {
      const oView = this.getView();
      const oStartDate = oView.byId("idDateStartC").getDateValue();
      const oEndDate = oView.byId("idDateEndC").getDateValue();

      if (!oStartDate || !oEndDate) {
        MessageToast.show("Veuillez saisir les deux dates !");
        return;
      }

      const sStartDate = formatDateLocal(oStartDate).split("T")[0]; // yyyy-MM-dd
      const sEndDate = formatDateLocal(oEndDate).split("T")[0];

      console.log("Start Date:", sStartDate);
      console.log("End Date:", sEndDate);
      // Navigation vers la vue rapport avec paramètres
      this.getOwnerComponent().getRouter().navTo("rapportclient", {
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
