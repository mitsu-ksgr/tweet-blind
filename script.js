/*****************************************************************************
 *
 *  TweetBlind for TweetDeck
 *
 *  - #TWITTER_SENSITIVE Tag
 *    - The code with this tag may stop working when Twitter is updated.
 *
 *****************************************************************************/

//-----------------------------------------------------------------------------
//  View Functions
//-----------------------------------------------------------------------------
const HIDE_BUTTON_CLASS = 'tdb-hide-button';
const HIDE_BUTTON_QUERY = `.${HIDE_BUTTON_CLASS}`;

function getTwContainers() {
  // #TWITTER_SENSITIVE
  return document.querySelectorAll(
    "div.js-chirp-container.chirp-container"
  );
};

function createHideButton() {
  // #TWITTER_SENSITIVE
  const btn = `
  <li class="${HIDE_BUTTON_CLASS} tweet-action-item position-rel pull-left margin-r--10">
    <a class="tweet-action" href="#">
      <i class="icon txt-right" style="font-style: normal;">
        👻
      </i>
      <span class="is-vishidden">Hide</span>
    </a>
  </li>
  `;

  const temp = document.createElement('template');
  temp.innerHTML = btn.trim();
  return temp.content.firstChild;
}



//-----------------------------------------------------------------------------
//  Timeline Watcher Class
//-----------------------------------------------------------------------------
class TimelineWatcher {
  constructor(timelineElement, callback = null) {
    this.container = timelineElement;
    this.observer = null;
    this.onChangeCallback = callback;

    this.#initObserver();
  }

  setOnChangeCallback(callback) {
    this.onChangeCallback = callback;
  }

  map(f) {
    const ret = [];
    for (const elem of this.container.children) {
      ret.push(f(elem));
    }
    return ret;
  }

  #initObserver(callback) {
    const config = {
      attributes: false, childList: true, subtree: false
    };
    this.observer = new MutationObserver((mutationList, observer) => {
      for (const mut of mutationList) {
        if (mut.type === 'childList') {
          if (this.onChangeCallback) {
            this.onChangeCallback();
          }
        }
      }
    });
    this.observer.observe(this.container, config);
  }
}



//-----------------------------------------------------------------------------
//  Blocklist Class
//  - Manage the block tweet id list.
//
//  TODO: Store block list to chrome.storage
//-----------------------------------------------------------------------------
class Blocklist {
  constructor() {
    this.blocklist = [];
  }

  block(id) {
    if (!this.isBlocked(id)) {
      this.blocklist.push(id);
    }
  }

  unblock(id) {
    const idx = this.blocklist.indexOf(id);
    if (idx !== -1) {
      this.blocklist.splice(idx, 1);
    }
  }

  isBlocked(id) {
    return (this.blocklist.indexOf(id) !== -1);
  }
}



//-----------------------------------------------------------------------------
//  TwDeckBlind
//  Blocklist Class
//  - Manage the block tweet id list.
//-----------------------------------------------------------------------------
class TwDeckBlind {
  constructor() {
    this.blocklist = new Blocklist();
    this.watchers = [];
  }

  registerTwContainer(container) {
    const tw = new TimelineWatcher(container);
    tw.setOnChangeCallback(() => {
      tw.map((e) => { this.onUpdateTweetElement(e); });
    });
    tw.map((e) => { this.onUpdateTweetElement(e); }); // init
    this.watchers.push(tw);
  }

  onClickHideButton(event, element, key) {
    if (this.blocklist.isBlocked(key)) {
      this.blocklist.unblock(key);
    } else {
      this.blocklist.block(key);
    }

    this.onUpdateTweetElement(element);
  }

  onUpdateTweetElement(element) {
    const key = element.dataset.key;

    // Add the hide button if not added yet.
    if (!element.querySelector(HIDE_BUTTON_QUERY)) {
      const footer_ul = element.querySelector('.js-tweet-actions'); // #TWITTER_SENSITIVE
      if (footer_ul) {
        const hide_btn = createHideButton();
        hide_btn.addEventListener('click', (event) => {
          this.onClickHideButton(event, element, key);
        }, false);
        footer_ul.appendChild(hide_btn);
      }
    }

    // Update opacity.
    if (this.blocklist.isBlocked(key)) {
      element.style.opacity = 0.03;
    } else {
      element.style.opacity = 1;
    }
  }
}



//-----------------------------------------------------------------------------
//  Entrypoint
//-----------------------------------------------------------------------------
function main() {
  //console.log("TweetBlind for TweetDeck: Start");
  const tdb = new TwDeckBlind();
  for (const container of getTwContainers()) {
    tdb.registerTwContainer(container);
  }
};


if (document.readyState !== 'loading') {
  window.setTimeout(main, 3 * 1000);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(main, 1 * 1000);
  });
}

