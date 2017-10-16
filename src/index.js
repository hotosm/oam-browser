import { render } from "react-dom";
import routes from "./routes";
import registerServiceWorker from "./registerServiceWorker";

import "styles/main.scss";
import "styles/mapbox.css";

render(routes, document.getElementById("page-canvas"));
registerServiceWorker();
