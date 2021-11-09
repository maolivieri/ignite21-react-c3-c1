import { FC } from 'react';
import Link from 'next/link';

import style from './header.module.scss';
// type HeaderProps = {};

const Header: FC = () => {
  return (
    <div className={style.container}>
      <div className={style.link}>
        <Link href="/">
          <img src="/logo.svg" alt="logo" />
        </Link>
      </div>
    </div>
  );
};

export default Header;
