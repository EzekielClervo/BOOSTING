// index.js
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const { connectDB } = require('./utils/database');
const { getFbToken, storeToken, getLatestToken } = require('./token');
const {
  extractCommentIdFromUrl,
  convertPostLink,
  reactToComment,
  postComment,
  followUser,
  unfollowUser,
  extractUserIdFromUrl,
  sharePost
} = require('./functions');

(async function main() {
  await connectDB();

  async function tokenGetterFlow() {
    const { email, password } = await inquirer.prompt([
      { name: 'email', message: chalk.blue('Enter Facebook Email/ID:') },
      { name: 'password', message: chalk.blue('Enter Password:'), type: 'password' }
    ]);
    const spinner = ora(chalk.blue('Obtaining token...')).start();
    const token = await getFbToken(email, password);
    if (token) {
      spinner.succeed(chalk.magenta('Token obtained successfully!'));
      console.log(chalk.blue(token));
      await storeToken(email, token);
    } else {
      spinner.fail(chalk.red('Failed to obtain token!'));
    }
    await pause();
  }

  async function autoPostReactionFlow() {
    const { postUrl, reactionType, count } = await inquirer.prompt([
      { name: 'postUrl', message: chalk.blue('Enter post URL:') },
      { name: 'reactionType', message: chalk.blue('Reaction type (LIKE/LOVE/HAHA/WOW/SAD/ANGRY):') },
      { name: 'count', message: chalk.blue('How many times to react?'), validate: input => !isNaN(input) }
    ]);
    const token = await getLatestToken();
    if (!token) {
      console.log(chalk.red('No access token found. Please obtain one first.'));
      return await pause();
    }
    const postId = convertPostLink(postUrl);
    if (!postId) {
      console.log(chalk.red('Invalid post URL!'));
      return await pause();
    }
    for (let i = 0; i < parseInt(count); i++) {
      await new Promise(res => setTimeout(res, 1000));
      const url = `https://graph.facebook.com/v19.0/${postId}/reactions`;
      try {
        const res = await require('axios').post(url, require('querystring').stringify({
          type: reactionType.toUpperCase(),
          access_token: token
        }));
        if (res.status === 200) {
          console.log(chalk.magenta('Successfully reacted to post!'));
        } else {
          console.log(chalk.red(`Failed: ${res.data?.error?.message || 'Unknown error'}`));
        }
      } catch (err) {
        console.log(chalk.red(`Error: ${err.message}`));
      }
    }
    await pause();
  }

  async function autoCommentReactionFlow() {
    const { commentUrl, reactionType, count } = await inquirer.prompt([
      { name: 'commentUrl', message: chalk.blue('Enter comment URL:') },
      { name: 'reactionType', message: chalk.blue('Reaction type (LIKE/LOVE/HAHA/WOW/SAD/ANGRY):') },
      { name: 'count', message: chalk.blue('How many times to react?'), validate: input => !isNaN(input) }
    ]);
    const token = await getLatestToken();
    if (!token) {
      console.log(chalk.red('No access token found. Please obtain one first.'));
      return await pause();
    }
    const commentId = extractCommentIdFromUrl(commentUrl);
    if (!commentId) {
      console.log(chalk.red('Invalid comment URL!'));
      return await pause();
    }
    for (let i = 0; i < parseInt(count); i++) {
      await reactToComment(token, commentId, reactionType.toUpperCase());
      await new Promise(res => setTimeout(res, 1000));
    }
    await pause();
  }

  async function autoPostCommentFlow() {
    const { postUrl, message, count } = await inquirer.prompt([
      { name: 'postUrl', message: chalk.blue('Enter post URL:') },
      { name: 'message', message: chalk.blue('Enter comment message:') },
      { name: 'count', message: chalk.blue('How many times to post comment?'), validate: input => !isNaN(input) }
    ]);
    const token = await getLatestToken();
    if (!token) {
      console.log(chalk.red('No access token found. Please obtain one first.'));
      return await pause();
    }
    const postId = convertPostLink(postUrl);
    if (!postId) {
      console.log(chalk.red('Invalid post URL!'));
      return await pause();
    }
    for (let i = 0; i < parseInt(count); i++) {
      await postComment(token, postId, message);
      await new Promise(res => setTimeout(res, 1000));
    }
    await pause();
  }

  async function autoFollowUserFlow() {
    const { profileUrl, count } = await inquirer.prompt([
      { name: 'profileUrl', message: chalk.blue('Enter profile URL:') },
      { name: 'count', message: chalk.blue('How many times to subscribe?'), validate: input => !isNaN(input) }
    ]);
    const token = await getLatestToken();
    if (!token) {
      console.log(chalk.red('No access token found. Please obtain one first.'));
      return await pause();
    }
    const userId = extractUserIdFromUrl(profileUrl);
    if (!userId) {
      console.log(chalk.red('Invalid profile URL!'));
      return await pause();
    }
    for (let i = 0; i < parseInt(count); i++) {
      await followUser(token, userId);
      await new Promise(res => setTimeout(res, 1000));
    }
    await pause();
  }

  async function autoUnfollowUserFlow() {
    const { profileUrl, count } = await inquirer.prompt([
      { name: 'profileUrl', message: chalk.blue('Enter profile URL:') },
      { name: 'count', message: chalk.blue('How many times to unsubscribe?'), validate: input => !isNaN(input) }
    ]);
    const token = await getLatestToken();
    if (!token) {
      console.log(chalk.red('No access token found. Please obtain one first.'));
      return await pause();
    }
    const userId = extractUserIdFromUrl(profileUrl);
    if (!userId) {
      console.log(chalk.red('Invalid profile URL!'));
      return await pause();
    }
    for (let i = 0; i < parseInt(count); i++) {
      await unfollowUser(token, userId);
      await new Promise(res => setTimeout(res, 1000));
    }
    await pause();
  }

  async function autoSharePostFlow() {
    const { postUrl, count } = await inquirer.prompt([
      { name: 'postUrl', message: chalk.blue('Enter post URL:') },
      { name: 'count', message: chalk.blue('How many times to share?'), validate: input => !isNaN(input) }
    ]);
    const token = await getLatestToken();
    if (!token) {
      console.log(chalk.red('No access token found. Please obtain one first.'));
      return await pause();
    }
    const postId = convertPostLink(postUrl);
    if (!postId) {
      console.log(chalk.red('Invalid post URL!'));
      return await pause();
    }
    for (let i = 0; i < parseInt(count); i++) {
      await sharePost(token, postId);
      await new Promise(res => setTimeout(res, 1000));
    }
    await pause();
  }

  async function pause() {
    await inquirer.prompt([{ name: 'continue', message: chalk.blue('Press Enter to continue...') }]);
  }

  async function mainMenu() {
    const { option } = await inquirer.prompt([
      {
        type: 'list',
        name: 'option',
        message: chalk.blue('Choose an option:'),
        choices: [
          { name: '1: Token Getter (Email & Password)', value: '1' },
          { name: '2: Auto Post Reaction', value: '2' },
          { name: '3: Auto Comment Reaction', value: '3' },
          { name: '4: Auto Post Comment', value: '4' },
          { name: '5: Auto Follow User', value: '5' },
          { name: '6: Auto Unfollow User', value: '6' },
          { name: '7: Auto Share Post', value: '7' },
          { name: '8: Exit', value: '8' }
        ]
      }
    ]);

    switch (option) {
      case '1':
        await tokenGetterFlow();
        break;
      case '2':
        await autoPostReactionFlow();
        break;
      case '3':
        await autoCommentReactionFlow();
        break;
      case '4':
        await autoPostCommentFlow();
        break;
      case '5':
        await autoFollowUserFlow();
        break;
      case '6':
        await autoUnfollowUserFlow();
        break;
      case '7':
        await autoSharePostFlow();
        break;
      case '8':
        console.log(chalk.magenta('Exiting the program. Goodbye!'));
        process.exit(0);
      default:
        console.log(chalk.red('Invalid option!'));
    }
  }

  // Main loop
  while (true) {
    await mainMenu();
  }
})();
