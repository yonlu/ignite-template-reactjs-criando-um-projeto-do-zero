import { useState, useEffect, useCallback } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  // TODO
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleLoadMorePosts = useCallback(
    async (endpointUrl: string) => {
      try {
        const response = await fetch(endpointUrl).then(res => res.json());
        const newPosts: Post[] = response.results.map((post: Post) => {
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

        setPosts([...posts, ...newPosts]);
        setNextPage(response.next_page);
      } catch (error) {
        console.log(error);
      }
    },
    [posts]
  );

  return (
    <main className={styles.homeContainer}>
      <Header />
      {posts.map((post: Post) => (
        <article key={post.uid}>
          <Link href={`/post/${post.uid}`}>
            <a>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
            </a>
          </Link>
          <div className={styles.infoContainer}>
            <section>
              <FiCalendar />{' '}
              {format(new Date(post.first_publication_date), 'd MMM u', {
                locale: ptBR,
              })}
            </section>
            <section>
              <FiUser /> {post.data.author}
            </section>
          </div>
        </article>
      ))}

      {nextPage ? (
        <button onClick={() => handleLoadMorePosts(nextPage)} type="button">
          Carregar mais posts
        </button>
      ) : null}
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

  const { next_page } = postsResponse;

  const results: Post[] = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination: PostPagination = {
    next_page,
    results,
  };

  // TODO
  return {
    props: {
      postsPagination,
    },
  };
};
