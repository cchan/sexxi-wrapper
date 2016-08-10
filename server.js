let express = require('express');
let app = express();
let cp = require('child_process');

app.use(require('helmet'));

var website;

function update(){
  if(typeof website != "undefined"){
    website.kill();
    website.disconnect();
  }

  cp.execSync('./update');

  website = cp.fork('website/src/server.js', function(err, stdout, stderr){
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if(err)
      console.log('exec err: ' + err);
    res.send('done');
  });

  website.stdout.pipe(process.stdout);
  website.stderr.pipe(process.stderr);
});

app.post('/update', update);

app.listen('61792', 'localhost', function(){
  console.log('[watcher] listening 61792');
  update();
});
