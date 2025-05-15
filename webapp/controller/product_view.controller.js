sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "project1/controller/utilities/formatter"
], function (Controller, Filter, FilterOperator, Fragment, formatter) {
    "use strict";

    return Controller.extend("project1.controller.product_view", {
        formatter: formatter,

        onInit: function () {
            var oSmartFilterBar = this.byId("smartFilter");

            oSmartFilterBar.attachInitialise(function () {
                // Force 'nom_bac' filter to appear
                var oNomBac = oSmartFilterBar.getControlByKey("nom_bac");
                if (oNomBac) {
                    oNomBac.setVisible(true);
                }

                // Force 'nom_produit' filter to appear (association field)
                var oNomProduit = oSmartFilterBar.getControlByKey("toproduct_item/nom_produit");
                if (oNomProduit) {
                    oNomProduit.setVisible(true);
                }

                // Optional: pre-fill default filter values
                // oSmartFilterBar.setFilterData({
                //     "nom_bac": "101",
                //     "toproduct_item/nom_produit": "GASOIL"
                // });
            });
        },

        onItemPress: function (oEvent) {
            var oView = this.getView();
            var oContext = oEvent.getSource().getBindingContext();

            if (!oContext) {
                console.warn("No valid binding context found.");
                return;
            }

            var sPath = oContext.getPath(); // e.g., "/YBACS_CDS(123)"
            var bacId = sPath.match(/\((\d+)\)/)[1]; // Extract "123"
            var bacName = oContext.getProperty("nom_bac");

            if (!this._oDetailDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "project1.view.fragments.Detail",
                    controller: this
                }).then(function (oDialog) {
                    this._oDetailDialog = oDialog;
                    oView.addDependent(oDialog);
                    this._filterDialogTable(bacId);
                    this._setDialogTitle(bacName);
                    oDialog.open();
                }.bind(this));
            } else {
                this._filterDialogTable(bacId);
                this._setDialogTitle(bacName);
                this._oDetailDialog.open();
            }
        },

        _filterDialogTable: function (bacId) {
            var oTable = this.byId("ClientsTable");
            if (!oTable) {
                console.warn("Clients table not found in dialog yet.");
                return;
            }

            var oBinding = oTable.getBinding("items");
            var oFilter = new Filter("bac_concerne", FilterOperator.EQ, bacId);

            if (oBinding) {
                oBinding.filter([oFilter]);
            } else {
                setTimeout(function () {
                    var oRetryBinding = oTable.getBinding("items");
                    if (oRetryBinding) {
                        oRetryBinding.filter([oFilter]);
                    }
                }, 100);
            }
        },

        _setDialogTitle: function (bacName) {
            var oTitle = sap.ui.getCore().byId(this.getView().getId() + "--dialogTitle");
            if (oTitle && typeof oTitle.setText === "function") {
                oTitle.setText("Liste des Clients déposant dans le bac \" " + bacName + " \"");
            } else {
                console.warn("Title control not found or invalid.");
            }
        },

        onCloseDialog: function () {
            if (this._oDetailDialog) {
                this._oDetailDialog.close();
            }
        },

        onBeforeRebindTable: function (oEvent) {
            var oSmartTable = oEvent.getSource();
            var oTable = oSmartTable.getTable(); // This is a sap.m.Table in your case
            var oTemplate = oTable.getBindingInfo("items")?.template;

            // Modify the existing template if found
            if (oTemplate && oTemplate.isA("sap.m.ColumnListItem")) {
                var aCells = oTemplate.getCells();

                // Assuming 'stockage' is the second or third field, find by binding path
                aCells.forEach(function (oCell, index) {
                    var oBinding = oCell.getBinding("text");
                    if (oBinding && oBinding.getPath && oBinding.getPath() === "stockage") {
                        aCells[index] = new sap.m.Text({
                            text: {
                                path: "stockage",
                                formatter: formatter.formatNumber
                            }
                        });
                    }
                });

                oTemplate.removeAllCells();
                aCells.forEach(function (oCell) {
                    oTemplate.addCell(oCell);
                });
            }
        }

    });
});
