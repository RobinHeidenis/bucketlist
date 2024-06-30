// Disable the bodyParser so we can access the raw
// request body for verification.
import { type NextApiRequest, type NextApiResponse } from 'next';
import { Webhook, type WebhookRequiredHeaders } from 'svix';
import { buffer } from 'micro';
import { type IncomingHttpHeaders } from 'http';
import { prisma } from '~/server/db';
import { type WebhookEvent } from '@clerk/clerk-sdk-node';

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret: string = process.env.WEBHOOK_SECRET ?? '';

export default async function handler(
  req: NextApiRequestWithSvixRequiredHeaders,
  res: NextApiResponse,
) {
  // Verify the webhook signature
  // See https://docs.svix.com/receiving/verifying-payloads/how
  const payload = (await buffer(req)).toString();
  const headers = req.headers;
  const wh = new Webhook(webhookSecret);
  let evt: null | WebhookEvent = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    evt = wh.verify(payload, headers) as WebhookEvent;
  } catch (_) {
    return void res.status(400).json({});
  }

  // Handle the webhook
  const eventType = evt.type;
  if (eventType === 'user.created') {
    const { id } = evt.data;
    if (!id) return void res.status(400).json({});
    await prisma.user.create({
      data: {
        id: id.toString(),
      },
    });
  }

  res.json({});
}

type NextApiRequestWithSvixRequiredHeaders = NextApiRequest & {
  headers: IncomingHttpHeaders & WebhookRequiredHeaders;
};
