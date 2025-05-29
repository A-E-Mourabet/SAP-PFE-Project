sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "project1/controller/utilities/formatter"
], function (Controller, Filter, FilterOperator, Fragment, MessageToast, MessageBox,JSONModel, formatter) {
    "use strict";

    return Controller.extend("project1.controller.Jaugeage", {
        formatter: formatter,

        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            var oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel);
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getSource().getValue();
            var oTable = this.byId("bacsTable");
            var oBinding = oTable.getBinding("items");

            if (sQuery) {
                var oFilter = new Filter("NomBac", FilterOperator.Contains, sQuery);
                oBinding.filter([oFilter]);
            } else {
                oBinding.filter([]);
            }
        },

        // onListItemPress: function (oEvent) {
        //     var oContext = oEvent.getSource().getBindingContext();
        //     var sPath = oContext.getPath();
        //     var match = sPath.match(/\((\d+)\)/);
        //     var bacId = match ? match[1] : null;

        //     if (bacId) {
        //         this.oRouter.navTo("detail", { bacId: bacId });
        //     }
        // },

        onCreateJaugeagePress: function () {
            console.log("onCreateJaugeagePress called");
            this.oRouter.navTo("JaugeageCreate");
        },

        onRowPress: function (oEvent) {
            const oView = this.getView();
            const oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            const oContext = oItem.getBindingContext();

            if (!oContext) return;

            const sPath = oContext.getPath();

            if (!this._oReceptionDetailsDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "project1.view.fragments.JaugeageDetails",
                    controller: this
                }).then(function (oDialog) {
                    this._oReceptionDetailsDialog = oDialog;
                    oView.addDependent(oDialog);
                    oDialog.setBindingContext(oContext);
                    oDialog.setModel(oView.getModel());
                    oDialog.open();
                }.bind(this));
            } else {
                this._oReceptionDetailsDialog.setBindingContext(oContext);
                this._oReceptionDetailsDialog.setModel(oView.getModel());
                this._oReceptionDetailsDialog.open();
            }
        },

        onCloseDialog: function () {
            if (this._oReceptionDetailsDialog) {
                this._oReceptionDetailsDialog.close();
            }
        },

        onEditLastJaugeage: function () {////////////////////////////////////////////////////////////// 
            const oModel = this.getView().getModel();
            const that = this;

            oModel.read("/YJAUGEAGE_CDS", {
                urlParameters: {
                    "$orderby": "id_jaugeage desc",
                    "$top": 1
                },
                success: async function (oData) {
                    if (oData.results.length) {
                        const oLastReception = oData.results[0];
                        const sPath = oModel.createKey("/YJAUGEAGE_CDS", {
                            id_jaugeage: oLastReception.id_jaugeage
                        });

                        if (!that._oEditDialog) {
                            that._oEditDialog = await Fragment.load({
                                name: "project1.view.fragments.EditJaugeageDialog",
                                id: that.getView().getId(),
                                controller: that
                            });
                            that.getView().addDependent(that._oEditDialog);
                        }

                        that._oEditDialog.unbindElement();
                        that._oEditDialog.setModel(oModel);
                        that._oEditDialog.bindElement({ path: sPath });

                        that._oEditDialog.attachAfterOpen(function oAfterOpen() {
                            that._logDialogBindingData();
                            that._checkDialogControls();
                            that._oEditDialog.detachAfterOpen(oAfterOpen);
                        });

                        that._oEditDialog.open();
                    } else {
                        MessageToast.show("Aucun jaugeage trouvé.");
                    }
                },
                error: function () {
                    MessageToast.show("Erreur lors de la récupération des données.");
                }
            });
        },

        onSaveEditJaugeage: async function () { ///////////////////////////////////////////////////////////////
            const oDialog = this._oEditDialog;
            const oModel = this.getView().getModel();
            const oContext = oDialog.getBindingContext();

            if (!oDialog || !oModel || !oContext) return;

            const sPath = oContext.getPath();
            let oData = Object.assign({}, oContext.getObject());
            console.log("→ oData:", oData);
            oModel.update(sPath, oData, {
                success: () => {
                    MessageToast.show("Jaugeage mise à jour avec succès.");
                    oDialog.close();
                },
                error: (oError) => {
                    console.error("→ Error during update:", oError);
                    MessageBox.error("Erreur lors de la mise à jour du jaugeage.");
                },
                merge: false
            });

            this.dumpModelData(sPath);
        },

        _readBacProduct: function (bacId, oModel) {
            return new Promise(function (resolve, reject) {
                oModel.read("/YBACS_CDS(" + bacId + ")", {
                    success: resolve,
                    error: reject
                });
            });
        },

        onCancelEditReception: function () {
            const oModel = this.getView().getModel();
            const oDialog = this._oEditDialog;
            const oContext = oDialog ? oDialog.getBindingContext() : null;

            if (oContext) {
                oModel.resetChanges([oContext.getPath()]);
            }

            if (oDialog) {
                oDialog.close();
            }
        },

        dumpModelData: function (sPath) {
            const oModel = this.getView().getModel();
            const oData = oModel.getProperty(sPath);
            console.log("→ dumpModelData:", oData);
        },

        _logDialogBindingData: function () {
            if (!this._oEditDialog) return;
            const oContext = this._oEditDialog.getBindingContext();
            if (oContext) {
                console.log("→ Dialog binding data:", oContext.getObject());
            }
        },

    });
});
