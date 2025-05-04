import React, { useEffect, useState } from "react";
import axios from "axios";

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(
          "https://financialmodelingprep.com/api/v3/fmp/articles?page=0&size=5&apikey=ocjQYEXA5UXIrbluAtXJJYVToAzmcQiE"
        );

        if (Array.isArray(response.data.content)) {
          setArticles(response.data.content);
        } else {
          console.error("Unexpected API response:", response.data);
          setArticles([]);
        }
      } catch (error) {
        console.error("Failed to fetch articles", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Function to remove HTML tags from content
  const stripHtmlTags = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Financial Articles</h2>
      {loading ? (
        <p>Loading articles...</p>
      ) : (
        <ul className="space-y-4">
          {articles.map((article, index) => (
            <li key={index} className="bg-white p-4 rounded shadow">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-blue-600 hover:underline"
              >
                {article.title}
              </a>
              <p className="text-sm text-gray-500 mb-2">
                {formatDate(article.date)} • {article.author}
              </p>
              <p className="text-gray-700 text-sm">
                {stripHtmlTags(article.content)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Articles;