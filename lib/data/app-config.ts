import { prisma } from "@/lib/prisma";

const APP_CONFIG_ID = 1;

export async function getAppConfig() {
  return prisma.appConfig.upsert({
    where: { id: APP_CONFIG_ID },
    update: {},
    create: { id: APP_CONFIG_ID },
  });
}

export async function resetCurrentPeriod() {
  return prisma.appConfig.upsert({
    where: { id: APP_CONFIG_ID },
    update: { currentPeriodStart: new Date() },
    create: { id: APP_CONFIG_ID, currentPeriodStart: new Date() },
  });
}
