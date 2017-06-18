// TODO
// - `entprellen` (when using vim it will spawn to events on saving) so we need a 1 second event window normalizer
// - package with nix
// - package as nix service
//  - if 'nixos-rebuild' switch is called from daemon it will stop rebuild-on-change-daemon.service and it seems to build a different system?! why?

// not urgent (optimization):
// - fix bug: when using readlinkFunction it won't recutn a correct drv path but instead the readlinkFunction result which is wrong
// - fix /var/run/current-system check, nix-build actually always outputs something else than nixos-rebuild switch, why?

const { spawn } = require('child_process');

const inotifywait = spawn('inotifywait', [ '-mq', '-e', 'close_write,moved_to,create', '--format', '%f', '/etc/nixos/' ]);

inotifywait.stdout.on('data', function(data) {
  var str = "" + data;
  if (str.trim() === "configuration.nix") {
    update(str.trim());
  };
  //console.log('stdout: "' + data +"'" );
});
inotifywait.stderr.on('data', function(data) { console.log('inotifywait stderr: ' + data); });
inotifywait.on('close', function(code) { console.log('inotifywait closing code: ' + code); });

update();


var nixStore = null;
var nixosRebuild = null;

function update() {
  console.log("update");

  // nix-instantiate is used to create the drv (no compiling/downloading -> would be done by nix-store later on)
  function nixInstantiateFunction() { 
    return new Promise(function(resolve, reject) {
      var nixInstantiate = spawn('nix-instantiate', [ '--indirect', '-A', 'system', '<nixpkgs/nixos>' ]);
      nixInstantiate.stdout.on('data', function(data) { 
        var drv = (""+data).match('/nix/store/.*drv');   
        console.log('nix-instantiate: drv="' + drv + "\"");
        //process.stdout.write('stdout: ' + data); 
        resolve(drv);
      });
      nixInstantiate.stderr.on('data', function(data) { process.stdout.write('nix-instantiate stderr: ' + data); });
      nixInstantiate.on('close', function(code) { 
        console.log('nix-instantiate closing code: ' + code); 
      });
    });
  };

  // in /var/run/current-system one can see which is the current build in use
  //function readlinkFunction(data) {
  //  return new Promise(function(resolve, reject) {
  //    var readlink = spawn('readlink', [ '/var/run/current-system' ]);
  //    readlink.stdout.on('data', function(data) {
  //      var link= (""+data);
  //      console.log('readlink points to ' + link);
  //    });
  //    readlink.stderr.on('data', function(data) { process.stdout.write('readlink stderr: ' + data); });
  //    readlink.on('close', function(code) {
  //      console.log('readlink closing code: ' + code);
  //      // just pass the drv on to nix-store...
  //      resolve(data); 
  //    });
  //  });
  //};

  // this nix-store call evaluates the drv which basically starts the downloading/compiliation of the whole system
  function storeFunction(data) { 
    return new Promise(function(resolve, reject) {
      if (nixStore !== null) {
        console.log("nix-store compling for old configuration.nix still in progress, killing it for reevaluation!");
        nixStore.stdin.pause();
        nixStore.kill();
        nixStore = null;
      }
      console.log("flux: " + data);
      nixStore = spawn('nix-store', [ '--indirect', '-r', '-k', data ]);
      nixStore.stdout.on('data', function(data) { process.stdout.write('nix-store stdout: ' + data); });
      nixStore.stderr.on('data', function(data) { process.stdout.write('nix-store stderr: ' + data); });
      nixStore.on('close', function(code) { 
        console.log('nix-store closing code: ' + code); 
        nixStore = null;
        var r = parseInt(code);
        if (typeof(r) === "number" && r == 0) {
          console.log("nix-store success, continuing with nixos-rebuild switch");
          resolve();
        } else {
          // if you hit this, you probably have to adapt the logic above 
          // this should also be called if nix-store got killed by a more recent rebuild
          console.log("nix-store failure, not continuing with nixos-rebuild switch");
          reject();
        }
      });
    });
  };

  nixInstantiateFunction()
    //.then(data => readlinkFunction(data), function(data) { console.log("readlink error: " + data); })
    .then(data => storeFunction(data), function(data) { console.log("nix-instantiate error: " + data); })
    .then(function() 
      {
        nixosRebuild = spawn('nixos-rebuild', [ 'switch' ]);
        nixosRebuild.stdout.on('data', function(data) { process.stdout.write('nixos-rebuild stdout: ' + data); });
        nixosRebuild.stderr.on('data', function(data) { process.stdout.write('nixos-rebuild stderr: ' + data); });
        nixosRebuild.on('close', function(code) { 
          console.log('nixos-rebuild closing code: ' + code); 
           nixosRebuild = null;
        });
      }, function() {
        console.log("nix-store error");
      }
    );
}


