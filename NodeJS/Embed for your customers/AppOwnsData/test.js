const express = require("express");
const cors = require("cors");
const msal = require("@azure/msal-node");
const axios = require("axios");
let path = require('path');

const app = express();
app.use(cors());
const PORT = 3001;

// Thông tin từ Azure AD
const config = {
  auth: {
    clientId: "d20ac8d4-bc3d-41f5-a036-0ccea2d63bad",
    authority: "https://login.microsoftonline.com/16f5375c-95a9-43f0-ba2c-e20bd5ec2845",
    clientSecret: "TrC8Q~OSf4w5V2CEZ6n4~aHQz13MMSntTUZzMbua"
  }
};
const cca = new msal.ConfidentialClientApplication(config);


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get("/api/powerbi-token", async (req, res) => {
  try {
    const result = await cca.acquireTokenByClientCredential({
      scopes: ["https://analysis.windows.net/powerbi/api/.default"]
    });

    const token = result.accessToken;

    const embedRes = await axios.post(
      "https://api.powerbi.com/v1.0/myorg/groups/6073f2e0-50dc-4ffb-8f4d-2221b05ada13/reports/ee94f271-1819-49e4-a150-de0c43c2ae2e/GenerateToken",
      { accessLevel: "view" },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log("Embed Token:", {
        embedToken: embedRes.data.token,
        embedUrl: `https://app.powerbi.com/reportEmbed?reportId=ee94f271-1819-49e4-a150-de0c43c2ae2e&groupId=6073f2e0-50dc-4ffb-8f4d-2221b05ada13`
    }); 

    res.json({
      embedToken: embedRes.data.token,
      embedUrl: `https://app.powerbi.com/reportEmbed?reportId=ee94f271-1819-49e4-a150-de0c43c2ae2e&groupId=6073f2e0-50dc-4ffb-8f4d-2221b05ada13`
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating Power BI token");
  }
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
