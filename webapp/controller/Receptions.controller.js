sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "project1/controller/utilities/formatter"
], function (Controller, Filter, FilterOperator, Fragment, MessageToast, MessageBox, formatter) {
    "use strict";

    return Controller.extend("project1.controller.Receptions", {
        formatter: formatter,

        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            const oModel = this.getOwnerComponent().getModel();
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

        onListItemPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sPath = oContext.getPath();
            var match = sPath.match(/\((\d+)\)/);
            var bacId = match ? match[1] : null;

            if (bacId) {
                this.oRouter.navTo("detail", { bacId: bacId });
            }
        },

        onCreateReceptionPress: function () {
            this.oRouter.navTo("ReceptionCreate");
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
                    name: "project1.view.fragments.ReceptionDetails",
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

        onEditLastReception: async function () {
            const oModel = this.getView().getModel();
            const that = this;

            oModel.read("/YRECEPTIONS_CDS", {
                urlParameters: {
                    "$orderby": "id_receptions desc",
                    "$top": 1
                },
                success: async function (oData) {
                    if (oData.results.length) {
                        const oLastReception = oData.results[0];
                        const sPath = oModel.createKey("/YRECEPTIONS_CDS", {
                            id_receptions: oLastReception.id_receptions
                        });

                        if (!that._oEditDialog) {
                            that._oEditDialog = await Fragment.load({
                                name: "project1.view.fragments.EditReceptionDialog",
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
                        MessageToast.show("Aucune réception trouvée.");
                    }
                },
                error: function () {
                    MessageToast.show("Erreur lors de la récupération des données.");
                }
            });
        },

        onSaveEditReception: async function () {
            const oDialog = this._oEditDialog;
            const oModel = this.getView().getModel();
            const oContext = oDialog.getBindingContext();

            if (!oDialog || !oModel || !oContext) return;

            const sPath = oContext.getPath();
            let oData = Object.assign({}, oContext.getObject());

            // Charger produit depuis le bac
            try {
                const oBacData = await this._readBacProduct(oData.bac_de_reception, oModel);
                if (oBacData) {
                    oData.produit = parseInt(oBacData.product, 10);
                } else {
                    MessageToast.show("Produit introuvable pour ce bac.");
                    return;
                }
            } catch (e) {
                MessageToast.show("Erreur lors de la récupération du produit.");
                return;
            }

            // Nettoyage des champs non persistants
            delete oData.ClientNom;
            delete oData.BacNom;
            delete oData.ProduitNom;
            delete oData.id_receptions;
            delete oData.id_bacs;
            delete oData.id_clients;
            delete oData.BacId;
            delete oData.ClientId;
            delete oData.ProdId;
            delete oData.ProduitID;

            // Forcer types
            oData.fournisseurs = parseInt(oData.fournisseurs, 10);
            oData.bac_de_reception = parseInt(oData.bac_de_reception, 10);

            oModel.update(sPath, oData, {
                success: () => {
                    MessageToast.show("Réception mise à jour avec succès.");
                    oDialog.close();
                },
                error: (oError) => {
                    console.error("→ Error during update:", oError);
                    MessageBox.error("Erreur lors de la mise à jour de la réception.");
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

        _checkDialogControls: function () {
            // Tu peux vérifier ici les contrôles du fragment si besoin
        }
    });
});
