sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "project1/controller/utilities/formatter"
], function (Controller, Filter, FilterOperator ,formatter) {
  "use strict";

  return Controller.extend("project1.controller.Detail", {
    formatter: formatter,
    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
    },

    _onObjectMatched: function (oEvent) {
      var sBacId = parseInt(oEvent.getParameter("arguments").bacId, 10);

      console.log("Selected Bac ID in Detail:", sBacId);

      // Bind the view to the selected Bac
      this.getView().bindElement({
        path: "/YBACS_CDS(" + sBacId + ")"
      });

      // Filter the stock entries for this Bac
      var oTable = this.byId("Clients"); // Make sure this ID matches your table ID in the XML
      if (oTable) {
        var oBinding = oTable.getBinding("items");
        var oFilter = new Filter("bac_concerne", FilterOperator.EQ, sBacId);

        if (oBinding) {
          oBinding.filter([oFilter]);
        } else {
          // Retry binding after slight delay if it’s not yet available
          setTimeout(() => {
            var oBindingRetry = oTable.getBinding("items");
            if (oBindingRetry) {
              oBindingRetry.filter([oFilter]);
            }
          }, 100);
        }
      }
    },

    onNavBack: function () {
      var oHistory = sap.ui.core.routing.History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("", {}, true);
      }
    }

  });
});
