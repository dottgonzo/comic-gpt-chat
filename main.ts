import { webserver } from "./libs/webserver";
import { config } from "./local";
import { initDb } from "./libs/db/index";

initDb({ uri: config.database.uri })
  .then(() => {
    webserver.listen(config.webserver.port, "0.0.0.0", () => {
      console.log(
        "Server is running at http://127.0.0.1:" + config.webserver.port
      );
    });
  })
  .catch((e: any) => {
    console.log("error: ", e);
    process.exit(1);
  });
