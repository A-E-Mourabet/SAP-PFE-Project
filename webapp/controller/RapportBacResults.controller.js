sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("project1.controller.RapportBacResults", {
    onInit: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("rapportbac").attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function (oEvent) {
  const oArgs = oEvent.getParameter("arguments");
  const sStartDate = oArgs.startDate;
  const sEndDate = oArgs.endDate;

  const oSmartFilterBar = this.byId("smartFilterBar");

  // Attendre que la SmartFilterBar soit complètement initialisée
  oSmartFilterBar.initialise().then(() => {
    // Injecter les valeurs dans les filtres
    oSmartFilterBar.setFilterData({
      p_start_date: new Date(sStartDate),
      p_end_date: new Date(sEndDate)
    });

    // Lancer la recherche une fois les données définies
    oSmartFilterBar.search();
  });
}

  });
});
