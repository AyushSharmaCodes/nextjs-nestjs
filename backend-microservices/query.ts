import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('QueryScript');

async function main() {
  const users = await prisma.user.findMany();
  logger.log(JSON.stringify(users, null, 2));
}

main().catch(e => logger.error(e)).finally(() => prisma.$disconnect());
