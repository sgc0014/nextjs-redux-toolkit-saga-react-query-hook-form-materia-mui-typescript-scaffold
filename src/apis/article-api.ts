import axios from 'axios';
import { mainConfig } from '../configs/main-config';
import { BASE_API_URI, ITEMS_PER_PAGE } from '../constants/article-const';
import { Article, ArticleFilterParams, ArticleDetailParams } from '../types/article-types';
import { consoleLog } from '../utils/console-log';

const fs = require('fs');

interface ReactQueryFnProps<T> {
  queryKey: [string, T];
}

const axiosInstance = axios.create({
  baseURL: `${BASE_API_URI}/`,
  timeout: 4999,
  headers: {
    'Content-Type': 'application/json',
    // 'api-key'     : process.env.NEXT_PUBLIC_DEV_DOT_TO_API_KEY || 'Missing dev.to api key',
    accept        : 'application/vnd.forem.api-v1+json',
  },
});

export const getArticles = async ({ tag = 'react', page = 1 }:ArticleFilterParams):Promise<Article[]> => {
  const apiEndpoint = `articles?tag=${tag}&page=${page}&per_page=${ITEMS_PER_PAGE}`;
  const response    = await axiosInstance.get(apiEndpoint);
  // consoleLog('🚀 ~ file: article-api.ts ~ line 12 ~ getArticles ~ apiEndpoint', apiEndpoint);
  return response.data;
};

export const getArticleDetail = async ({ id }:ArticleDetailParams):Promise<Article | null> => {
  const apiEndpoint = `articles/${id}`;
  const jsonFile    = `${mainConfig.dataFilePath}/article-${id}.json`;
  try {
    // read data from local json file first
    const fsStats = fs.statSync(jsonFile, { throwIfNoEntry: false });
    if (fsStats && 'mtime' in fsStats) {
      // consoleLog('fs stats', fsStats);
      const articleData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      if ('id' in articleData) {
        return articleData;
      }
    }

    const response = await axiosInstance.get(apiEndpoint);

    // save data to json file
    if (('id' in response.data) && 'body_html' in response.data) {
      fs.writeFileSync(jsonFile, JSON.stringify(response.data), 'utf8');
    }

    return response.data;
  } catch (error) {
    consoleLog('🚀 ~ file: article-api.ts ~ line 27 ~ getArticleDetail ~ apiEndpoint', apiEndpoint, error);
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        // Do something for timeout ...
      }
    }
  }

  return null;
};

export const reactQueryFn = {
  getArticles: async (params:ReactQueryFnProps<ArticleFilterParams>)
  :Promise<Article[]> => getArticles(params.queryKey[1]),

  getArticleDetail: async (params:ReactQueryFnProps<ArticleDetailParams>)
  :Promise<Article | null> => getArticleDetail(params.queryKey[1]),
};
