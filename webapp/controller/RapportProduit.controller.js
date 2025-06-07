sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/odata/v2/ODataModel"
], function (Controller, ODataModel) {
  "use strict";

  return Controller.extend("project1.controller.RapportProduit", {
    onInit: function () {
      // Optionnel : Set default model if not done in manifest
      const oModel = this.getOwnerComponent().getModel();
      this.getView().setModel(oModel);
    }
  });
});
