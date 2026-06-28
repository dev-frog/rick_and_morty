/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import Link from 'next/link';
import styles from "../../../styles/Home.module.css";
import { apiService } from '../../../services/api';
import appConfig from '../../../config/app';

export async function getServerSideProps({ query }) {
  const { id } = query;
  const data = await apiService.getCharacterById(id);

  return {
    props: {
      data,
      id,
    },
  };
}

export default function CharacterDetail({ data, id }) {
  // Handle error cases
  if (data?.error) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Character Not Found - {appConfig.name}</title>
        </Head>
        <main className={styles.main}>
          <div className={styles.error_state}>
            <h1>Character Not Found</h1>
            <p>{data.message || 'The character you are looking for does not exist.'}</p>
            <Link href="/">
              <a className={styles.back_button}>Return to Home</a>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { name, image, gender, location, origin, species, status, type, episode } = data;
  const statusColor = appConfig.statusColors[status] || appConfig.statusColors.Unknown;

  return (
    <div className={styles.container}>
      <Head>
        <title>{name} - {appConfig.name}</title>
        <meta name="description" content={`Detailed information about ${name} from Rick and Morty`} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.character_detail_main}>
        <header className={styles.detail_header}>
          <Link href="/">
            <a className={styles.back_link} aria-label="Return to character list">
              ← Back to Characters
            </a>
          </Link>
          <h1 className={styles.detail_title}>{name}</h1>
        </header>

        <article className={styles.character_profile}>
          <figure className={styles.profile_image_section}>
            <img
              src={image}
              alt={`${name} character portrait`}
              className={styles.profile_image}
            />
            <div
              className={styles.profile_status_badge}
              style={{ backgroundColor: statusColor }}
            >
              {status}
            </div>
          </figure>

          <section className={styles.profile_information}>
            <h2 className={styles.profile_section_title}>Character Information</h2>

            <dl className={styles.character_details_list}>
              <div className={styles.detail_item}>
                <dt className={styles.detail_label}>Status</dt>
                <dd className={styles.detail_value}>
                  <span
                    className={styles.status_indicator}
                    style={{ backgroundColor: statusColor }}
                  >
                    {status}
                  </span>
                </dd>
              </div>

              <div className={styles.detail_item}>
                <dt className={styles.detail_label}>Species</dt>
                <dd className={styles.detail_value}>{species}</dd>
              </div>

              {type && (
                <div className={styles.detail_item}>
                  <dt className={styles.detail_label}>Type</dt>
                  <dd className={styles.detail_value}>{type}</dd>
                </div>
              )}

              <div className={styles.detail_item}>
                <dt className={styles.detail_label}>Gender</dt>
                <dd className={styles.detail_value}>{gender}</dd>
              </div>

              <div className={styles.detail_item}>
                <dt className={styles.detail_label}>Origin</dt>
                <dd className={styles.detail_value}>{origin?.name || 'Unknown'}</dd>
              </div>

              <div className={styles.detail_item}>
                <dt className={styles.detail_label}>Last Known Location</dt>
                <dd className={styles.detail_value}>{location?.name || 'Unknown'}</dd>
              </div>

              {episode && (
                <div className={styles.detail_item}>
                  <dt className={styles.detail_label}>Episodes</dt>
                  <dd className={styles.detail_value}>
                    Appeared in {episode.length} episode{episode.length !== 1 ? 's' : ''}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </article>

        <nav className={styles.detail_navigation}>
          <Link href="/">
            <a className={styles.home_button}>
              View All Characters
            </a>
          </Link>
        </nav>
      </main>

      <footer className={styles.footer}>
        <p>
          Data provided by{' '}
          <a
            href="https://rickandmortyapi.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            The Rick and Morty API
          </a>
        </p>
      </footer>
    </div>
  );
}
