import express from "express";

const app = express();
const PORT = process.env.MOCK_PORT || 3000;

// Exemple de réponse mockée
const mockResponse = {
    response: {
        data: {
            dtNextBox: "2024-02-01",
            dtTillMax: "2024-03-31",
            warehouseList: [
                {
                    boxDeliveryBase: "1248",
                    boxDeliveryCoefExpr: "160",
                    boxDeliveryLiter: "11,2",
                    boxDeliveryMarketplaceBase: "40",
                    boxDeliveryMarketplaceCoefExpr: "125",
                    boxDeliveryMarketplaceLiter: "11",
                    boxStorageBase: "0,14",
                    boxStorageCoefExpr: "115",
                    boxStorageLiter: "0,07",
                    geoName: "Центральный федеральный округ",
                    warehouseName: "Коледино",
                },
                {
                    boxDeliveryBase: "48",
                    boxDeliveryCoefExpr: "160",
                    boxDeliveryLiter: "11,2",
                    boxDeliveryMarketplaceBase: "40",
                    boxDeliveryMarketplaceCoefExpr: "125",
                    boxDeliveryMarketplaceLiter: "11",
                    boxStorageBase: "0,14",
                    boxStorageCoefExpr: "115",
                    boxStorageLiter: "0,07",
                    geoName: "Центральный федеральный округ",
                    warehouseName: "Коледино",
                },
            ],
        },
    },
};

// Endpoint mocké
app.get("/api/v1/tariffs/box", (req, res) => {
    res.json(mockResponse);
});

app.listen(PORT, () => {
    console.log(`🚀 Mock WB API running at http://localhost:${PORT}`);
});
