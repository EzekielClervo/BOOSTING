// functions.js
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const { v4: uuidv4 } = require('uuid');
const qs = require('querystring');
const { URL } = require('url');

function darkBlue(text) {
  return chalk.hex('#00008B')(text);
}

function violet(text) {
  return chalk.magenta(text);
}

function red(text) {
  return chalk.red(text);
}

function extractCommentIdFromUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const commentIdParam = parsedUrl.searchParams.get('comment_id');
    if (!commentIdParam) throw new Error("No comment_id found");
    const decoded = Buffer.from(commentIdParam, 'base64').toString('utf-8');
    return decoded.split('_').pop();
  } catch (err) {
    console.error(red(`Error extracting comment ID: ${err.message}`));
    return null;
  }
}

function convertPostLink(url) {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathParts.includes('posts')) {
      const index = pathParts.indexOf('posts');
      return `${pathParts[index - 1]}_${pathParts[index + 1]}`;
    } else if (parsedUrl.pathname.includes('story.php')) {
      const storyId = parsedUrl.searchParams.get('story_fbid');
      return `${pathParts[0]}_${storyId}`;
    }
    return pathParts[pathParts.length - 1];
  } catch (err) {
    console.error(red(`Error converting post URL: ${err.message}`));
    return null;
  }
}

async function reactToComment(accessToken, commentId, reactionType = "LIKE") {
  const spinner = ora(darkBlue('Reacting to comment...')).start();
  try {
    const url = `https://graph.facebook.com/v19.0/${commentId}/reactions`;
    const params = {
      type: reactionType,
      access_token: accessToken
    };
    const res = await axios.post(url, qs.stringify(params));
    spinner.succeed(violet('Reaction sent!'));
    return res.data;
  } catch (err) {
    spinner.fail(red('Error reacting to comment'));
    console.error(red(err.message));
    return null;
  }
}

async function postComment(accessToken, postId, message) {
  const spinner = ora(darkBlue('Posting comment...')).start();
  try {
    const url = `https://graph.facebook.com/v19.0/${postId}/comments`;
    const params = {
      message,
      access_token: accessToken
    };
    const res = await axios.post(url, qs.stringify(params));
    spinner.succeed(violet('Comment posted!'));
    return res.data;
  } catch (err) {
    spinner.fail(red('Error posting comment'));
    console.error(red(err.message));
    return null;
  }
}

async function followUser(accessToken, userId) {
  const spinner = ora(darkBlue('Subscribing to user...')).start();
  try {
    const url = `https://graph.facebook.com/v19.0/${userId}/subscribers`;
    const params = { access_token: accessToken };
    const res = await axios.post(url, qs.stringify(params));
    spinner.succeed(violet('Subscribed successfully!'));
    return res.data;
  } catch (err) {
    spinner.fail(red('Error subscribing to user'));
    console.error(red(err.message));
    return null;
  }
}

async function unfollowUser(accessToken, userId) {
  const spinner = ora(darkBlue('Unsubscribing from user...')).start();
  try {
    const url = `https://graph.facebook.com/v19.0/${userId}/subscribers`;
    const params = { access_token: accessToken };
    const res = await axios.delete(url, { params });
    spinner.succeed(violet('Unsubscribed successfully!'));
    return res.data;
  } catch (err) {
    spinner.fail(red('Error unsubscribing from user'));
    console.error(red(err.message));
    return null;
  }
}

function extractUserIdFromUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const userId = parsedUrl.searchParams.get('id');
    if (!userId) throw new Error("No user ID found");
    return userId;
  } catch (err) {
    console.error(red(`Error extracting user ID: ${err.message}`));
    return null;
  }
}

async function sharePost(accessToken, postId) {
  const spinner = ora(darkBlue('Sharing post...')).start();
  try {
    const url = `https://graph.facebook.com/v19.0/me/feed`;
    const params = {
      link: `https://www.facebook.com/${postId}`,
      access_token: accessToken
    };
    const res = await axios.post(url, qs.stringify(params));
    spinner.succeed(violet('Post shared!'));
    return res.data;
  } catch (err) {
    spinner.fail(red('Error sharing post'));
    console.error(red(err.message));
    return null;
  }
}

module.exports = {
  extractCommentIdFromUrl,
  convertPostLink,
  reactToComment,
  postComment,
  followUser,
  unfollowUser,
  extractUserIdFromUrl,
  sharePost
};
