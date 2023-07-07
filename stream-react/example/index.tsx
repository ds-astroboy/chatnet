import * as React from "react";
import * as ReactDOM from "react-dom";
import { StreamView } from "../.";


const App = () => {
  return (
    <div>
      <StreamView roomId="#group39:main.cafeteria.gg"/>
    </div>
  )
};

ReactDOM.render(<App />, document.getElementById("root"));
