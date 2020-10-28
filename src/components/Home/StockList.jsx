import React from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
    paddingRight: '20px',
    margin: '10px'
  },
  button: {
    float: 'right'
  }
});

// eslint-disable-next-line react/prop-types
function StockList({ article }) {
  // eslint-disable-next-line react/prop-types
  const {
    // eslint-disable-next-line react/prop-types
    author, title, url, urlToImage, description, publishedAt
  } = article;
  const classes = useStyles();
  return (
    <div>
      <Grid item xs={12}>
        <Card className={classes.root}>
          <CardActionArea>
            <CardMedia
              component='img'
              alt={author}
              height='140'
              image={urlToImage}
              title='Contemplative Reptile'
            />
            <CardContent>
              <Typography gutterBottom variant='h5' component='h2'>
                {title}
                {' '}
              </Typography>
              <Typography variant='body2' color='textSecondary' component='p'>
                <em>{new Date(publishedAt).toDateString()}</em>
                <br />
                {description}
              </Typography>
            </CardContent>
          </CardActionArea>
          <CardActions className={classes.button}>
            <Button variant='outlined' size='small' color='primary' href={url}>
              Link
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </div>
  );
}

export default StockList;
