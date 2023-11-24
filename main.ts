import { webserver } from "./libs/webserver";
import { config } from "./local";

webserver.listen(config.webserver.port, "0.0.0.0", () => {
  console.log("Server is running at http://127.0.0.1:" + config.webserver.port);
});
