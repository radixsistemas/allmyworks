import express from "express";
import cors from "cors";
import helmet from "helmet";
import { corsOrigins } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { projetosRouter } from "./modules/projetos/projetos.routes";
import { tiposTrabalhoRouter } from "./modules/tipos-trabalho/tipos-trabalho.routes";
import { regrasRemuneracaoRouter } from "./modules/regras-remuneracao/regras-remuneracao.routes";
import { lancamentosRouter } from "./modules/lancamentos/lancamentos.routes";
import { fechamentosRouter } from "./modules/fechamentos/fechamentos.routes";
import { relatoriosRouter } from "./modules/relatorios/relatorios.routes";
import { configuracaoRouter } from "./modules/configuracao/configuracao.routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/projetos", projetosRouter);
app.use("/api/tipos-trabalho", tiposTrabalhoRouter);
app.use("/api/regras-remuneracao", regrasRemuneracaoRouter);
app.use("/api/lancamentos", lancamentosRouter);
app.use("/api/fechamentos", fechamentosRouter);
app.use("/api/relatorios", relatoriosRouter);
app.use("/api/configuracao", configuracaoRouter);

app.use(notFoundHandler);
app.use(errorHandler);
