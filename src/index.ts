require('dotenv').config();
const { createBullBoard, IServerAdapter } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { Queue: QueueMQ, Worker: WorkerMQ, QueueScheduler } = require('bullmq');
const express = require('express');

const redisOptions = {
  host: process.env.REDISHOST,
  port: process.env.REDISPORT,
  username: process.env.REDISUSER,
  password: process.env.REDISPASSWORD,
  tls: false,
};

const createQueueMQ = (name) => new QueueMQ(name, { connection: redisOptions });

const run = async () => {
  const priceBullMq = createQueueMQ('PriceQueue');

  // await setupBullMQProcessor(priceBullMq.name);

  const app = express();
  // Configure view engine to render EJS templates.
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');

  const serverAdapter1 = new ExpressAdapter();

  createBullBoard({
    queues: [new BullMQAdapter(priceBullMq)],
    serverAdapter: serverAdapter1,
  });

  serverAdapter1.setBasePath('/instance1');

  app.use('/instance1', serverAdapter1.getRouter());

  app.use('/add', (req, res) => {
    const opts = req.query.opts || {};

    if (opts.delay) {
      opts.delay = +opts.delay * 1000; // delay must be a number
    }

    priceBullMq.add('Add instance 1', { title: req.query.title }, opts);

    res.json({
      ok: true,
    });
  });

  app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log('Running on 3000...');
  //   // console.log(
  //   //   'For the UI of instance1, open http://localhost:3000/instance1'
  //   // );
  //   // console.log(
  //   //   'For the UI of instance2, open http://localhost:3000/instance2'
  //   // );
  //   // console.log('Make sure Redis is running on port 6379 by default');
  //   // console.log('To populate the queue, run:');
  //   // console.log('  curl http://localhost:3000/add?title=Example');
  //   // console.log('To populate the queue with custom options (opts), run:');
  //   // console.log('  curl http://localhost:3000/add?title=Test&opts[delay]=9');
  // });
// };

// eslint-disable-next-line no-console
run().catch((e) => console.error(e));
