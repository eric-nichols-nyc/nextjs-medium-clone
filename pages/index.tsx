import Image from 'next/image';
import { Inter } from 'next/font/google';
import Header from '../components/Header';
import { sanityClient, urlFor } from '@/sanity';
import { Post } from '../typings';
import Link from 'next/link';
const inter = Inter({ subsets: ['latin'] });

interface Props {
  posts: Post[];
}

export default function Home({ posts }: Props) {
  console.log(posts);
  return (
    <main className='max-w-7xl mx-auto'>
      <Header />
      <div className='flex justify-between items-center bg-yellow-400 py-10 lg:py-0'>
        <div className='px-10 space y-5'>
          <h1 className='text-6xl max-w-xi font-serif'>Stay curious.</h1>
        </div>
        <div></div>
        <Image
          src='https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png'
          alt='Medium logo'
          width={500}
          height={500}
          className='hidden md:inline-flex h-32 lg:h-full object-contain'
        />
      </div>
      {/** POSTS */}
      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 md:p-6'>
        {posts.map((post) => (
          <Link href={`/posts/${post.slug.current}`} key={post._id}>
            <Image
              src={urlFor(post.mainImage).url()}
              width={500}
              height={500}
              alt='Medium logo'
            />
            <div className='flex justify-between p-5'>
              <div>
                <p>{post.title}</p>
                <p>
                  {post.description} by {post.author.name}
                </p>
              </div>
              {/* authors image */}
              <Image
                src={urlFor(post.author.image).url()}
                width={12}
                height={12}
                alt='Medium logo'
                className='rounded-full h-12 w-12'
              />
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

export async function getServerSideProps() {
  const query = `*[_type == "post"]{
  _id,
  _createdAt,
  title,
  author-> {
    name,
    image
  },
    description,
    mainImage,
    slug
}`;

  const posts = await sanityClient.fetch(query);

  return {
    props: {
      posts,
    },
  };
}
