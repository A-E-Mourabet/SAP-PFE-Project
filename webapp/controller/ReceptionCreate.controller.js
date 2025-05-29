sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("project1.controller.ReceptionCreate", {

        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(this._oModel);
            this._oRouter = this.getOwnerComponent().getRouter();
            this._oRouter.getRoute("ReceptionCreate").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            const sReceptionId = oArgs?.ReceptionId;

            if (sReceptionId) {
                const sPath = this._oModel.createKey("/YRECEPTIONS_CDS", {
                    id_receptions: sReceptionId
                });

                this.getView().bindElement({
                    path: sPath,
                    parameters: { expand: "client" },
                    events: {
                        dataRequested: () => this.getView().setBusy(true),
                        dataReceived: () => this.getView().setBusy(false)
                    }
                });
            } else {
                const oContext = this._oModel.createEntry("/YRECEPTIONS_CDS", {
                    properties: {}
                });
                this.getView().setBindingContext(oContext);
            }
        },

        onSavePress: function () {
            const oView = this.getView();
            const oModel = this._oModel;
            const oContext = oView.getBindingContext();

            var oData = oContext.getObject();
            var client = oView.byId("clientCombo").getSelectedKey();
            var bac = oView.byId("bacCombo").getSelectedKey();
            oData.fournisseurs = parseInt(client, 10);
            oData.bac_de_reception = parseInt(bac, 10);

            // Lire les données du bac pour récupérer le produit lié
            this._oModel.read("/YBACS_CDS(" + bac + ")", {
                success: (oBacData) => {
                    if (oBacData) {
                        oData.produit = parseInt(oBacData.product, 10);

                        // Maintenant créer la réception avec le produit récupéré
                        oModel.create("/YRECEPTIONS_CDS", oData, {
                            success: function () {
                                sap.m.MessageToast.show("Réception enregistrée avec succès.");
                                this._navToList();
                            }.bind(this),
                            error: function (oError) {
                                sap.m.MessageToast.show("Erreur lors de l'enregistrement.");
                                console.error(oError);
                            }
                        });
                    } else {
                        MessageToast.show("Produit introuvable pour ce bac.");
                    }
                },
                error: (oError) => {
                    console.error("Erreur lors de la lecture du bac : ", oError);
                    MessageToast.show("Erreur lors de la récupération du produit.");
                }
            });
        },


        onCancelPress: function () {
            const oContext = this.getView().getBindingContext();
            if (this._oModel.hasPendingChanges()) {
                this._oModel.resetChanges([oContext.getPath()]);
            }
            if (oContext && oContext.bCreated) {
                this._oModel.deleteCreatedEntry(oContext);
            }
            this._navToList();
        },

        onNavBack: function () {
            const sPreviousHash = History.getInstance().getPreviousHash();
            sPreviousHash ? window.history.go(-1) : this._navToList();
        },

        _navToList: function () {
            this._oRouter.navTo("receptions", {}, true);
        },

        _resolveClientIdFromName: function (sNomClient) {
            let sIdClient = null;
            this._oModel.read("/YCLIENTS_CDS", {
                async: false,
                success: function (oData) {
                    const oClient = oData.results.find(c => c.nom_client === sNomClient);
                    if (oClient) {
                        sIdClient = oClient.id_client;
                    }
                },
                error: function () {
                    console.error("Erreur lors de la lecture des clients.");
                }
            });
            return sIdClient;
        },

        _resolveBacIdFromName: function (sNomBac) {
            let sIdBac = null;
            this._oModel.read("/YBACS_CDS", {
                async: false,
                success: function (oData) {
                    const oBac = oData.results.find(b => b.nom_bac === sNomBac);
                    if (oBac) {
                        sIdBac = oBac.id_bacs;
                    }
                },
                error: function () {
                    console.error("Erreur lors de la lecture des bacs.");
                }
            });
            return sIdBac;
        }

    });
});
