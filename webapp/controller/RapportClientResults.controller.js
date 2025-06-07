sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {
    "use strict";

    return Controller.extend("project1.controller.RapportClientResults", {
        onInit: function () {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            console.log("oRouter:", oRouter);
            oRouter.getRoute("rapportclient").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var startDate = oEvent.getParameter("arguments").startDate;
            var endDate = oEvent.getParameter("arguments").endDate;

            if (!startDate || !endDate) {
                console.error("Les dates ne sont pas spécifiées !");
                return;
            }

             // Store the dates for later use
            this._startDate = startDate;
            this._endDate = endDate;

            const oSmartTable = this.byId("smartTableRapportClient");

            // Attach to initialise event
            oSmartTable.attachInitialise(() => {
                oSmartTable.rebindTable();
            });

            
        },

      onBeforeRebindTable: function (oEvent) {
    const oBindingParams = oEvent.getParameter("bindingParams");

    // Get the date range stored in your controller (make sure _startDate and _endDate are set beforehand)
    const startDate = this._startDate; // should be a JS Date or ISO string
    const endDate = this._endDate;

    if (!startDate || !endDate) {
        console.warn("Start or end date not available yet.");
        return;
    }

    // Convert to ABAP datetime format 'yyyy-mm-ddT00:00:00'
    const sStart = new Date(startDate).toISOString().split("T")[0]; // YYYY-MM-DD
    const sEnd = new Date(endDate).toISOString().split("T")[0];

    // Construct the binding path
    const sPath = `/YPG_CLIENT_CDS(p_start=datetime'${sStart}T00:00:00',p_end=datetime'${sEnd}T00:00:00')/Set`;

    // Apply the path manually to the SmartTable
    const oSmartTable = this.getView().byId("smartTableRapportClient");
    oSmartTable.setTableBindingPath(sPath);

    console.log("SmartTable path set to:", sPath);
}



    });
    
});
