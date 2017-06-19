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

# author

joachim schiele <js@lastlog.de>
