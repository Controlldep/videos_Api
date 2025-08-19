import express from "express";
import { setupApp } from "./setup-app";

export const app = express();
setupApp(app);

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
    });
}
export default app;