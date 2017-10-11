# rebuild-on-change-daemon

with the `rebuild-on-change-daemon` a nixos-rebuild is issued when a change to `/etc/nixos/configuration.nix` is registered via `inotifywatch`.

# using the daemon

all you need to modify your `configuration.nix` like this:

    let
      rebuild-on-change-daemon = (import <nixpkgs>{}).pkgs.fetchgit { rev = "21a589bfb4c7cd158d524db19d025e616325f34a"; sha256="1wxpzslpxxal1rnl1bns37p93m2i4vaba8lwz0qafh1rmsiqkn4p"; url=https://github.com/nixcloud/rebuild-on-change-daemon;};
    in
    
    {
      imports =
        [ # Include the results of the hardware scan.
          ./hardware-configuration.nix
          "${rebuild-on-change-daemon}/rebuild-on-change-daemon.nix"   # this adds the service, so that it is started as systemd service

in case you want to use a more recent revision of `rebuild-on-change-daemon` just adapt the `rev` and `sha256` accordingly!

# monitoring of changes

    journalctl  -u rebuild-on-change-daemon.service -f -o cat

# hacking

as root:

    nix-shell -p nodejs
    systemctl stop rebuild-on-change-daemon    # important
    node rebuild-on-change-daemon.js

then:

    touch /etc/nixos/configuration.nix

should trigger a rebuild

# license

    Copyright (c) 2017, joachim schiele <js@lastlog.de>
    All rights reserved.
    
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
    
    1. Redistributions of source code must retain the above copyright notice, this
       list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
    
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
    ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    
    The views and conclusions contained in the software and documentation are those
    of the authors and should not be interpreted as representing official policies,
    either expressed or implied, of the FreeBSD Project.

# author

joachim schiele <js@lastlog.de>
