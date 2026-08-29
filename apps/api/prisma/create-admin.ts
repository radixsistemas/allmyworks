import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEMP_PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function generateTemporaryPassword(length = 12): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += TEMP_PASSWORD_CHARS[Math.floor(Math.random() * TEMP_PASSWORD_CHARS.length)];
  }
  return result;
}

async function main() {
  const nome = process.argv[2];
  const email = process.argv[3];

  if (!nome || !email) {
    console.error('Uso: npm run create-admin -w apps/api -- "Nome Completo" email@dominio.com');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`Já existe um usuário com o e-mail ${email}.`);
    process.exit(1);
  }

  const senhaTemporaria = generateTemporaryPassword();
  const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

  const user = await prisma.user.create({
    data: {
      nome,
      email,
      senhaHash,
      papel: "ADMIN",
      status: "ATIVO",
      senhaTemporaria: true,
    },
  });

  console.log("Administrador criado com sucesso:");
  console.log(`  Nome: ${user.nome}`);
  console.log(`  E-mail: ${user.email}`);
  console.log(`  Senha temporária: ${senhaTemporaria}`);
  console.log("Troque essa senha no primeiro acesso ao sistema.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
