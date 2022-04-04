import fetch from "node-fetch";
import fs from "fs";
const NEWYEAR = new Date('2021-01-01');
const USERS = ['32638245','2534276', '28811015', '23822225', '28811014', '11204473',
               '12847224', '15759353', '2361473', '28739167', '28739168', '28811019', 
               '38815937', '39447265', '43483924', '28739166' ];
const PHOTOS_PER_USER = 10;
let photoData = {};
let lastDate = 0;
let lastMessage;
async function getData() {
  let response
  console.log('start');
  if (lastDate === 0) {
    response = await fetch('https://api.groupme.com/v3/groups/28217213/messages?token=xhNXQInycF8Lx0RYHusy4bwWCdfov0dK7GxJBDZj&limit=100');
  } else {
    response = await fetch(`https://api.groupme.com/v3/groups/28217213/messages?token=xhNXQInycF8Lx0RYHusy4bwWCdfov0dK7GxJBDZj&limit=100&before_id=${lastMessage}`);
  }
  //console.log(response);
  const data = await response.json();
  for (let message of data['response']['messages']) {
    lastDate = new Date(1000 * message['created_at']);
    lastMessage = message['id'];
    if (message['attachments'].length > 0 && USERS.includes(message['sender_id'])) {
      for (let attachment of message['attachments']) {
        if (attachment.hasOwnProperty('url') && !(attachment['url'].endsWith('mp4'))) {
          if (lastDate > NEWYEAR) {
            photoData[message['name']] = photoData[message['name']] || [];
            photoData[message['name']].push([attachment['url'], message['favorited_by'].length, message['sender_id']]);
            /*            photoData[message['id']] = {};
                        photoData[message['id']]['url'] = attachment['url'].trim();
                        photoData[message['id']]['month'] = lastDate.getMonth() + 1;
                        photoData[message['id']]['likes'] = message['favorited_by'].length;
                        photoData[message['id']]['user'] = message['name'].trim();
                        */
          }
        }
      }
    }
  }
}
;

do {
  await getData()
} while (lastDate > NEWYEAR);

let sortedByLike = {};
let userResults = {};
let maxLikes = []
sortByLike()
//populateUserResults();
//logBestUsers();
//console.log(photoData);
//console.log(maxLikes);I like the fact that you ask the user who should go first on each match. However, I think it makes sense for the other participant to play first on the second round, and then they can take turns. Additionally, consider allowing for uppercase input here. 
saveSortedToFile();
console.log('Complete');


function logBestUsers() {
  let sortedByAverage = []
  for (let user in userResults) {
    sortedByAverage.push([user, userResults[user]['average']]);
  }
  sortedByAverage.sort((a, b) => b[1] - a[1]);
  //console.log(sortedByAverage);
}

function populateUserResults() {
  for (let photo in photoData) {
    let user = photoData[photo]['user'];
    if (!userResults.hasOwnProperty(user)) {
      userResults[user] = { 'max': 0, 'entries': 0, 'total': 0 };
    }
    if (photoData[photo]['likes'] > userResults[user]['max']) {
      userResults[user]['max'] = photoData[photo]['likes'];
    }
    userResults[user]['total'] += photoData[photo]['likes'];
    userResults[user]['entries'] += 1;
  }
  for (let user in userResults) {
    userResults[user]['average'] = userResults[user]['total'] / userResults[user]['entries']
    userResults[user]['average'] = Math.round(userResults[user]['average'] * 100) / 100;
  }
}

function sortByLike() {
  for (let user in photoData) {
    photoData[user].sort((a, b) => b[1] - a[1])
  }
}

function saveSortedToFile() {
  for (let user in photoData) {
    for (let i = 0; i < PHOTOS_PER_USER; i += 1) {
      if (photoData[user][i]) {
        fs.appendFileSync(`${user}_photos.txt`, `${photoData[user][i][0]}\n`, (err) => {
          if (err) {
            console.log('err');
          }
        });
      }
    }
  }
}



/*
for (let photo in photoData) {
  fs.appendFileSync('links.txt', `${photoData[photo]['url']}\n`, (err) => {
    if (err) {
      console.log('err');
    }
  });
}
I like the fact that you ask the user who should go first on each match. However, I think it makes sense for the other participant to play first on the second round, and then they can take turns. Additionally, consider allowing for uppercase input here. 


function getData(firstPrevious) {
  fetch('https://api.groupme.com/v3/groups/28217213/messages?token=xhNXQInycF8Lx0RYHusy4bwWCdfov0dK7GxJBDZj&limit=100')
  .then(res => res.json())
  .then(data => x = data)
  .then(() => console.log(x));
}


const photos = require('./photos.json');
for (value of photos['response']['messages']) {
  if (value['attachments'].length > 0) {
    for (newval of value['attachments']) {
      console.log(newval['url'])
    }
  }
}
*/