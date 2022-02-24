import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import PrismicDom from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import Header from '../../components/Header';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  // TODO
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const paragraphs = post.data.content.map(paragraph =>
    PrismicDom.RichText.asText(paragraph.body)
  );
  const regexp = /\W+/g;
  const sentences = paragraphs.map(paragraph => paragraph.split(regexp));

  const wordCount: number = sentences.reduce((prev, curr) => {
    return prev.length + curr.length;
  });

  const estimatedReadingTime = Math.ceil(wordCount / 200);

  return (
    <>
      <div className={commonStyles.container}>
        <Header />
      </div>
      <Image
        src={post.data.banner.url}
        alt="Post banner"
        width={1440}
        height={500}
      />
      <div className={commonStyles.container}>
        <main className={styles.postContainer}>
          <h1>{post.data.title}</h1>
          <div className={styles.infoContainer}>
            <section>
              <FiCalendar />
              <p>
                {format(new Date(post.first_publication_date), 'd MMM u', {
                  locale: ptBR,
                })}
              </p>
            </section>

            <section>
              <FiUser />
              <p>{post.data.author}</p>
            </section>

            <section>
              <FiClock />
              <p>{estimatedReadingTime} min</p>
            </section>
          </div>

          <section className={styles.postContents}>
            {post.data.content.map(element => {
              return (
                <article key={element.heading}>
                  <h2 className={styles.postHeadings}>{element.heading}</h2>
                  {element.body.map(postContent => (
                    <p key={postContent.text}>{postContent.text}</p>
                  ))}
                </article>
              );
            })}
          </section>
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const { results: posts } = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.uid'],
    }
  );
  const paths = posts.map(post => {
    return { params: { slug: post.uid } };
  });

  // TODO
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  // TODO
  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: response.data,
  };

  return {
    props: {
      post,
    },
  };
};
