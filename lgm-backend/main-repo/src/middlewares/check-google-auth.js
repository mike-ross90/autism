import { OAuth2Client } from "google-auth-library";

// export const check_google_auth = async (req, res) => {
//     const authHeader = req.headers["authorization"];
//     if (!authHeader) {
//         res.status(403).json({ error: "Authorization header not found" });
//         return;
//     }

//     const token = authHeader.replace("Bearer ", "");

//     try {
//         console.log("1");
//         const GOOGLE_CLIENT_ID = "789004538551-dr6rq266fqjkb679csusc599e2dd8gcg.apps.googleusercontent.com"
//         if (!GOOGLE_CLIENT_ID) {
//             res.status(500).json({ error: "Google client id is not provided" });
//             return;
//         }
//         const client = new OAuth2Client(GOOGLE_CLIENT_ID);
//         console.log("2");
//         const googleResponse = await client.verifyIdToken({
//             idToken: token,
//             audience: GOOGLE_CLIENT_ID,
//         });

//         console.log(googleResponse, 'google response()')
//         console.log("3");
//         const data = googleResponse.getPayload();

//         if (!data.aud && data.error) {
//             res.status(500).json({ error: data.error.message });
//             return;
//         }
//         const name = data.name;
//         const imageUrl = data.picture;
//         const email = data.sub;
//         res.status(200).json({ name, imageUrl, email });
//     } catch (err) {
//         console.error("Error occurred:", err);
//         if (err.message) {
//             res.status(500).json({ error: err.message });
//         } else {
//             res.status(500).json({ error: "Internal server error" });
//         }
//     }
// };

export const check_google_auth = async (req, res) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        res.status(403).json({ error: "Authorization header not found" });
        return;
    }

    const token = authHeader.replace("Bearer ", "");

    try {
        const tokenSections = token.split('.');
        const payload = JSON.parse(Buffer.from(tokenSections[1], 'base64').toString('utf8'));

        const name = payload.name;
        const imageUrl = payload.picture;
        const email = payload.sub;

        res.status(200).json({ name, imageUrl, email });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ error: err.message });
    }
};
