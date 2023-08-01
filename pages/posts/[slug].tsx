import React from 'react';
import { sanityClient, urlFor } from '@/sanity';
import Header from '@/components/Header';
import { Post } from '@/typings';
import Image from 'next/image';
import PortableText from 'react-portable-text';
import { useForm, SubmitHandler } from 'react-hook-form';

interface Props {
  post: Post;
}
// form interface
interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

function Post({ post }: Props) {
  console.log('Post = ', post);
  // connect form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const [submitted, setSubmitted] = React.useState<boolean>(false);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    console.log(data);
    // post to backend
    try {
      const res = await fetch('/api/createComment', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log(res);
      setSubmitted(true);
    } catch (err) {
      console.log(err);
      setSubmitted(false);
    }
  };

  return (
    <main>
      <Header />
      <Image
        src={urlFor(post.mainImage).url()}
        width={500}
        height={300}
        alt='Medium logo'
        className='w-full h-40 object-cover'
      />
      <article>
        <h1>{post.title}</h1>
        <h2>{post.description}</h2>
        <div>
          <Image
            src={urlFor(post.author.image).url()}
            width={12}
            height={12}
            alt='Medium logo'
            className='rounded-full h-12 w-12'
          />
          <p>
            Blog post by {post.author.name} _Published at{' '}
            {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <PortableText
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            content={post.body}
            serializers={{
              normal: (props: any) => <p className='my-2' {...props} />,
            }}
          />
        </div>
      </article>
      <hr className='max-w-lg my-5 mx-auto border border-yellow-500' />
      {submitted ? (
        <div className='flex text-white my-10 p-10 max-w-2xl mx-auto bg-yellow-500'>
          <h3 className='text-3xl font-bold'>Thank you for submitting!</h3>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col p-5 max-w-2xl mx-auto mb-10'
        >
          <h3 className='text-base font-semibold leading-7 text-gray-900'>
            Enjoyed this article?
          </h3>
          <h4 className='text-base font-semibold leading-7 text-gray-900'>
            Leave a comment below
          </h4>
          <hr />
          <input
            {...register('_id')}
            type='hidden'
            name='_id'
            value={post._id}
          />
          <label className='block text-sm font-medium leading-6 text-gray-900'>
            <span>Name</span>
            <input
              {...register('name', { required: true })}
              type='text'
              placeholder='your name'
              className='shadow border rounded py-2 px-3 form-input my-2 block w-full'
            />
          </label>
          <label className='block text-sm font-medium leading-6 text-gray-900'>
            <span>Email</span>
            <input
              {...register('email', { required: true })}
              type='text'
              placeholder='example@aol.com'
              className='shadow border rounded py-2 px-3 form-input my-2 block w-full'
            />
          </label>
          <label className='block text-sm font-medium leading-6 text-gray-900'>
            <span>Comment</span>
            <textarea
              {...register('comment', { required: true })}
              placeholder='Text goes here...'
              rows={8}
              className='shodow border rounded py-2 px-3 form-textarea my-2 block w-full'
            />
          </label>
          {/* errors will reture when field valiation fails */}
          <div>
            {errors.name && (
              <div className='text-red-500'>Name is required</div>
            )}
            {errors.email && (
              <div className='text-red-500'>Email is required</div>
            )}
            {errors.comment && (
              <div className='text-red-500'>A comment is required</div>
            )}
          </div>
          <input
            type='submit'
            className='shadow bg-yellow-500 py-2 px-4 cursor-pointer'
          />
        </form>
      )}
      {/* Comments */}
      <div className='max-w-2xl mx-auto'>
        <h3 className='text-2xl font-bold'>Comments</h3>
        {
          // if there are no comments
          post.comments.length === 0 ? (
            <p>No comments yet</p>
          ) : (
            // if there are comments
            post.comments.map((comment: any) => (
              <div key={comment._id} className='my-5'>
                <p className='text-sm font-semibold'>{comment.name}</p>
                <p className='text-sm'>{comment.comment}</p>
              </div>
            ))
          )
        }
      </div>
    </main>
  );
}

export const getStaticPaths = async () => {
  const query = `
  *[_type == "post"]{
  _id,
    slug {
      current
    },
  
}`;
  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: { slug: post.slug.current },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};
// get informtion for each post
export const getStaticProps = async ({ params }: any) => {
  const { slug } = params;
  const query = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  _createdAt,
  title,
  body,
  author-> {
    name,
    image
  },
  'comments': *[
    _type == 'comment' && 
    post._ref == ^._id &&
    approved == true
  ],
    description,
    mainImage,
    slug
}`;

  const post = await sanityClient.fetch(query, { slug: slug });

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    revalidate: 60,
  };
};

export default Post;
