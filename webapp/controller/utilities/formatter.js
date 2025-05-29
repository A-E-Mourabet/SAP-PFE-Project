sap.ui.define(["sap/ui/core/format/NumberFormat"], function(NumberFormat) {
    "use strict";

    return {
        formatNumber: function(value) {
            if (value == null || value === "") return "";

            // Normalize the value first
            const normalized = parseFloat(value);

            // If it's an integer, just return formatted as integer
            if (Number.isInteger(normalized)) {
                return NumberFormat.getIntegerInstance({
                    groupingEnabled: true
                }).format(normalized);
            }

            // Format as float, trimming unnecessary trailing zeros
            return NumberFormat.getFloatInstance({
                minFractionDigits: 0,
                maxFractionDigits: 8,
                groupingEnabled: true
            }).format(normalized);
        },

        formatDate: function(date) {
            if (!date) {
                return "";
            }
            // Assuming `date` is a JS Date object or ISO string
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd/MM/yyyy" // or your preferred format
            });
            return oDateFormat.format(new Date(date));
        }
    };
});
