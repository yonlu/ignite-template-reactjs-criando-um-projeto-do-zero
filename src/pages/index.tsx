import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ posts }): JSX.Element {
  // TODO
  return (
    <main className={styles.homeContainer}>
      {posts.map((post: Post) => (
        <article key={post.uid}>
          <h1>{post.data.title}</h1>
          <p>{post.data.subtitle}</p>
          <div className={styles.infoContainer}>
            <section>
              <FiCalendar /> {post.first_publication_date}
            </section>
            <section>
              <FiUser /> {post.data.author}
            </section>
          </div>
        </article>
      ))}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content'],
      pageSize: 1,
    }
  );

  const posts: Post[] = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  // TODO
  return {
    props: {
      posts,
    },
  };
};
