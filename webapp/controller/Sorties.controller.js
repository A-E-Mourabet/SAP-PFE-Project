sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "project1/controller/utilities/formatter"
], function (Controller, Filter, FilterOperator, Fragment, MessageToast, MessageBox, JSONModel, formatter) {
    "use strict";

    return Controller.extend("project1.controller.Sorties", {
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

        onCreateSortiePress: function () {
            this.oRouter.navTo("SortieCreate");
        },

        onRowPress: function (oEvent) {
            const oView = this.getView();
            const oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            const oContext = oItem.getBindingContext();

            if (!oContext) return;

            const sPath = oContext.getPath();

            if (!this._oSortieDetailsDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "project1.view.fragments.SortieDetails",
                    controller: this
                }).then(function (oDialog) {
                    this._oSortieDetailsDialog = oDialog;
                    oView.addDependent(oDialog);
                    oDialog.setBindingContext(oContext);
                    oDialog.setModel(oView.getModel());
                    oDialog.open();
                }.bind(this));
            } else {
                this._oSortieDetailsDialog.setBindingContext(oContext);
                this._oSortieDetailsDialog.setModel(oView.getModel());
                this._oSortieDetailsDialog.open();
            }
        },

        onCloseDialog: function () {
            if (this._oSortieDetailsDialog) {
                this._oSortieDetailsDialog.close();
            }
        },

        onEditLastSortie: function () {
            const oModel = this.getView().getModel();
            const that = this;

            oModel.read("/YSORTIES_CDS", {
                urlParameters: {
                    "$orderby": "id_sortie desc",
                    "$top": 1
                },
                success: async function (oData) {
                    if (oData.results.length) {
                        const oLastSortie = oData.results[0];
                        const sPath = oModel.createKey("/YSORTIES_CDS", {
                            id_sortie: oLastSortie.id_sortie
                        });

                        if (!that._oEditDialog) {
                            that._oEditDialog = await Fragment.load({
                                name: "project1.view.fragments.EditSortieDialog",
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
                        MessageToast.show("Aucune Sortie trouvée.");
                    }
                },
                error: function () {
                    MessageToast.show("Erreur lors de la récupération des données.");
                }
            });
        },

        onSaveEditSortie: async function () {
            const oDialog = this._oEditDialog; // Doit pointer vers le fragment `editSortieDialog`
            const oModel = this.getView().getModel();
            const oContext = oDialog?.getBindingContext();

            if (!oDialog || !oModel || !oContext) return;

            const sPath = oContext.getPath();
            let oData = Object.assign({}, oContext.getObject());

            // Charger produit depuis le bac sélectionné
            try {
                const oBacData = await this._readBacProduct(oData.bac_source, oModel);
                if (oBacData) {
                    oData.produits = parseInt(oBacData.product, 10);
                } else {
                    MessageToast.show("Produit introuvable pour ce bac.");
                    return;
                }
            } catch (e) {
                console.error("Erreur lors de la récupération du produit :", e);
                MessageToast.show("Erreur lors de la récupération du produit.");
                return;
            }

            // Nettoyage des champs non persistants (venant de CDS associations)
            delete oData.ClientNom;
            delete oData.BacNom;
            delete oData.ProduitNom;
            delete oData.id_sortie;
            // delete oData.id_clients;
            // delete oData.BacId;
            // delete oData.ClientId;
            // delete oData.ProdId;
            // delete oData.ProduitID;

            // Forcer types pour les clés étrangères
            oData.bac_source = parseInt(oData.bac_source, 10);
            oData.marketer = parseInt(oData.marketer, 10);

            // Envoi de la mise à jour OData
            oModel.update(sPath, oData, {
                success: () => {
                    MessageToast.show("Sortie mise à jour avec succès.");
                    oDialog.close();
                },
                error: (oError) => {
                    console.error("→ Erreur lors de la mise à jour :", oError);
                    MessageBox.error("Erreur lors de la mise à jour de la sortie.");
                },
                merge: false
            });

            this.dumpModelData(sPath); // À garder si utile pour debug
        },


        _readBacProduct: function (bacId, oModel) {
            return new Promise(function (resolve, reject) {
                oModel.read("/YBACS_CDS(" + bacId + ")", {
                    success: resolve,
                    error: reject
                });
            });
        },

        onCancelEditSortie: function () {
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
