Cafeteria.gg
=======

Cafeteria.gg is an innovative chat platform natively infused with the latest crypto-tech to bring a new and exciting community driven experience.

Getting Started
===============

```
git clone https://github.com/Cafeteria-gg/chat.git
```

Setting up a dev environment
============================

First build `stream-react`:
``` bash
pushd stream-react
yarn link
yarn install
popd
```

Then build `matrix-js-sdk`:

``` bash
pushd matrix-js-sdk
yarn link
yarn install
popd
```

Then similarly with `matrix-react-sdk`:

```bash
pushd matrix-react-sdk
yarn link
yarn link stream-react
yarn link matrix-js-sdk
yarn install
popd
```

Finally, build and start Element itself:

```bash
cd element-web
yarn link matrix-js-sdk
yarn link matrix-react-sdk
yarn install
yarn reskindex
yarn start
```


Wait a few seconds for the initial build to finish; you should see something like:
```
[element-js] <s> [webpack.Progress] 100%
[element-js]
[element-js] ℹ ｢wdm｣:    1840 modules
[element-js] ℹ ｢wdm｣: Compiled successfully.
```
   Remember, the command will not terminate since it runs the web server
   and rebuilds source files when they change. This development server also
   disables caching, so do NOT use it in production.

Open http://127.0.0.1/ in your browser to see your newly built Cafeteria.gg.
