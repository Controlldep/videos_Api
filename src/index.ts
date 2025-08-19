import express from "express";
import { setupApp } from "./setup-app";

export const app = express();
setupApp(app);

// Используем порт из переменных окружения (Render сам его задаёт), иначе 5007
const PORT = process.env.PORT || 5007;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});

export default app;