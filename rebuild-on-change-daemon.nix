{ config, pkgs, lib, ... } :

# https://github.com/NixOS/nixpkgs/blob/release-17.03/nixos/modules/installer/tools/auto-upgrade.nix

with lib;

let
  cfg = config.services.rebuild-on-change-daemon;
  rebuild-on-change-daemon = pkgs.stdenv.mkDerivation {
    name = "rebuild-on-change-daemon";
    src = ./.;
    buildInputs = [ pkgs.inotify-tools ];
    installPhase = ''
      mkdir $out
      cp rebuild-on-change-daemon.js $out/
    '';
  };
in
{
  options = {
  };

  config = lib.mkIf true {
    systemd.services.rebuild-on-change-daemon = {
      description   = "rebuild-on-change-daemon service";
      #wantedBy      = [ "multi-user.target" ];
      #after         = [ "network.target" ];

      restartIfChanged = false;
      unitConfig.X-StopOnRemoval = false;

      environment = config.nix.envVars //
        { inherit (config.environment.sessionVariables) NIX_PATH;
          HOME = "/root";
        };

      script = ''
        source /etc/profile
        ${pkgs.nodejs}/bin/node ${rebuild-on-change-daemon}/rebuild-on-change-daemon.js
      '';
      serviceConfig = {
        Restart = "always";
      #  #KillSignal = "SIGINT";
      };
    };
  };
}

