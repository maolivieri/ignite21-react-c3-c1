import { FC, useState } from 'react';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  id: string;
  slugs: string[];
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

const Home: FC<HomeProps> = ({ postsPagination }: HomeProps) => {
  const { results, next_page } = postsPagination;

  const [posts, setPosts] = useState(results);
  const [nextPage, setNextPage] = useState(next_page);

  const handleClick = async (): Promise<void> => {
    const response = await fetch(nextPage);
    const newResults = await response.json();

    setPosts(prevState => [...prevState, ...newResults.results]);

    setNextPage(newResults.next_page);
  };

  return (
    <div className={commonStyles.container}>
      <Link href="/">
        <img src="/logo.svg" alt="logo" />
      </Link>
      {posts.map(post => (
        <div key={post.id}>
          <Link href={`/post/${post.uid}`}>
            <div className={styles.postWrapper}>
              <h3>{post.data.title}</h3>
              <p>{post.data.subtitle}</p>
              <div className={styles.postFooter}>
                <div>
                  <FiCalendar />
                  <p>
                    {format(
                      parseISO(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </p>
                </div>
                <div>
                  <FiUser />
                  <p>{post.data.author}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
      {postsPagination.next_page && (
        <button
          className={styles.button}
          type="button"
          onClick={() => handleClick()}
        >
          Carregar mais posts
        </button>
      )}
    </div>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      // fetch: ['posts.slug', 'posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 5,
    }
  );

  return {
    props: {
      postsPagination: postsResponse,
    },
  };
};
