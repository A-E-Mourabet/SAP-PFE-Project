sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "project1/controller/utilities/formatter"
], function (Controller,Filter, FilterOperator, formatter) {
    "use strict";

    return Controller.extend("project1.controller.product_view", {
        formatter: formatter,

        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();

            // Retrieve the OData model (implicitly, if set in manifest)
            var oModel = this.getOwnerComponent().getModel();
            console.log("OData Model:", oModel);
            
            // Make sure the model is set to the current view
            this.getView().setModel(oModel);

        },



        onSearch: function (oEvent) {
			var sQuery = oEvent.getSource().getValue(); // get the search text
            var oTable = this.byId("bacsTable");
            var oBinding = oTable.getBinding("items");

            if (sQuery && sQuery.length > 0) {
                var oFilter = new sap.ui.model.Filter("nom_bac", sap.ui.model.FilterOperator.Contains, sQuery);
                oBinding.filter([oFilter]); // apply filter
            } else {
                oBinding.filter([]); // clear filter if query is empty
            }
		},

        onButtonPress: function () {
            console.log("Button was pressed!");
        },

        onListItemPress: function (oEvent) {
            console.log("Item was pressed!");

            // Get the selected list item
            var oSelectedItem = oEvent.getSource();
            console.log(" oSelectedItem:", oSelectedItem);

            
            // Retrieve the binding context directly from the selected item  (tried this _aSelectedPaths)
            var oBindingContext = oSelectedItem.getBindingContext();
            console.log("selected path:", oBindingContext);

            // Ensure the binding context exists
            if (oBindingContext) {
                // Retrieve the path from the binding context
                var sPath = oBindingContext.getPath();
                console.log("Selected item path:", sPath);

                // Assuming the last part of the path contains the bacId
                // var bacId = sPath.split('/').pop(); // Extract bacId from the path
                // console.log("Selected Bac ID:", bacId);
                var bacId = (sPath.split('(').pop()).split(')')[0];
                console.log("Selected Bac ID:", bacId);



                // Navigate to the detail view and pass the bacId as a parameter
                this.oRouter.navTo("detail", {
                    bacId: bacId
                });
            } else {
                console.log("No valid binding context found.");
            }
        }
    });
});
