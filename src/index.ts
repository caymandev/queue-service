import { createBullBoard } from '@bull-board/api';
import { Queue } from 'bullmq';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { env } from './env';

import { setupQueueProcessor } from './queue';

const connection = {
  host: env.REDISHOST,
  port: env.REDISPORT ? parseInt(env.REDISPORT) : 6379,
  username: env.REDISUSER,
  password: env.REDISPASSWORD,
};

const run = async () => {
  const priceQueue = new Queue('PriceQueue', {
    connection,
  });
  await setupQueueProcessor(priceQueue.name);

  createBullBoard({
    queues: [new BullMQAdapter(priceQueue)],
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
