let express = require('express');
let app = express();
let cp = require('child_process');

app.use(require('helmet'));

let website;

app.post('/update', function(req,res){
  if(typeof website != "undefined"){
    website.kill();
    website.disconnect();
  }

  website = cp.fork('cd website && git pull && pm2 restart sexxi.xyz', function(err, stdout, stderr){
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if(err)
      console.log('exec err: ' + err);
    res.send('done');
  });

  cp.stdout.pipe(process.stdout);
  cp.stderr.pipe(process.stderr);
});

app.listen('61792', 'localhost', function(){
  console.log('[watcher] listening 61792');
});
