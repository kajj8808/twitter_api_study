const { twitter_bearer_token } = require('./config.json');
const axios = require('axios');
const fs = require('fs');

let userIDList = {};

const get_detail = async (ids) => {
    result = await axios.get(
        `https://api.twitter.com/2/tweets?ids=${ids}&expansions=attachments.media_keys&media.fields=url`,
        { headers: { Authorization: `Bearer ${twitter_bearer_token}` } }
    );
    const images = [];
    const result_data = result.data;
    const { id, text } = result_data.data[0];
    const title = text.split('\n')[0].split('#프리코네R #4컷만화 ')[1];
    try {
        result_data.includes.media.map((media) => {
            const { url: image_url } = media;
            images.push(`${image_url.split('.jpg')[0]}?format=jpg&name=orig`);
        });
        return { id, title, images };
    } catch (media_is_undifined) {
        return { id, title, images };
    }
};

const saveUserID = (userName, userID) => {
    userIDList[userName] = userID;
    fs.writeFileSync(
        'userData/userData.json',
        JSON.stringify(userIDList),
        'utf-8'
    );
    return;
};

const loadUserID = () => {
    const fileData = fs.readFileSync('userData/userData.json', 'utf-8');
    userIDList = JSON.parse(fileData);
};

const getUserID = async (userName) => {
    result = await axios.get(
        `https://api.twitter.com/2/users/by?usernames=${userName}&user.fields=created_at&expansions=pinned_tweet_id&tweet.fields=author_id,created_at`,
        { headers: { Authorization: `Bearer ${twitter_bearer_token}` } }
    );
    const { id } = result.data.data[0];
    saveUserID(userName, id);
    return id;
};

const getTimeLines = async (userID) => {
    result = await axios.get(
        `https://api.twitter.com/2/users/${userID}/tweets`,
        { headers: { Authorization: `Bearer ${twitter_bearer_token}` } }
    );
    return result.data.data;
};

const getFourCutManga = async () => {
    const findName = 'priconne_kr';
    loadUserID();
    let id = '';
    for (userName of Object.keys(userIDList)) {
        if (userName === findName) {
            id = userIDList[userName];
        } else {
            id = await getUserID(findName);
        }
    }
    const timeLines = await getTimeLines(id);
    const fourCutMangas = timeLines.filter(
        (timeLine) => timeLine.text.split('#')[2] === '4컷만화 '
    );
    const fourCutManga = await get_detail(fourCutMangas[0].id);
    return fourCutManga;
};

module.exports = getFourCutManga;
