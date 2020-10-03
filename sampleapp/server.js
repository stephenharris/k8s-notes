const http = require('http'),
      fs = require('fs');

const handler = (request, response) => {
  fs.readFile('/etc/config/settings.json', 'UTF-8', async (err, fileData) => {
    let appVersion = await fs.promises.readFile('/app_version');
    if (err) {
        console.log(err);
        response.writeHead(500, {"Content-Type": "text/html"});
        response.write("Error: " + err.message);
        response.end();
        return;
    }
    else {
      let foo = JSON.parse(fileData).foo;
      response.writeHead(200, {"Content-Type": "text/html"});
      response.write("POD: " + process.env.HOSTNAME + "<br/>"); 
      response.write("VERSION: " + appVersion + "<br/>"); 
      response.write("'ENEMIES' (from env variable): " + process.env.NUM_ENEMIES + '<br />');
      response.write("'TEA_OR_CAKE_OR_DEATH' (from env variable): " + process.env.TEA_OR_CAKE_OR_DEATH + '<br />');
      response.write("'foo' (from volume): " + foo);
      response.write("'MY_PASSWORD' secret (from env varaible): " + process.env.MY_PASSWORD);
      
      response.end();
    }
  });
};

const www = http.createServer(handler);
www.listen(9000);
