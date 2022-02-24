import Link from 'next/link';
import Image from 'next/image';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  // TODO
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <a>
          <Image src="/logo.svg" alt="logo" width="238" height="25" />
        </a>
      </Link>
    </header>
  );
}
