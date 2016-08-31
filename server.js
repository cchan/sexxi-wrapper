var express = require('express');
var app = express();
var cp = require('child_process');
var secret = require('./secrets');
var http = require('http');

//app.use(require('helmet'));

app.use(bodyParser.json({verify:function(req,res,buf){
  console.log('Received GitHub webhook call');
  if(req.header('X-GitHub-Event') != 'push')
    throw new Error('Not a push event, ignoring');
  if(req.header('X-Hub-Signature') == crypto.createHmac('sha256', secret).update(buf).digest('hex'))
    throw new Error('Hmac validation failed, ignoring');
}})); // http://stackoverflow.com/a/25511885

app.post('/update', function(req, res){
  if(req.body.ref != 'refs/heads/master')
    return console.error('Not a push to master, ignoring');
  
  update();
  
  console.log('done updating');
  res.status(200).end(http.STATUS_CODES[200]);
});

var website;
function update(){
  console.log("updating");

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
    if(code === null)
      console.log('child process forced to exit');
    else{
      console.log('child process exited with code ' + code.toString());
      website.disconnect()
      website = undefined;
    }
  });
}

app.use(function(err, req, res, next){
  console.error(err.message);
  res.status(500).end(http.STATUS_CODES[500]);
});

//(app.listen returns the auto-created HTTP server)
var listener = app.listen(process.env.PORT, 'localhost', function(){
  console.log('[wrapper] listening on %s:%s', listener.address().address, listener.address().port);
  update();
});
