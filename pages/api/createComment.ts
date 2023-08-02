// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from 'next-sanity';

const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2023-07-31',
};
const client = createClient(config);
export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Destructure the body from the request
  const { _id, name, email, comment } = req.body;
  console.log('REQ BODY: ', req.body);
  try {
    await client.create({
      _type: 'comment',
      post: {
        _type: 'reference',
        _ref: _id,
      },
      name,
      email,
      comment,
    });
    console.log('Comment submitted');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: `Couldn't submit comment`, err });
  }
  return res.status(200).json({ message: 'Comment submitted' });
}
