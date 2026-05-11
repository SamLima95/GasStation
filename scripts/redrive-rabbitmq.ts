import amqp, { type GetMessage } from "amqplib";
import {
  QUEUE_AUDIT_LOGGED,
  QUEUE_AUDIT_LOGGED_FAILED,
  QUEUE_ORDER_CONFIRMED_FINANCIAL,
  QUEUE_ORDER_CONFIRMED_FINANCIAL_FAILED,
  QUEUE_ORDER_CONFIRMED_LOGISTICS,
  QUEUE_ORDER_CONFIRMED_LOGISTICS_FAILED,
  QUEUE_USER_CREATED_CATALOG,
  QUEUE_USER_CREATED_CATALOG_FAILED,
  QUEUE_USER_CREATED_FINANCIAL,
  QUEUE_USER_CREATED_FINANCIAL_FAILED,
  QUEUE_USER_CREATED_LOGISTICS,
  QUEUE_USER_CREATED_LOGISTICS_FAILED,
  QUEUE_USER_CREATED_ORDER,
  QUEUE_USER_CREATED_ORDER_FAILED,
  QUEUE_USER_CREATED_STOCK,
  QUEUE_USER_CREATED_STOCK_FAILED,
  RABBITMQ_RETRY_HEADER,
} from "../packages/shared/src/rabbitmq.constants";

interface RedriveTarget {
  failedQueue: string;
  targetQueue: string;
}

const targets: RedriveTarget[] = [
  { failedQueue: QUEUE_USER_CREATED_CATALOG_FAILED, targetQueue: QUEUE_USER_CREATED_CATALOG },
  { failedQueue: QUEUE_USER_CREATED_STOCK_FAILED, targetQueue: QUEUE_USER_CREATED_STOCK },
  { failedQueue: QUEUE_USER_CREATED_ORDER_FAILED, targetQueue: QUEUE_USER_CREATED_ORDER },
  { failedQueue: QUEUE_USER_CREATED_FINANCIAL_FAILED, targetQueue: QUEUE_USER_CREATED_FINANCIAL },
  { failedQueue: QUEUE_USER_CREATED_LOGISTICS_FAILED, targetQueue: QUEUE_USER_CREATED_LOGISTICS },
  { failedQueue: QUEUE_ORDER_CONFIRMED_FINANCIAL_FAILED, targetQueue: QUEUE_ORDER_CONFIRMED_FINANCIAL },
  { failedQueue: QUEUE_ORDER_CONFIRMED_LOGISTICS_FAILED, targetQueue: QUEUE_ORDER_CONFIRMED_LOGISTICS },
  { failedQueue: QUEUE_AUDIT_LOGGED_FAILED, targetQueue: QUEUE_AUDIT_LOGGED },
];

interface CliOptions {
  queue?: string;
  all: boolean;
  limit: number;
  dryRun: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { all: false, limit: 100, dryRun: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--all") options.all = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--queue") options.queue = argv[++i];
    else if (arg === "--limit") options.limit = Number(argv[++i]);
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isInteger(options.limit) || options.limit < 1) {
    throw new Error("--limit must be a positive integer");
  }
  if (!options.all && !options.queue) {
    throw new Error("Use --queue <failedQueue> or --all");
  }

  return options;
}

function printHelp(): void {
  console.log(`Usage:
  pnpm rabbitmq:redrive -- --queue <failedQueue> [--limit 100] [--dry-run]
  pnpm rabbitmq:redrive -- --all [--limit 100] [--dry-run]

Examples:
  pnpm rabbitmq:redrive -- --queue catalog.user_created.failed --limit 10
  pnpm rabbitmq:redrive -- --all --dry-run
`);
}

function selectTargets(options: CliOptions): RedriveTarget[] {
  if (options.all) return targets;

  const target = targets.find((item) => item.failedQueue === options.queue);
  if (!target) {
    const known = targets.map((item) => `  - ${item.failedQueue}`).join("\n");
    throw new Error(`Unknown failed queue: ${options.queue}\nKnown queues:\n${known}`);
  }

  return [target];
}

function headersForRedrive(msg: GetMessage): Record<string, unknown> {
  const headers = { ...(msg.properties.headers ?? {}) };
  delete headers[RABBITMQ_RETRY_HEADER];

  const previous = typeof headers["x-redrive-count"] === "number" ? headers["x-redrive-count"] : 0;
  headers["x-redrive-count"] = previous + 1;
  headers["x-redriven-at"] = new Date().toISOString();
  return headers;
}

async function redriveTarget(channel: amqp.Channel, target: RedriveTarget, limit: number, dryRun: boolean): Promise<number> {
  await channel.assertQueue(target.failedQueue, { durable: true });
  await channel.assertQueue(target.targetQueue, { durable: true });

  let moved = 0;
  while (moved < limit) {
    const msg = await channel.get(target.failedQueue, { noAck: false });
    if (!msg) break;

    if (dryRun) {
      console.log(`[dry-run] ${target.failedQueue} -> ${target.targetQueue}: ${msg.content.length} bytes`);
      channel.nack(msg, false, true);
      break;
    }

    channel.sendToQueue(target.targetQueue, msg.content, {
      persistent: true,
      contentType: msg.properties.contentType,
      correlationId: msg.properties.correlationId,
      messageId: msg.properties.messageId,
      headers: headersForRedrive(msg),
    });
    channel.ack(msg);
    moved++;
  }

  return moved;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const rabbitmqUrl = process.env.RABBITMQ_URL ?? "amqp://lframework:lframework@localhost:5675";
  const selectedTargets = selectTargets(options);

  const connection = await amqp.connect(rabbitmqUrl, { timeout: 10_000 });
  const channel = await connection.createChannel();

  try {
    let total = 0;
    for (const target of selectedTargets) {
      const moved = await redriveTarget(channel, target, options.limit, options.dryRun);
      total += moved;
      console.log(`${target.failedQueue} -> ${target.targetQueue}: ${moved} mensagem(ns) reprocessada(s)`);
    }
    console.log(`Total reprocessado: ${total}`);
  } finally {
    await channel.close();
    await connection.close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
