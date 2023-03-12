import { createBullBoard } from '@bull-board/api';
import { Queue } from 'bullmq';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { env } from './env';

import { createQueue, setupQueueProcessor } from './queue';

// interface AddJobQueryString {
//   id: string;
//   email: string;
// }

const connection = {
  host: env.REDISHOST,
  port: env.REDISPORT,
  username: env.REDISUSER,
  password: env.REDISPASSWORD,
};

const run = async () => {
  //   const priceQueue = createQueue('PriceQueue');
  const priceQueue = new Queue('PriceQueue', {
    connection,
  });
  await setupQueueProcessor(priceQueue.name);

  // const server: FastifyInstance<
  //   Server,
  //   IncomingMessage,
  //   ServerResponse
  // > = fastify();

  // const serverAdapter = new FastifyAdapter();
  createBullBoard({
    queues: [new BullMQAdapter(priceQueue)],
    //     serverAdapter,
  });
  //   serverAdapter.setBasePath('/');
  //   server.register(serverAdapter.registerPlugin(), {
  //     prefix: '/',
  //     basePath: '/',
  //   });

  //   server.get(
  //     '/add-job',
  //     {
  //       schema: {
  //         querystring: {
  //           type: 'object',
  //           properties: {
  //             title: { type: 'string' },
  //             id: { type: 'string' },
  //           },
  //         },
  //       },
  //     },
  //     (req: FastifyRequest<{ Querystring: AddJobQueryString }>, reply) => {
  //       if (
  //         req.query == null ||
  //         req.query.email == null ||
  //         req.query.id == null
  //       ) {
  //         reply
  //           .status(400)
  //           .send({ error: 'Requests must contain both an id and a email' });

  //         return;
  //       }

  //       const { email, id } = req.query;
  //       priceQueue.add(`price-${id}`, { email });

  //       reply.send({
  //         ok: true,
  //       });
  //     }
  //   );

  // await server.listen({ port: env.PORT, host: '0.0.0.0' });
  // console.log(
  //   `To populate the queue and demo the UI, run: curl https://${env.RAILWAY_STATIC_URL}/add-job?id=1&email=hello%40world.com`
  // );
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
