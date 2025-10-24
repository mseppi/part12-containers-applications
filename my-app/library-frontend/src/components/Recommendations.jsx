import { useState } from "react";
import { useQuery } from "@apollo/client";
import { ALL_BOOKS, ME } from "../queries";

const Recommendations = (props) => {
  const [genre, setGenre] = useState(null);
  const result = useQuery(ALL_BOOKS, {
    pollInterval: 2000,
  });
  const meResult = useQuery(ME);

  if (!props.show) {
    return null;
  }

  if (result.loading || meResult.loading) {
    return <div>loading...</div>;
  }

  const user = meResult.data.me;
  const booksToShow = genre
    ? result.data.allBooks.filter((b) => b.genres.includes(genre))
    : result.data.allBooks.filter((b) => b.genres.includes(user.favoriteGenre));

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        books in your favorite genre <b>{user.favoriteGenre}</b>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Recommendations;

