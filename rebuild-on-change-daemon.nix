{ config, pkgs, lib, ... } :

with lib;

let
  cfg = config.services.rebuild-on-change-daemon;
in
{
  options = {
  };

  config = lib.mkIf true {
    systemd.services.rebuild-on-change-daemon = {
      description   = "rebuild-on-change-daemon service";
      wantedBy      = [ "multi-user.target" ];
      after         = [ "network.target" ];

      script = ''
        # foo
        source /etc/profile
        ${pkgs.nodejs}/bin/node /etc/nixos/rebuild-on-change-daemon.js
      '';
      serviceConfig = {
        Restart = "always";
        KillSignal = "SIGINT";
      };
    };
  };
}

