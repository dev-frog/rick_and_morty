/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Link from 'next/link'

const defaultEndOPoint = "https://rickandmortyapi.com/api/character";

export async function getServerSideProps() {
  const res = await fetch(defaultEndOPoint);
  const data = await res.json();
  return {
    props: {
      data,
    },
  };
}

export default function Home({ data }) {
  const { info, results: defaultResults = [] } = data;
  const [results, updateResults] = useState(defaultResults);
  const [page, updatePage] = useState({
    ...info,
    current: defaultResults,
  });
  const { current } = page;

  useEffect(() => {
    if (current === defaultEndOPoint) return;
    async function request() {
      const res = await fetch(current);
      const nextData = await res.json();

      updatePage({
        current,
        ...nextData.info,
      });

      if (!nextData.info?.prev) {
        updateResults(nextData.results);
        return;
      }
      updateResults((prev) => {
        return [...prev, ...nextData.results];
      });
    }
    request();
  }, [current]);

  function handleLoadMore() {
    updatePage((prev) => {
      return {
        ...prev,
        current: prev?.next,
      };
    });
  }

  function handleonSubmit(e) {
    e.preventDefault();

    const { currentTarget = {} } = e;
    const fields = Array.from(currentTarget?.elements);
    const fieldQuery = fields.find((field) => field.name === "query");

    const value = fieldQuery.value || "";
    const endpoint = `https://rickandmortyapi.com/api/character/?name=${value}`;
    console.log(endpoint);

    updatePage({
      current: endpoint,
    });
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>The Rick and Morty</title>
        <meta name="description" content="The Rick and Morty all character" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Rick & Morty</h1>

        <p className={styles.description}>
          <code className={styles.code}>
            The Rick and Morty all character wiki
          </code>
        </p>

        <form className={styles.from} onSubmit={handleonSubmit}>
          <input
            type="search"
            name="query"
            className={styles.from_input}
            required
          />
          <button type="submit" className={styles.from_button}>
            Search
          </button>
        </form>

        <ul className={styles.grid}>
          {results.map((result) => {
            const { id, name, image, status, location } = result;
            return (
              // eslint-disable-next-line react/jsx-key
              <li key={id} className={styles.card}>
                <Link href="/character/[id]" as={`/character/${id}`}>
                  <a>
                    <img src={image} alt={`${name} Thumb`} />
                    <h2>
                      {name} <span className={styles.status}>{status}</span>
                    </h2>
                    <p className={styles.location}>
                      Last location: {location?.name}
                    </p>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
        <p>
          <button onClick={handleLoadMore} className={styles.button}>
            Load More
          </button>
        </p>
      </main>
    </div>
  );
}
