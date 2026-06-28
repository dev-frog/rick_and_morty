/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Link from 'next/link';
import { apiService } from '../services/api';
import appConfig from '../config/app';

export async function getServerSideProps() {
  const data = await apiService.getCharacters(1);

  return {
    props: {
      data,
    },
  };
}

export default function Home({ data }) {
  const { info, results: defaultResults = [], error } = data;
  const [results, updateResults] = useState(defaultResults);
  const [page, updatePage] = useState({
    ...info,
    current: defaultResults,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { current } = page;

  useEffect(() => {
    if (typeof current !== 'string' || !current.startsWith('http')) return;

    async function request() {
      setIsLoading(true);
      setSearchError(null);

      try {
        const url = new URL(current);
        const nextPage = url.searchParams.get('page');
        const nameQuery = url.searchParams.get('name');

        let nextData;
        if (nameQuery) {
          nextData = await apiService.searchCharacters(nameQuery);
        } else {
          nextData = await apiService.getCharacters(parseInt(nextPage) || 1);
        }

        if (nextData.error) {
          setSearchError(nextData.message);
          setIsLoading(false);
          return;
        }

        updatePage({
          current,
          ...nextData.info,
        });

        if (!nextData.info?.prev) {
          updateResults(nextData.results);
        } else {
          updateResults((prev) => {
            return [...prev, ...nextData.results];
          });
        }
      } catch (error) {
        setSearchError('Failed to fetch characters. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    request();
  }, [current]);

  function handleLoadMore() {
    if (!page?.next || isLoading) return;

    updatePage((prev) => {
      return {
        ...prev,
        current: prev?.next,
      };
    });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();

    const { currentTarget = {} } = e;
    const fields = Array.from(currentTarget?.elements);
    const fieldQuery = fields.find((field) => field.name === "query");

    const value = fieldQuery?.value?.trim() || "";
    setSearchQuery(value);

    if (value === '') {
      // Reset to default
      updateResults(defaultResults);
      updatePage({
        ...info,
        current: `${appConfig.api.characterEndpoint}?page=1`,
      });
      setSearchError(null);
      return;
    }

    const endpoint = `${appConfig.api.characterEndpoint}?name=${encodeURIComponent(value)}`;

    updatePage({
      current: endpoint,
    });
  }

  function handleResetSearch() {
    setSearchQuery('');
    updateResults(defaultResults);
    updatePage({
      ...info,
      current: `${appConfig.api.characterEndpoint}?page=1`,
    });
    setSearchError(null);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{appConfig.name}</title>
        <meta name="description" content={appConfig.description} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Rick & Morty</h1>
          <p className={styles.description}>
            <code className={styles.code}>
              {appConfig.description}
            </code>
          </p>
        </header>

        <section className={styles.search_section}>
          <form className={styles.search_form} onSubmit={handleSearchSubmit}>
            <div className={styles.input_group}>
              <input
                type="search"
                name="query"
                className={styles.search_input}
                placeholder="Search characters..."
                defaultValue={searchQuery}
                disabled={isLoading}
                aria-label="Search characters"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className={styles.reset_button}
                  disabled={isLoading}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <button
              type="submit"
              className={styles.search_button}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchError && (
            <div className={styles.error_message} role="alert">
              <span className={styles.error_icon}>⚠</span>
              {searchError}
              <button
                onClick={handleResetSearch}
                className={styles.error_reset}
              >
                Reset
              </button>
            </div>
          )}
        </section>

        {error && (
          <div className={styles.error_message} role="alert">
            <span className={styles.error_icon}>⚠</span>
            Failed to load characters. Please refresh the page.
          </div>
        )}

        <section className={styles.results_section}>
          {results.length === 0 && !isLoading && !searchError && (
            <div className={styles.empty_state}>
              <p>No characters found. Try a different search term.</p>
            </div>
          )}

          <ul className={styles.character_grid}>
            {results.map((result) => {
              const { id, name, image, status, location } = result;
              const statusColor = appConfig.statusColors[status] || appConfig.statusColors.Unknown;

              return (
                <li key={id} className={styles.character_card}>
                  <Link href="/character/[id]" as={`/character/${id}`}>
                    <a className={styles.character_link}>
                      <div className={styles.character_image_wrapper}>
                        <img
                          src={image}
                          alt={`${name} character`}
                          className={styles.character_image}
                          loading="lazy"
                        />
                        <span
                          className={styles.status_badge}
                          style={{ backgroundColor: statusColor }}
                        >
                          {status}
                        </span>
                      </div>
                      <div className={styles.character_info}>
                        <h2 className={styles.character_name}>{name}</h2>
                        <p className={styles.character_location}>
                          <span className={styles.location_label}>Last location:</span>
                          {location?.name || 'Unknown'}
                        </p>
                      </div>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>

          {isLoading && (
            <div className={styles.loading_state}>
              <div className={styles.spinner} aria-hidden="true"></div>
              <p>Loading characters...</p>
            </div>
          )}

          {results.length > 0 && page?.next && !isLoading && (
            <div className={styles.pagination}>
              <button
                onClick={handleLoadMore}
                className={styles.load_more_button}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Characters'}
              </button>
            </div>
          )}
        </section>
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
