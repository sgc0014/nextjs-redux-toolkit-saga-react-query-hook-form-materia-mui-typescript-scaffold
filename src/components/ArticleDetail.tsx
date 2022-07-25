import * as React from 'react';
import { styled } from '@mui/material/styles';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import {
  Avatar, Box, Card, CardActions, CardContent,
  CardHeader, CardMedia, Chip, Collapse, Fab, Tooltip, Typography,
} from '@mui/material';
import MoreIcon from '@mui/icons-material/More';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Article, UserSliceType } from '../types/article-types';
import {
  getArticleImgUrl, getArticleTags, getFormattedDate, getTagLink,
} from '../helpers/article-helper';
import userSlice from '../redux/features/userSlice';
import { ReduxState } from '../redux/store';
import ActionToaster from './ActionToaster';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform : !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

interface Props {
  article: Article;
}

const ArticleDetail = ({ article }:Props) => {
  const router        = useRouter();
  const reduxDispatch = useDispatch();

  const reduxUserData:UserSliceType = useSelector((reduxState: ReduxState) => reduxState.user);

  const [expanded, setExpanded]       = useState(true);
  const [showToaster, setShowToaster] = useState(false);

  const isFavorite = reduxUserData.favoriteItems.some((item) => item.id === article.id);

  const allTags = getArticleTags(article);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const onClickFavorite = () => {
    reduxDispatch(userSlice.actions.favoriteItemRequest(article));
    setShowToaster(true);
  };

  return (
    <Card sx={{ maxWidth: 1000, marginTop: 5 }}>
      <CardHeader
        avatar={(
          <Avatar
            sx={{ bgcolor: red[500] }}
            aria-label="recipe"
            src={article.user.profile_image_90}
          >
            {article.user.name}
          </Avatar>
        )}
        action={(
          <IconButton aria-label="settings" onClick={() => router.back()}>
            <MoreIcon />
          </IconButton>
        )}
        title={article.title}
        subheader={`${article.user.name} - ${getFormattedDate(article.published_at, 'MM/dd/yyyy EEEE HH:mm')}`}
      />
      <CardMedia
        component="img"
        height="300"
        image={getArticleImgUrl(article)}
        alt={article.title}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {article.description}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton
          aria-label="add to favorites"
          color={isFavorite ? 'error' : 'default'}
          onClick={onClickFavorite}
        >
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph variant="h1" component="h1" sx={{ fontSize: '2rem', fontWeight: 600 }}>
            {article.title}
          </Typography>
          <Typography paragraph component="div">
            <div
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: article.body_html || '' }}
            />
          </Typography>

          {allTags.length > 0 && (
            <Box sx={{ margin: '2rem 0' }}>
              <Chip
                avatar={(
                  <Avatar
                    alt={article.user.name}
                    src={article.user.profile_image_90}
                  />
                )}
                label={article.user.name}
                variant="outlined"
                sx={{ marginRight: '1rem', background: '#f5f5f5' }}
              />

              {allTags.map((tag) => (
                <Link href={getTagLink(tag)} passHref>
                  <Chip label={tag} variant="outlined" component="a" sx={{ marginRight: '1rem' }} />
                </Link>
              ))}
            </Box>
          )}

        </CardContent>
      </Collapse>

      <Fab
        aria-label="like"
        sx={{
          position: 'fixed',
          bottom  : (theme) => theme.spacing(5),
          right   : (theme) => theme.spacing(5),
        }}
        color={isFavorite ? 'error' : 'default'}
        onClick={onClickFavorite}
      >
        <Tooltip
          title={isFavorite ? 'Remove this article from my favorites' : 'Favorite this article!'}
          placement="left"
          PopperProps={{
            modifiers: [
              {
                name   : 'offset',
                options: {
                  offset: [0, 10],
                },
              },
            ],
          }}
        >
          <FavoriteIcon />
        </Tooltip>
      </Fab>

      <ActionToaster
        showToaster={showToaster}
        setShowToaster={setShowToaster}
        message={`This article ${isFavorite ? 'added' : 'removed'} to your favorites`}
        alertColor={isFavorite ? 'success' : 'warning'}
      />

    </Card>
  );
};

export default ArticleDetail;
