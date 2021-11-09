import { FC, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  last_publication_date: string | null;
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

const Post: FC<PostProps> = ({ post }) => {
  useEffect(() => {
    let script = document.createElement('script');
    let anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', true);
    script.setAttribute('repo', '[ENTER REPO HERE]');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-light');
    anchor.appendChild(script);
  });

  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <div className={commonStyles.container}>
      <Header />
      <img className={styles.banner} src={post.data.banner.url} alt="post" />
      <h1 className={styles.title}>{post.data.title}</h1>
      <div className={styles.titleFooter}>
        <div>
          <FiCalendar />
          <p>
            {format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </p>
        </div>
        <div>
          <FiUser /> <p>{post.data.author}</p>
        </div>
        <div>
          <FiClock /> <p>4 min</p>
        </div>
      </div>

      <i className={styles.edit}>
        *editado em
        {format(
          parseISO(post.last_publication_date),
          " dd MMM yyyy, 'às' HH:mm",
          {
            locale: ptBR,
          }
        )}
      </i>
      {post.data.content.map(paragraph => (
        <div className={styles.postContent}>
          <div dangerouslySetInnerHTML={{ __html: paragraph.heading }} />
          {paragraph.body.map(body => (
            <div dangerouslySetInnerHTML={{ __html: body.text }} />
          ))}
        </div>
      ))}
      <br />
      <hr />
      <br />
      <div>
        <div>
          <p>Next Post</p>
        </div>
        <div>
          <p>Prev Post</p>
        </div>
      </div>
      <div id="inject-comments-for-uterances"></div>
    </div>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const docs = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { lang: '*' }
  );

  return {
    paths: docs.results.map(doc => {
      return { params: { slug: doc.uid } };
    }),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const post = await prismic.getByUID('posts', String(context.params.slug), {});

  return {
    props: { post },
    revalidate: 1,
  };
};
