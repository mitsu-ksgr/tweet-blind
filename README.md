Tweet Blind
===========

Chrome extension.
Blind the shitty tweet from your timeline.


## Todo
- Support Firefox
- Persistence of blocklist


## Installation
### Google Chrome

- Download/git clone this project
- Goto chrome://extensions/
- Click `Load unpacked` button
- Select TweetBlind directory


### Firefox
TODO: Currently, this extension does not seem to work in firefox 🤔

#### Make xpi file

```sh
$ cd PROJECT_DIR
$ zip -r ./TweetBlind.xpi ./*
```


## Developments
### Formatter / Linter

The following files are used only by the formatter/linter.

- package.json
- Dockerfile

We can run formatter/linter in a docker container.
do.sh is a helper script for this.

```sh
$ do.sh
> run formmater and linter.
```

