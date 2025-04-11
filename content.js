/*****************************************************************************
 *
 *  TweetBlind
 *
 *****************************************************************************/

const HiddenTweetKeys = "hidden_tweets";
const AutoReleasePeriod = 24 * 7; // [hour] default 1 week

const TweetBlindButtonClassName = "btn-blind-tweet";
const TemporaryTweetClassName = "temp-tweet";

//-----------------------------------------------------------------------------
// Hidden tweet management.
//-----------------------------------------------------------------------------
const blinder = new (class {
  #lsKey = "tweetblinet_hiddentweets";

  constructor() {}

  allHiddenTweets() {
    return JSON.parse(localStorage.getItem(this.#lsKey) || "[]");
  }

  dump() {
    const hts = this.allHiddenTweets();
    console.log("----- Hidden Tweet List -----");
    for (let i = 0; i < hts.length; ++i) {
      const ht = hts[i];
      console.log(`ID: ${ht.id} (${new Date(ht.ts).toISOString()})`);
    }
    console.log("-----------------------------");
  }

  hideTweet(tweetId) {
    const hts = this.allHiddenTweets();
    if (!hts.find(item => item.id === tweetId)) {
      hts.push({
        id: tweetId,
        ts: Date.now(), // Blind Timestamp
      });
      localStorage.setItem(this.#lsKey, JSON.stringify(hts));
    }
  }

  releaseTweet(tweetId) {
    const hts = this.allHiddenTweets().filter(item => item.id !== tweetId);
    localStorage.setItem(this.#lsKey, JSON.stringify(hts));
  }
})();


//-----------------------------------------------------------------------------
// Auto release
//-----------------------------------------------------------------------------
function hasHoursPassed(timestamp, n_hour) {
  const now = Date.now();
  const n = n_hour * 60 * 60 * 1000;
  return now - timestamp >= n;
}

function autoRelease() {
  const hts = blinder.allHiddenTweets();

  for (let i = 0; i < hts.length; ++i) {
    const ht = hts[i];

    if (hasHoursPassed(ht.ts, AutoReleasePeriod)) {
      blinder.releaseTweet(ht.id);
    }
  }
}

//-----------------------------------------------------------------------------
// Element maker
//-----------------------------------------------------------------------------
function makeTweetBlindButton(listener) {
  const div = document.createElement("div");
  div.style.width = "1.25em";
  div.style.padding = "0px";
  div.style.marginLeft = "0.75em";

  const btn = document.createElement("button");
  btn.className = TweetBlindButtonClassName;
  btn.textContent = "🈲"; // Emoji of "禁"
  btn.style.padding = "0px";
  btn.style.textAlign = "center";
  btn.addEventListener("click", listener);

  div.appendChild(btn);
  return div;
}

function makeTempTweet(listener) {
  const div = document.createElement("div");
  div.className = TemporaryTweetClassName;
  div.style.padding = "30px";
  div.style.textAlign = "center";

  const p = document.createElement("p");
  p.textContent = "Hidden Tweet";
  p.style.margin = "auto";
  div.appendChild(p);

  const btn = document.createElement("button");
  btn.textContent = "Release";
  btn.addEventListener("click", listener);
  div.appendChild(btn);

  return div;
}

//-----------------------------------------------------------------------------
// Methods vulnerable to Twitter changes.
//-----------------------------------------------------------------------------
function getTweetIdFromArticle(article) {
  const atag = article.querySelector("a[href*='/status/']");
  if (!atag) {
    return "";
  }

  const xid = atag.href.split("/status/")[1];
  return xid ? xid : "";
}

function addBlindButtonToTweetElement() {
  //const tl = document.querySelector('[aria-label="Home timeline"]');
  const tl_selectors = [
    '[aria-label="Timeline: Your Home Timeline"]',
    '[aria-label="タイムライン: ホームタイムライン"]'
  ].join(',');
  const tl = document.querySelector(tl_selectors);
  if (!tl) return;

  const hts = blinder.allHiddenTweets();
  const tweets = tl.firstChild.children;
  for (let i = 0; i < tweets.length; ++i) {
    const tw = tweets[i];

    const article = tw.querySelector("article");
    if (!article) {
      continue;
    }

    // Get tweet-id from article.
    const twid = getTweetIdFromArticle(article);
    if (twid === "") {
      continue;
    }

    // Hidden tweet.
    const art_p = article.parentNode;
    const art_pp = article.parentNode.parentNode;
    if (hts.find(item => item.id === twid)) {
      art_p.style.display = "none";
      if (!art_pp.querySelector(`.${TemporaryTweetClassName}`)) {
        art_pp.appendChild(
          makeTempTweet(() => {
            blinder.releaseTweet(twid);
          }),
        );
      }
    } else {
      art_p.style.display = "flex";
      const tmp_tw = art_pp.querySelector(`.${TemporaryTweetClassName}`);
      if (tmp_tw) {
        tmp_tw.remove();
      }
    }

    // Get the div of the button group (reply, retweet, fav, etc buttons...).
    const btn_reply = tw.querySelector('[data-testid="reply"]');
    const div_btns = btn_reply?.parentNode?.parentNode;
    if (!div_btns) {
      continue;
    }

    // Skip if the blind button already added.
    const bt_btn = div_btns.querySelector(`.${TweetBlindButtonClassName}`);
    if (bt_btn) {
      continue;
    }

    // Make button
    const btn = makeTweetBlindButton(() => {
      blinder.hideTweet(twid);
    });
    div_btns.appendChild(btn);
  }
}

//-----------------------------------------------------------------------------
// Content functions.
//-----------------------------------------------------------------------------
function update() {
  autoRelease();
  addBlindButtonToTweetElement();
}

function main() {
  blinder.dump();
  window.setInterval(update, 1000);
}

// Entrypoint.
if (document.readyState !== "loading") {
  window.setTimeout(main, 3000);
} else {
  document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(main, 1000);
  });
}
