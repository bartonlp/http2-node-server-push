var express = require('express');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const url = require('url');

var app = express();

const logger = require('morgan');

app.use(logger('dev'))

app.use((request, response, next) => {
  let urlName = url.parse(request.url).pathname.substr(1); // remove the /
  
  if(urlName === '' || urlName === '/') urlName = 'index.html';
  console.log('urlName:', urlName);

  // Make file an arry of items with 'src' or 'href'

  let file = fs.readFileSync(path.join(__dirname, 'public', `${urlName}`), {encoding: 'utf8'})
             .split('\n')
             .filter(line => line.match(/(?:src|href)\s*=\s*[\'\"](.*)[\'\"]/) != null)
             .map(line => line.match(/(?:src|href)\s*=\s*[\'\"](.*)[\'\"]/)[1]);

  // If there is something in the 'file' array
      
  if(file.length != 0) {
    let assets = file 
                 .filter(name => (name.substr(0,4)!='http'))
                 .map((fileToPush) =>
    {
      let fileToPushPath = path.join(__dirname, 'public', fileToPush);

      // return an anonomous function
      
      return (cb) => {
        if(fileToPushPath.length > 100) return cb();

        fs.readFile(fileToPushPath, (error, data) => {
          if(error) return cb(error);
          console.log('Will push: ', fileToPush, fileToPushPath);
          try {
            let m = mime.getType(path.extname(fileToPush));
            console.log("mime:", m);
            response.push(`/${fileToPush}`, {headers: {'Content-Type': m}}).end(data);
            cb();
          } catch(e) {
            cb(e);
          }
        });
      };
    });

    console.log('Total number of assets to push: ', assets.length);

    // Now we put the function for index into the assets array.
    
    assets.unshift((cb) => {
      fs.readFile(path.join(__dirname, 'public', urlName), (error, data) => {
        if(error) return cb(error);
        
        response.write(data);
        cb();
      });
    });
    
    require('neo-async').parallel(assets, () => {
      response.end();
    });
  } else {
    next();
  }
});

var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.bartonphillips.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.bartonphillips.com/fullchain.pem')
};

require('spdy')
.createServer(options, app)
.listen(8080, () => {
  console.log(`Server is listening on https://localhost:8080.
You can open the URL in the browser.`);
});