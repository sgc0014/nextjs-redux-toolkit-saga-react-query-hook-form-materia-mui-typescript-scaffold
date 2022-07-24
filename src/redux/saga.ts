import { call, takeLatest, put } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import articleSlice from './features/articleSlice';
import * as articleApi from '../apis/article-api';
import { Article, ArticleFilterParams } from '../types/article-types';

export function* fetchArticles(action: PayloadAction<ArticleFilterParams>) {
  try {
    const response:Article[] = yield call(articleApi.getArticles, action.payload);

    const newData = {
      params: action.payload,
      data  : response,
    };

    // const response:Article[] = yield call(() => articleApi.getArticles(action.payload));

    yield put(articleSlice.actions.getArticlesSuccess(newData));
  } catch (e: any) {
    console.log('🚀 ~ file: saga.ts ~ line 19 ~ function*fetchArticles ~ e', e);

    yield put(articleSlice.actions.getArticlesFailure(e.message));
  }
}

export function* fetchArticleDetail(action: PayloadAction<{ id: number }>) {
  try {
    const response:Article = yield call(() => articleApi.getArticleDetail(action.payload));

    yield put(articleSlice.actions.getArticleDetailSuccess(response));
  } catch (e: any) {
    // yield put(articleSlice.actions.getArticleDetailFailure(e.message));
  }
}

// export function* fetchNumberSaga() {
//   try {
//     let result = yield call(() =>
//       callAPI({
//         url: 'http://www.randomnumberapi.com/api/v1.0/random?min=100&max=1000&count=1',
//       })
//     )
//     yield put(userSlice.actions.visit(result.data[0]))
//   } catch (e) {
//     yield put({ type: 'NUMBER_SAGA_FAILED' })
//   }
// }

export default function* rootSaga() {
  yield takeLatest(articleSlice.actions.getArticlesRequest, fetchArticles);
  yield takeLatest(articleSlice.actions.getArticleDetailRequest, fetchArticleDetail);

  // yield takeLatest(userSlice.actions.visit, fetchNumberSaga)
}
