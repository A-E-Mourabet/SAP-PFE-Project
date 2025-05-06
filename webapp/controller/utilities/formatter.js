sap.ui.define(["sap/ui/core/format/NumberFormat"], function(NumberFormat) {
    "use strict";

    return {
        formatNumber: function(value) {
            if (value == null) return "";

            // If the value is an integer (no decimal part), show it without decimals
            if (parseFloat(value) === parseInt(value)) {
                return NumberFormat.getIntegerInstance({
                    groupingEnabled: true
                }).format(value);
            }

            // Else format with max 8 decimals and group thousands
            var oNumberFormat = NumberFormat.getFloatInstance({
                maxFractionDigits: 8,
                minFractionDigits: 0,
                groupingEnabled: true // Enable thousand grouping
            });

            return oNumberFormat.format(value);
        }
    };
});
