# stream-react

This component has to be installed inside `node_modules` and can be used like this:

```js
import { StreamView } from 'stream-react';

<StreamView roomId="#group39:main.cafeteria.gg"/>
```

It requires the `bootstrap` css framework and the `Inter` font family within your `index.html <head>` tag. 

You can add the following code, if it's not already included:

```html
  <!-- Bootstrap -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
  
  <!-- FONTS -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:500,600,900">     
```

Please look at the `design` folder for a reference screenshot of how it should look like in the final implementation.