var express = require('express');
var app = express();
var cp = require('child_process');

app.use(require('helmet'));

var website;

function update(){
  if(typeof website != "undefined"){
    website.kill();
    website.disconnect();
  }

  console.log(cp.execSync('./update').toString());

  website = cp.fork('./website/src/server.js', [], { silent: true });

  website.stdout.on('data', function (data) {
    console.log('[child] stdout: ' + data.toString());
  });

  website.stderr.on('data', function (data) {
    console.log('[child] stderr: ' + data.toString());
  });

  website.on('exit', function (code) {
    console.log('child process exited with code ' + code.toString());
    website.disconnect()
    website = undefined;
  });
}

app.post('/update', update);

app.listen('61792', 'localhost', function(){
  console.log('[wrapper] listening 61792');
  update();
});
